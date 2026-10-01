import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, CalendarDays, ChartNoAxesCombined, CheckSquare, Clock3, RotateCcw, Settings2, Sparkles } from 'lucide-react';
import { useOps } from '../context/OpsContext';

export function AppShell({children}:{children:ReactNode}){
  const {resetDemo,toast,data}=useOps();
  const [location]=useLocation();
  const isLoginPage=location==='/login';
  const today=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
  const links=[['/','Schedule',CalendarDays],['/reschedule','Reschedule',Activity],['/tasks','Goals & Tasks',CheckSquare],['/analytics','Balance',ChartNoAxesCombined],['/settings','Setup',Settings2]] as const;
  const renderLink=([href,label,Icon]:typeof links[number])=><Link key={href} href={href} className={`sidebar-link ${location===href?'active':''}`} aria-current={location===href?'page':undefined} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ','-')}`}><Icon size={17}/><span>{label}</span></Link>;
  const pageLabel=links.find(([href])=>href===location)?.[1]??'TimeOS';
  return <div className={`app-shell ${isLoginPage?'login-shell':''}`}>
    {!isLoginPage&&<aside className="app-sidebar">
      <Link href="/" className="brand" aria-label="TimeOS planner home" data-testid="link-timeos-home"><span className="brand-mark"><CalendarDays size={19}/></span><span className="brand-word">TimeOS</span></Link>
      <nav className="sidebar-nav" aria-label="Main navigation">
        <section className="sidebar-section"><h2 className="sidebar-section-label">Plan</h2>{links.slice(0,3).map(renderLink)}</section>
        <section className="sidebar-section"><h2 className="sidebar-section-label">Insights</h2>{links.slice(3).map(renderLink)}</section>
      </nav>
      <div className="sidebar-foot">
        <div className="sidebar-status"><span className="status-chip"><span className="status-dot"/><Activity size={12}/> High Focus</span><span className="status-chip"><Clock3 size={12}/> {data.preferences.minimumSleepHours}h sleep protected</span></div>
        <div className="sidebar-note"><strong>Plan less. Adapt faster.</strong><span>Your plan stays yours.</span></div>
      </div>
    </aside>}
    <div className="app-main">
      <header className="topbar">
        {isLoginPage?<><Link href="/" className="brand" aria-label="TimeOS planner home"><span className="brand-mark"><CalendarDays size={19}/></span><span className="brand-word">TimeOS</span></Link><span className="edition"><Sparkles size={11}/> Student Edition</span></>:<span className="header-context">{pageLabel}</span>}
        <div className="nav-spacer"/>
        {!isLoginPage&&<><span className="header-date">{today}</span><button className="icon-button" onClick={()=>{if(window.confirm('Reset your TimeOS demo planner? Other browser data will not be touched.'))resetDemo();}} title="Reset TimeOS demo data" aria-label="Reset demo data" data-testid="button-reset-demo"><RotateCcw size={15}/></button></>}
      </header>
      {children}
      {!isLoginPage&&<footer style={{maxWidth:1540,margin:'0 auto',padding:'0 clamp(16px,4vw,58px) 24px',fontSize:10,color:'#94a3b8'}}>
        TimeOS keeps your plan local to this browser. <button className="button-quiet" style={{minHeight:24,fontSize:10}} onClick={()=>toast('Your plan stays yours','This student demo saves only in this browser. No schedule data is sent anywhere.','info')} data-testid="button-local-privacy">Local-only privacy</button>
      </footer>}
    </div>
  </div>;
}