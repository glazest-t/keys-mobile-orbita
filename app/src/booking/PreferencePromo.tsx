import {Button} from '../ui';
import preferenceArt from './art/preference.html?raw';

export function PreferencePromo({onStart,continuing=false}:{onStart:()=>void;continuing?:boolean}){
 return <section className="find-preferences"><div><small>Не знаете, куда?</small><h2>Подбор по пожеланиям</h2><p>Отметьте, что нравится, — найдём подходящие отели</p><Button onClick={onStart}>{continuing?'Продолжить подбор':'Начать подбор'}</Button></div><div className="find-source-art" aria-hidden="true" dangerouslySetInnerHTML={{__html:preferenceArt}}/></section>;
}
