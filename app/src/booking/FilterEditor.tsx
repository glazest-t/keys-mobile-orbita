import {useEffect,useState,type ReactNode} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {MobileScroll,useScreenPortal,useKeyboard,useKeyboardInsets,useMobileDevice} from '../mobile';
import {Button,Icon,IconButton} from '../ui';
import './filters.css';

export function FilterEditorDialog({open,onClose,children,initialFocusSelector='.filter-editor-header button'}:{open:boolean;onClose:()=>void;children:ReactNode;initialFocusSelector?:string}){
 const {screenRef}=useScreenPortal(),keyboard=useKeyboard();
 useEffect(()=>{if(open)keyboard.hide();},[open]);
 return <Dialog.Root open={open} onOpenChange={value=>{if(!value){keyboard.hide();onClose();}}}><Dialog.Portal container={screenRef.current??undefined}>{open&&<Dialog.Content className="filter-editor" aria-describedby={undefined} onOpenAutoFocus={event=>{if(!screenRef.current)return;event.preventDefault();screenRef.current.querySelector<HTMLButtonElement>(initialFocusSelector)?.focus();}}>{children}</Dialog.Content>}</Dialog.Portal></Dialog.Root>;
}

export function FilterEditorLayout({title='Фильтры',children,onClose,onReset,onApply,submitLabel,disabled=false,embedded=false}:{title?:string;children:ReactNode;onClose:()=>void;onReset:()=>void;onApply:()=>void;submitLabel:string;disabled?:boolean;embedded?:boolean}){
 const keyboard=useKeyboard(),{bottomInset}=useKeyboardInsets(),{device}=useMobileDevice();
 const footerBottom=device.platform==='android'?Math.max(bottomInset,device.geometry.safeArea.bottom):bottomInset;
 return <><MobileScroll className="filter-editor-scroll"><div className="filter-editor-content"><header className="filter-editor-header">{embedded?<h2>{title}</h2>:<><IconButton name="back" label="Назад без применения фильтров" onClick={()=>{keyboard.hide();onClose();}}/><Dialog.Title>{title}</Dialog.Title></>}<button className="filters-reset" onClick={onReset}>Сбросить</button></header><div className="filters-panel">{children}</div></div></MobileScroll><footer className="filter-editor-footer" style={{bottom:footerBottom}}><Button disabled={disabled} onClick={()=>{keyboard.hide();onApply();}}>{submitLabel}</Button></footer></>;
}

export function FilterSection({title,count,children}:{title:string;count?:number;children:ReactNode}){
 const [expanded,setExpanded]=useState(true);
 return <section className="filter-section"><button className="filter-section-heading" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}><span>{title}{!!count&&<b>{count}</b>}</span><span className={expanded?'filter-chevron expanded':'filter-chevron'}><Icon name="chevron-down" size={16}/></span></button>{expanded&&<div className="filter-section-body">{children}</div>}</section>;
}
