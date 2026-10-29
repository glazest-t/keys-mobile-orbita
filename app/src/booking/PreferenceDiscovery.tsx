import {useState,type CSSProperties} from 'react';
import {KeyboardTextarea,useKeyboard,useKeyboardInsets} from '../mobile';
import {Button,Icon} from '../ui';
import {IdeaCardChange} from '../interactions';
import {interests,type PreferenceDraft} from './preferences';
import {holidayIdeas,nextHolidayIdea,answerHolidayIdea,undoHolidayIdea,parsePreferenceWish,applyPreferenceWish,WISH_LIMIT,type IdeaAnswer} from './preferenceIdeas';

export function PreferenceIdeas({draft:d,onChange}:{draft:PreferenceDraft;onChange:(d:PreferenceDraft)=>void}){
 const idea=nextHolidayIdea(d),[direction,setDirection]=useState(1),[busy,setBusy]=useState(false),{availableHeight}=useKeyboardInsets();
 const respond=(answer:IdeaAnswer)=>{if(!idea||busy)return;setBusy(true);setDirection(answer==='want'?1:-1);onChange(answerHolidayIdea(d,idea.id,answer));};
 return <section className="preference-ideas" style={{'--idea-available-height':`${availableHeight}px`} as CSSProperties}>
  {idea?<><div className="preference-idea-stack"><i/><i/><IdeaCardChange id={idea.id} direction={direction} onReady={()=>setBusy(false)}><img src={'/brand/ideas/covers/'+idea.cover+'.webp'} alt=""/><span className="preference-idea-tag">{idea.tag}</span><div className="preference-idea-copy"><h2>{idea.title}</h2><p>{idea.text}</p></div></IdeaCardChange></div>
  <div className="preference-idea-actions"><button className="text-action" disabled={busy} onClick={()=>respond('no')}><span><Icon name="close" size={26} inheritColor/></span>Не моё</button><button className="text-action want" disabled={busy} onClick={()=>respond('want')}><span><Icon name="heart" size={26} inheritColor/></span>Хочу</button></div>
  <div className="preference-idea-meta"><button onClick={()=>{setBusy(true);setDirection(-1);onChange(undoHolidayIdea(d));}} disabled={busy||!d.ideaHistory?.length}>Вернуть предыдущую</button><span>{Object.keys(d.ideaAnswers||{}).length+1} / {holidayIdeas.length}</span><button disabled={busy} onClick={()=>respond('skip')}>Пропустить</button></div></>:<div className="preference-ideas-complete"><Icon name="check" size={32}/><h2>Идеи закончились</h2><p>Посмотрите подобранные отели или уточните интересы в темах.</p><Button variant="secondary" onClick={()=>onChange({...d,discoveryMode:'themes'})}>Перейти к темам</Button><Button variant="ghost" onClick={()=>{setBusy(false);onChange(undoHolidayIdea(d));}}>Вернуть предыдущую</Button></div>}
 </section>;
}

export function PreferenceWish({draft:d,onChange,onClose,submitLabel='Применить пожелания',validationError,onApply}:{draft:PreferenceDraft;onChange:(d:PreferenceDraft)=>void;onClose:()=>void;submitLabel?:string;validationError?:string;onApply?:(d:PreferenceDraft)=>void}){
 const keyboard=useKeyboard(),[unchecked,setUnchecked]=useState<string[]>(()=>d.wishAppliedText===d.wishText?.trim()?parsePreferenceWish(d.wishText||'').interests.filter(id=>!d.wishInterests?.includes(id)||d.dismissedInterests?.includes(id)):[]),[error,setError]=useState('');
 const parsed=parsePreferenceWish(d.wishText||''),selected=parsed.interests.filter(id=>!unchecked.includes(id));
 return <form className="sheet-body preference-wish" onSubmit={e=>{e.preventDefault();try{if(validationError)throw Error(validationError);const next=applyPreferenceWish(d,selected);keyboard.hide();(onApply||onChange)(next);onClose();}catch(e){setError((e as Error).message);}}}>
  <KeyboardTextarea aria-label="Опишите свой отдых" maxLength={WISH_LIMIT} value={d.wishText||''} placeholder="Хочу тихий отель у моря, с бассейном и завтраками" onChange={e=>{setUnchecked([]);setError('');onChange({...d,wishText:e.target.value});}}/>
  <small className="preference-wish-count">{(d.wishText||'').length} / {WISH_LIMIT}</small>
  {parsed.interests.length>0&&<section><h3>Учтём в подборе</h3><div className="preference-wish-options">{parsed.interests.map(id=><button type="button" key={id} aria-pressed={selected.includes(id)} onClick={()=>setUnchecked(unchecked.includes(id)?unchecked.filter(v=>v!==id):[...unchecked,id])}><Icon name={selected.includes(id)?'check':'plus'} size={16} inheritColor/>{interests.find(i=>i.id===id)?.title}</button>)}</div></section>}
  {error&&<p role="alert" className="field-error">{error}</p>}
  <Button type="submit" disabled={!d.wishText?.trim()||(!parsed.interests.length&&!d.wishInterests?.length)}>{submitLabel}</Button>
  {d.source!=='text'&&!!d.wishInterests?.length&&<Button type="button" variant="ghost" onClick={()=>{keyboard.hide();onChange({...d,wishAppliedText:'',wishInterests:[]});onClose();}}>Не учитывать текст</Button>}
 </form>;
}
