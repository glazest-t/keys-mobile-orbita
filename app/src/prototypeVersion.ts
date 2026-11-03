/** Switch surfaces without losing the selected route or catalogue scenario. */
export function prototypeVersionUrl(href:string,base:string,desktop:boolean,dev:boolean){
 const current=new URL(href);
 if(dev){current.port=desktop?'5180':'5173';current.pathname='/';return current.href;}
 const target=new URL('../'+(desktop?'desktop/':'prototype/'),new URL(base,current.origin));
 target.search=current.search;target.hash=current.hash;
 return target.href;
}
