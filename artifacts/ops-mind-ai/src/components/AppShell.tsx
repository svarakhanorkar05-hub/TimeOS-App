import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, CalendarDays, ChartNoAxesCombined, CheckSquare, Clock3, RotateCcw, Settings2, Sparkles } from 'lucide-react';
import { useOps } from '../context/OpsContext';

export function AppShell({children}:{children:ReactNode}){
  const {resetDemo,toast,data}=useOps();
  const [location]=useLocation();
  const today=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
  const links=[['/','Schedule','Schedule',CalendarDays],['/reschedule','Reschedule','Replan',Activity],['/tasks','Goals & Tasks','Tasks',CheckSquare],['/analytics','Balance','Balance',ChartNoAxesCombined],['/settings','Setup','Setup',Settings2]] as const;
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
    <nav className="app-nav" aria-label="Main navigation"><div className="route-nav">{links.map(([href,label,mobileLabel,Icon])=><Link key={href} href={href} className={`nav-link ${location===href?'active':''}`} aria-label={label} aria-current={location===href?'page':undefined} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ','-')}`}><Icon size={15}/><span className="nav-label-full">{label}</span><span className="nav-label-short">{mobileLabel}</span></Link>)}</div><div className="nav-status"><span className="status-chip"><span className="status-dot"/><Activity size={12}/> High Focus</span><span className="status-chip"><Clock3 size={12}/> {data.preferences.minimumSleepHours}h sleep protected</span></div></nav>
    {children}
    <footer style={{maxWidth:1540,margin:'0 auto',padding:'0 clamp(16px,4vw,58px) 24px',fontSize:10,color:'#94a3b8'}}>
      TimeOS keeps your plan local to this browser. <button className="button-quiet" style={{minHeight:24,fontSize:10}} onClick={()=>toast('Your plan stays yours','This student demo saves only in this browser. No schedule data is sent anywhere.','info')} data-testid="button-local-privacy">Local-only privacy</button>
    </footer>
  </div>;
}