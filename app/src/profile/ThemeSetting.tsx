import {useState} from 'react';
import {BottomSheet} from '../mobile';
import {Icon,Row} from '../ui';
import {useAppTheme} from '../useAppTheme';
import {setAppTheme} from '../appTheme';

export const themeOptions=[['light','Светлая'],['dark','Тёмная'],['system','Как на устройстве']] as const;
export function ThemeSetting(){
 const theme=useAppTheme(),[open,setOpen]=useState(false);
 return <><Row icon="moon" title="Тема оформления" subtitle={themeOptions.find(([id])=>id===theme)![1]} onClick={()=>setOpen(true)}/><BottomSheet open={open} onOpenChange={setOpen} title="Тема оформления" snap={.42}><div className="sheet-body theme-choices" role="radiogroup" aria-label="Тема оформления">{themeOptions.map(([id,label])=><button className="language-choice" type="button" role="radio" aria-checked={theme===id} key={id} onClick={()=>setAppTheme(id)}><span className={'theme-swatch theme-swatch-'+id} aria-hidden="true"/><span>{label}</span>{theme===id&&<Icon name="check" size={20} inheritColor/>}</button>)}</div></BottomSheet></>;
}
