import {StatusBadge} from '../ui';
import type {Booking} from './model';
import type {ServiceRequest} from './serviceRequests';
import {serviceStatusPresentation} from './serviceSettlement';
import './service-orders.css';
export function ServiceStatus({booking,request:r}:{booking:Booking;request:ServiceRequest}){
 const {label,tone,icon}=serviceStatusPresentation(booking,r);
 return <StatusBadge className="service-payment-badge" tone={tone} icon={icon}>{label}</StatusBadge>;
}
