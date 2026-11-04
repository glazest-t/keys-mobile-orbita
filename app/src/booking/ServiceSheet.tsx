import type {ComponentProps} from 'react';
import {BottomSheet,useMobileDevice} from '../mobile';
import {isDesktop} from '../desktop/surface';
import './service-sheet.css';

// Content determines the height; only the available screen limits a long sheet.
export function ServiceSheet({children,...props}:ComponentProps<typeof BottomSheet>){
 const {device}=useMobileDevice();
 if(isDesktop)return <BottomSheet {...props}>{children}</BottomSheet>;
 const {screen,safeArea}=device.geometry;
 const bottom=device.platform==='android'?safeArea.bottom:0;
 const snap=(screen.height-safeArea.top-bottom-8)/screen.height;
 return <BottomSheet {...props} snap={snap}><div className="adaptive-service-sheet">{children}</div></BottomSheet>;
}
