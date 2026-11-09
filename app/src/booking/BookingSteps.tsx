/** Shared two-step indicator for booking and amendment flows. */
export function BookingSteps({step,title,heading='h1'}:{step:1|2;title:string;heading?:'h1'|'h2'}){
 const Heading=heading;
 return <div className="booking-progress" aria-label={`Шаг ${step} из 2: ${title}`}><div><Heading>{title}</Heading><span>{step} из 2</span></div><div aria-hidden="true"><i/><i className={step===2?'complete':''}/></div></div>;
}
