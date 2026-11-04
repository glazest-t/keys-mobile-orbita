import {createContext,useContext,type PropsWithChildren} from 'react';

/** Enabled only by the desktop dialog shell; mobile keeps its original layout. */
export const DesktopDialogContext=createContext(false);
export const useDesktopDialog=()=>useContext(DesktopDialogContext);

/** Explicit action groups also work in components rendered inside a dialog. */
export function DialogActions({children}:PropsWithChildren){
 return useDesktopDialog()?<div className="dialog-actions">{children}</div>:<>{children}</>;
}
