// Original geometry and animation, adapted from github-onboarding.
import * as React from 'react';
export function SourceSplash(){
    const E = React.createElement, C = '#2f5bff', BG = '#eef0ff', Dur = '2s';
    const A = (n:string, ez?:string) => n + ' ' + Dur + ' ' + (ez || 'cubic-bezier(.65,0,.35,1)') + ' both';
    const D = 80, st = 15, dot = 26.7, cx = 116, cy = 100;
    return E('div', { key: 'm', style: { position: 'relative', width: 302, height: 200, flex: 'none' } },
      E('div', { style: { position: 'absolute', inset: 0, animation: A('kSlide') } },
        E('div', { style: { position: 'absolute', inset: 0, transformOrigin: cx + 'px ' + cy + 'px', animation: 'kIn .35s cubic-bezier(.2,.8,.2,1) both' } },
          E('div', { style: { position: 'absolute', left: cx - D / 2, top: cy - D / 2, width: D, height: D, borderRadius: '50%', border: st + 'px solid ' + C, boxSizing: 'border-box' } }),
          E('div', { style: { position: 'absolute', left: cx + D / 2 - 4, top: cy - 6, width: 74, height: 12, borderRadius: 6, background: C, transformOrigin: '0 50%', animation: A('kShaft') } }),
          E('div', { style: { position: 'absolute', left: cx + D / 2 + 40, top: cy + 2, width: 10, height: 17, borderRadius: 3, background: C, animation: A('kTeeth', 'linear') } }),
          E('div', { style: { position: 'absolute', left: cx + D / 2 + 56, top: cy + 2, width: 10, height: 12, borderRadius: 3, background: C, animation: A('kTeeth', 'linear') } }),
          E('div', { style: { position: 'absolute', left: cx - D / 2, top: cy - D / 2, width: D, height: D, transform: 'rotate(90deg)' } },
            E('div', { style: { position: 'absolute', inset: 0, animation: A('kOrbit') } },
              E('div', { style: { position: 'absolute', left: D / 2 - dot / 2, top: st / 2 - dot / 2, width: dot, height: dot, borderRadius: '50%', background: C, boxShadow: '0 0 0 4.8px ' + BG, animation: A('kDotGrow') } }))))),
      E('div', { style: { position: 'absolute', left: 116, top: cy - 21, font: "500 36px/42px 'Unbounded',sans-serif", letterSpacing: -1.8, color: '#101320', whiteSpace: 'nowrap', animation: A('kWord', 'cubic-bezier(.2,.8,.2,1)') } }, 'ключи'));
}

export function SourceFinish(){
    const E = React.createElement;
    return E('div', { key: 'finish', style: { position: 'relative', width: 96, height: 96, animation: 'obPop .6s cubic-bezier(.34,1.56,.64,1) both' } },
      E('div', { style: { position: 'absolute', inset: 0, borderRadius: '50%', border: '18px solid #2f5bff', boxSizing: 'border-box' } }),
      E('div', { style: { position: 'absolute', inset: 0, animation: 'obSpin 1.2s cubic-bezier(.65,0,.35,1) .2s both' } },
        E('div', { style: { position: 'absolute', left: 32, top: -7, width: 32, height: 32, borderRadius: '50%', background: '#2f5bff', boxShadow: '0 0 0 6px #eef0ff' } })));
}

export function SourceSweep(){
    const E = React.createElement, st={n:1}; const ang=165;
    return E('div', { style: { position: 'absolute', left: 21, top: 20, width: 280, height: 280, pointerEvents: 'none', zIndex: 4 } },
      E('div', { key: 'r' + st.n, style: { position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #2f5bff4d', animation: st.n ? 'obRing 1s cubic-bezier(.4,0,.2,1) both' : 'none', opacity: 0 } }),
      E('div', { style: { position: 'absolute', inset: 0, transform: 'rotate(' + ang + 'deg)', transition: 'transform 1s cubic-bezier(.65,0,.35,1)' } },
        E('div', { key: 'd' + st.n, style: { position: 'absolute', left: 129, top: -11, width: 22, height: 22, borderRadius: '50%', background: '#2f5bff', boxShadow: '0 0 0 5px #ffffffcc,0 8px 18px #2f5bff66', opacity: 0, animation: st.n ? 'obDot 1s cubic-bezier(.4,0,.2,1) both' : 'none' } })));
}
