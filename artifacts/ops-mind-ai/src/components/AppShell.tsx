import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { CalendarDays, RotateCcw, Sparkles } from 'lucide-react';
import { useOps } from '../context/OpsContext';

export function AppShell({children}:{children:ReactNode}){
  const {resetDemo,toast}=useOps();
  const today=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
  return <div className="app-shell">
    <header className="topbar">
      <Link href="/" className="brand" aria-label="TimeOS planner home" data-testid="link-timeos-home">
        <span className="brand-mark"><CalendarDays size={19}/></span><span className="brand-word">TimeOS</span>
      </Link>
      <span className="edition"><Sparkles size={11}/> Student Edition</span>
      <div className="nav-spacer"/>
      <span className="header-date">{today}</span>
      <button className="icon-button" onClick={()=>{if(window.confirm('Reset your TimeOS demo planner? Other browser data will not be touched.'))resetDemo();}} title="Reset TimeOS demo data" aria-label="Reset demo data" data-testid="button-reset-demo"><RotateCcw size={15}/></button>
    </header>
    {children}
    <footer style={{maxWidth:1540,margin:'0 auto',padding:'0 clamp(16px,4vw,58px) 24px',fontSize:10,color:'#94a3b8'}}>
      TimeOS keeps your plan local to this browser. <button className="button-quiet" style={{minHeight:24,fontSize:10}} onClick={()=>toast('Your plan stays yours','This student demo saves only in this browser. No schedule data is sent anywhere.','info')} data-testid="button-local-privacy">Local-only privacy</button>
    </footer>
  </div>;
}