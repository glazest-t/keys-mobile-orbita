import {useEffect,useRef,useState} from 'react';
import {BottomSheet} from '../mobile';
import {Button,Icon} from '../ui';
import {readProblemPhoto} from '../booking/problemPhoto';
import './photo.css';

export function ProfilePhoto({name,photo,onSave}:{name:string;photo?:string;onSave:(photo?:string)=>void}){
 const [open,setOpen]=useState(false),[draft,setDraft]=useState(photo),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const file=useRef<HTMLInputElement>(null),job=useRef(0);
 useEffect(()=>()=>{job.current++;},[]);
 const initials=name.split(' ').filter(Boolean).map(n=>n[0]).slice(0,2).join('');
 function close(){job.current++;setBusy(false);setOpen(false);}
 async function choose(image:File){const token=++job.current;setBusy(true);setError('');try{const data=await readProblemPhoto(image);if(token===job.current)setDraft(data);}catch(e){if(token===job.current)setError(e instanceof Error?e.message:'Не удалось открыть фото. Выберите другое');}finally{if(token===job.current)setBusy(false);}}
 function save(){try{onSave(draft);close();}catch{setError('Не удалось сохранить фото. Освободите место в браузере и попробуйте ещё раз');}}
 return <>
  <button className="profile-photo-trigger" aria-label={photo?'Изменить фото профиля':'Добавить фото профиля'} onClick={()=>{setDraft(photo);setError('');setOpen(true);}}><span className="profile-photo-avatar">{photo?<img src={photo} alt=""/>:initials}</span><span className="profile-photo-camera"><Icon name="camera" size={14} inheritColor/></span></button>
  <BottomSheet open={open} onOpenChange={value=>{if(!value)close();}} title="Фото профиля"><div className="sheet-body profile-photo-sheet">
   <div className="profile-photo-preview" aria-label="Предпросмотр фото профиля">{draft?<img src={draft} alt="Фото профиля"/>:<span>{initials}</span>}</div>
   <input ref={file} hidden type="file" accept="image/jpeg,image/png,image/webp" aria-label="Выбрать фото профиля" onChange={e=>{const image=e.target.files?.[0];e.target.value='';if(image)void choose(image);}}/>
   {error&&<p className="field-error" role="alert">{error}</p>}
   <Button variant="secondary" busy={busy} busyLabel="Обрабатываем фото" onClick={()=>file.current?.click()}><Icon name="camera" size={20} inheritColor/>{draft?'Выбрать другое фото':'Выбрать фото'}</Button>
   <Button disabled={busy||draft===photo} onClick={save}>Сохранить</Button>
   {draft&&<Button variant="ghost" disabled={busy} onClick={()=>{setDraft(undefined);setError('');}}>Удалить фото</Button>}
  </div></BottomSheet>
 </>;
}
