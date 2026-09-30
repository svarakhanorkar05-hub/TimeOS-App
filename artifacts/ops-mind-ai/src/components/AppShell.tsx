import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, Bell, BookOpenCheck, BrainCircuit, ChevronRight, CircleHelp, Command, FileText, Gauge, Layers3, Menu, Search, Settings2, ShieldAlert, Sparkles, Target } from 'lucide-react';
import { useOps } from '../context/OpsContext';
import { Modal } from './Common';
import type { Task } from '../data/model';

const navItems=[
  {label:'Dashboard',path:'/dashboard',icon:Gauge},
  {label:'AI Workspace',path:'/workspace',icon:BrainCircuit},
  {label:'Documents',path:'/documents',icon:FileText},
  {label:'AI Actions',path:'/actions',icon:Sparkles},
  {label:'Tasks',path:'/tasks',icon:Target},
  {label:'Risks',path:'/risks',icon:ShieldAlert},
  {label:'Decision Memory',path:'/decisions',icon:BookOpenCheck},
  {label:'Insights',path:'/insights',icon:Activity},
  {label:'Settings',path:'/settings',icon:Settings2},
];
const demoSteps=[
  'Open Project Atlas status report',
  'Analyze the report and cite its evidence',
  'Extract the Vendor Alpha approval action',
  'Map the integration dependency',
  'Detect and quantify the delivery risk',
  'Create the owner-assigned task',
  'Schedule AI follow-up and reminders',
  'Update executive operational health',
  'Publish an executive insight',
];
export function AppShell({children}:{children:ReactNode}) {
  const [location,setLocation]=useLocation();
  const {data,addTask,addRisk,addActivity,addInsights,toast}=useOps();
  const [mobileOpen,setMobileOpen]=useState(false);
  const [demoOpen,setDemoOpen]=useState(false);
  const [demoRunning,setDemoRunning]=useState(false);
  const [demoStep,setDemoStep]=useState(-1);
  const [query,setQuery]=useState('');
  const [searchOpen,setSearchOpen]=useState(false);
  const [signInOpen,setSignInOpen]=useState(false);
  const demoPct=demoRunning?Math.max(5,Math.round(((demoStep+1)/demoSteps.length)*100)):demoStep>=0?100:0;
  const searchResults=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return [];
    return [
      ...data.documents.filter(d=>d.title.toLowerCase().includes(q)||d.department.toLowerCase().includes(q)).map(d=>({kind:'Document',label:d.title,path:'/documents',id:d.id})),
      ...data.tasks.filter(t=>t.title.toLowerCase().includes(q)||t.owner.toLowerCase().includes(q)||t.project.toLowerCase().includes(q)).map(t=>({kind:'Task',label:t.title,path:'/tasks',id:t.id})),
      ...data.projects.filter(p=>p.name.toLowerCase().includes(q)).map(p=>({kind:'Project',label:p.name,path:'/dashboard',id:p.id})),
      ...data.decisions.filter(d=>d.title.toLowerCase().includes(q)||d.reason.toLowerCase().includes(q)).map(d=>({kind:'Decision',label:d.title,path:'/decisions',id:d.id})),
      ...data.risks.filter(r=>r.title.toLowerCase().includes(q)||r.project.toLowerCase().includes(q)).map(r=>({kind:'Risk',label:r.title,path:'/risks',id:r.id})),
    ].slice(0,7);
  },[data,query]);
  useEffect(()=>{setMobileOpen(false);setSearchOpen(false);},[location]);
  useEffect(()=>{
    const onKeyDown=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();document.querySelector<HTMLInputElement>('[data-testid="input-global-search"]')?.focus();setSearchOpen(true);}};
    window.addEventListener('keydown',onKeyDown);return()=>window.removeEventListener('keydown',onKeyDown);
  },[]);
  const runDemo=async()=>{
    if(demoRunning)return;
    setDemoOpen(true);setDemoRunning(true);setDemoStep(-1);
    setLocation('/documents');
    const pause=(ms:number)=>new Promise(resolve=>window.setTimeout(resolve,ms));
    const steps=[
      ()=>{addActivity('Opened Project Atlas Status Report for guided demo');},
      ()=>{addActivity('AI analyzed Atlas status report and cited 3 sources');},
      ()=>{addActivity('Extracted Vendor Alpha approval action for Priya Shah');},
      ()=>{addActivity('Mapped vendor approval to 3 downstream Atlas tasks');},
      ()=>{if(!data.risks.some(r=>r.id==='risk-demo-atlas'))addRisk({id:'risk-demo-atlas',title:'Atlas integration milestone at risk',severity:'High',probability:84,impact:'High',affectedTasks:3,recommendation:'Escalate the Vendor Alpha approval to Finance leadership within 24 hours.',project:'Project Atlas',detail:'The October integration milestone depends on a pending vendor security addendum. Three downstream tasks are waiting for approval.'});addActivity('Detected a critical path risk in Project Atlas');},
      ()=>{const task:Task={id:'task-demo-atlas',title:'Complete Vendor Alpha API approval',project:'Project Atlas',owner:'Priya Shah',priority:'High',deadline:'2026-06-16',status:'In progress',riskScore:84,dependency:'Vendor security addendum'};if(!data.tasks.some(t=>t.id===task.id))addTask(task);addActivity('Created Atlas approval task and assigned Priya Shah');},
      ()=>{addActivity('Follow-up agent notified 3 owners and scheduled 2 reminders');toast('AI follow-up scheduled','Three owners notified; two reminders queued.','success');},
      ()=>{addActivity('Operational health refreshed with Atlas dependency signals');setLocation('/dashboard');},
      ()=>{addInsights([{id:`ins-demo-${Date.now()}`,title:'Atlas approval is the critical path',description:'Vendor Alpha API approval gates three downstream actions. Escalating the security addendum today protects the integration readiness milestone.',category:'Demo recommendation'}]);addActivity('Published a new executive insight for Project Atlas');toast('Atlas scenario complete','Your dashboard now reflects the latest analysis.','success');},
    ];
    for(let i=0;i<steps.length;i++){await pause(12000);setDemoStep(i);steps[i]();}
    setDemoRunning(false);
  };
  return <div className={`app-shell ${data.preferences.compact?'compact-mode':''}`}>
    {mobileOpen&&<button className="mobile-backdrop" onClick={()=>setMobileOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation"/>}
    <aside className={`sidebar ${mobileOpen?'open':''}`}>
      <Link href="/dashboard" className="brand" data-testid="link-brand"><span className="brand-mark"><Layers3 size={18}/></span><span>OPSMIND <span style={{fontWeight:500,color:'#8996ab'}}>AI</span></span></Link>
      <div className="nav-label">Workspace</div>
      <nav>{navItems.map(item=>{const Icon=item.icon;return <Link key={item.path} href={item.path} className={`nav-link ${location===item.path?'active':''}`} data-testid={`nav-${item.path.slice(1)}`}><Icon size={16}/><span>{item.label}</span>{location===item.path&&<ChevronRight size={13} style={{marginLeft:'auto',opacity:.6}}/>}</Link>})}</nav>
      <div className="sidebar-bottom">
        <div className="nav-label">Workspace status</div>
        <div className="system-status"><span className="system-dot"/><div><div style={{fontWeight:700,color:'#e3e9f2',fontSize:11}}>AI systems operational</div><div style={{fontSize:10,color:'#8290a5',marginTop:3}}>Local intelligence active</div></div></div>
        <button className="nav-link" style={{width:'100%',marginTop:12}} onClick={()=>setSignInOpen(true)} data-testid="button-help"><CircleHelp size={15}/>Help & support</button>
        <div style={{padding:'11px 12px 0',fontSize:10,color:'#68778d'}}>OpsMind workspace · Demo</div>
      </div>
    </aside>
    <main className="app-main">
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Open navigation" data-testid="button-menu"><Menu size={17}/></button>
        <div className="topbar-search">
          <Search size={15} className="search-icon"/>
          <input value={query} onChange={e=>{setQuery(e.target.value);setSearchOpen(true);}} onFocus={()=>setSearchOpen(true)} onKeyDown={e=>{if(e.key==='Escape'){setSearchOpen(false);setQuery('');}if(e.key==='Enter'&&searchResults[0]){setLocation(searchResults[0].path);setQuery('');}}} placeholder="Search documents, tasks, projects..." data-testid="input-global-search" aria-label="Search workspace"/>
          <span className="kbd">⌘ K</span>
          {searchOpen&&query&&<div className="global-results">{searchResults.length?searchResults.map(r=><button key={`${r.kind}-${r.id}`} onClick={()=>{setLocation(r.path);setQuery('');setSearchOpen(false);}} data-testid={`search-result-${r.id}`}><span className="result-type">{r.kind}</span><span>{r.label}</span><ChevronRight size={13}/></button>):<div className="global-empty">No matching workspace records</div>}</div>}
        </div>
        <div className="topbar-spacer"/>
        <button className="topbar-action demo-btn" onClick={runDemo} data-testid="button-run-demo"><Command size={14}/><span className="action-label">Demo Mode</span></button>
        <button className="topbar-action" onClick={()=>toast('You are all caught up','No new executive notifications.','info')} data-testid="button-notifications"><Bell size={15}/><span className="action-label">Alerts</span></button>
        <button className="avatar" onClick={()=>setSignInOpen(true)} aria-label="Alex Morgan profile" data-testid="button-profile">AM</button>
      </header>
      {children}
    </main>
    {demoOpen&&<Modal title={demoRunning?'Project Atlas · Guided demo':'Atlas scenario complete'} subtitle="A connected walkthrough of OpsMind's enterprise action loop" onClose={()=>setDemoOpen(false)} footer={<><button className="button-secondary" onClick={()=>{setDemoOpen(false);if(demoRunning)toast('Demo continues in the background','Your scenario will finish updating the workspace.','info');}} data-testid="button-close-demo">Close</button>{!demoRunning&&<button className="button-primary" onClick={()=>{setDemoOpen(false);setLocation('/dashboard');}} data-testid="button-demo-dashboard">View updated dashboard</button>}</>}>
      <div className="demo-banner" style={{margin:0}}><Sparkles size={16}/><span>Project Atlas is approaching a critical integration milestone.</span></div>
      <div className="demo-progress" style={{marginTop:15}}>
        <div className="progress-head"><span>{demoRunning?'AI operations in progress':'Scenario complete'}</span><span>{demoPct}%</span></div><div className="progress-track"><div className="progress-fill" style={{width:`${demoPct}%`}}/></div>
        <div style={{marginTop:12}}>{demoSteps.map((s,i)=><div className={`progress-step ${i===demoStep?'current':''} ${i<demoStep||(!demoRunning&&demoStep>=0)?'done':''}`} key={s}><span>{i<demoStep||(!demoRunning&&demoStep>=0)?<span style={{color:'#4b9278'}}>✓</span>:i===demoStep?<span style={{color:'#5269bf'}}>●</span>:<span>○</span>}</span>{s}</div>)}</div>
      </div>
      <div className="notice"><CircleHelp size={14}/>This guided run changes shared demo data: it adds a tracked task, records an Atlas risk and updates activity on your dashboard.</div>
    </Modal>}
    {signInOpen&&<Modal title="Welcome, Alex" subtitle="Your OpsMind demo workspace is ready." onClose={()=>setSignInOpen(false)} footer={<button className="button-primary" onClick={()=>setSignInOpen(false)} data-testid="button-modal-done">Continue to workspace</button>}><div className="notice"><div className="avatar">AM</div><div><strong style={{color:'#344157'}}>Alex Morgan</strong><br/>Executive operations · Demo workspace</div></div><p className="section-subtitle" style={{marginTop:14,lineHeight:1.6}}>Authentication is disabled for this local prototype. All changes are saved in this browser and can be restored from Settings.</p></Modal>}
    <button className="search-dismiss" aria-label="Close search results" onClick={()=>setSearchOpen(false)} style={{display:searchOpen&&query?'block':'none'}} data-testid="button-dismiss-search"/>
  </div>;
}