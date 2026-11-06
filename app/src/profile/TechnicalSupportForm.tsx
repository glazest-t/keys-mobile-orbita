import {useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {Button,Icon} from '../ui';
import {useKeyboard} from '../mobile';
import type {State,User} from '../state';
import type {Commerce} from '../booking/model';
import {submitSupport} from './support';

export function TechnicalSupportForm({state,setState,commerce,user,onBack}:{state:State;setState:Dispatch<SetStateAction<State>>;commerce:Commerce;user:User;onBack:()=>void}){
 const [text,setText]=useState(user.supportDraft?.text||''),[error,setError]=useState(''),[done,setDone]=useState(false);
 const id=useRef(crypto.randomUUID()),keyboard=useKeyboard();
 const change=(value:string)=>{setText(value);setError('');setState(s=>({...s,users:{...s.users,[user.phone]:{...s.users[user.phone],supportDraft:{topic:'Приложение',text:value}}}}));};
 if(done)return <section className="technical-support-success k-card" role="status"><span className="icon-tile"><Icon name="check" inheritColor/></span><h2>Заявка создана</h2><p>Ваше обращение сохранено.</p><Button onClick={onBack}>В профиль</Button></section>;
 return <form className="technical-support-form" onSubmit={event=>{event.preventDefault();if(done)return;try{const next=submitSupport(state,commerce,user.phone,id.current,{topic:'Приложение',text});setState(next);keyboard.hide();setDone(true);}catch(e){setError((e as Error).message);}}}>
  <div className="k-card technical-support-fields"><label htmlFor="technical-support-text">Опишите проблему</label><p>Расскажите, что произошло и на каком экране.</p><textarea id="technical-support-text" value={text} onChange={e=>change(e.target.value)} placeholder="Что случилось?" maxLength={2000} aria-describedby="technical-support-hint" aria-invalid={!!error}/><small id="technical-support-hint">От 10 до 2 000 символов · {text.length}/2000</small>{error&&<p className="field-error" role="alert">{error}</p>}</div>
  <Button type="submit" disabled={text.trim().length<10}>Отправить заявку</Button>
 </form>;
}
