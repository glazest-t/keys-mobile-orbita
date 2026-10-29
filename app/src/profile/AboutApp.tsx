import {Row} from '../ui';
import {version} from '../../package.json';
import './about.css';

export function AboutApp({onDocument,onHelp}:{onDocument:(document:'agreement'|'privacy')=>void;onHelp:()=>void}){
 return <div className="about-app">
  <div className="about-app-brand"><img src="/brand/assets/logo/horizontal-cobalt.svg" alt="Ключи"/><span>Версия {version}</span></div>
  <div className="about-app-description"><h2>От выбора отеля до двери номера</h2><p>«Ключи» — приложение для поиска и бронирования отелей, управления поездками и заказа услуг во время проживания.</p><p>Находите отели по своим предпочтениям, сохраняйте понравившиеся варианты, общайтесь с отелем и пользуйтесь цифровым ключом там, где он доступен. Копите баллы «Ключей» и получайте привилегии отелей.</p></div>
  <div className="k-card about-app-links"><Row icon="document" title="Пользовательское соглашение" onClick={()=>onDocument('agreement')}/><Row icon="secure" title="Политика обработки данных" onClick={()=>onDocument('privacy')}/><Row icon="nav-chats" title="Помощь и поддержка" onClick={onHelp}/></div>
  <p className="about-app-tagline">Вы — в центре.</p>
 </div>;
}
