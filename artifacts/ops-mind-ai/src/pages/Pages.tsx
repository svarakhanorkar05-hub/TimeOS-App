import { useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Activity, AlertCircle, ArrowRightLeft, Check, CheckCircle2, Clock3, Coffee, Dumbbell, FileUp, Heart, Info, LoaderCircle, Moon, Plus, RotateCcw, Sparkles, Sun, Target, WandSparkles, X } from 'lucide-react';
import { useOps } from '../context/OpsContext';
import type { BlockCategory, PreferredTime, ScheduleBlock, ScheduleProposal, StudentTask } from '../data/model';
import { formatDay, localDate, saturdayDate, tomorrowDate } from '../data/seed';
import { analyzeScheduleScenario, simulateTimetableOCR } from '../services/aiService';

type ModalKind='commitment'|'goal'|'upload'|null;
const categoryClass=(category:BlockCategory)=>category.toLowerCase().replace(/\s+/g,'-');
const timeLabel=(time:string)=>{const [h,m]=time.split(':').map(Number);const hour=h%12||12;return `${hour}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;};
const timeAfterHours=(start:string,hours:number)=>{const [h,m]=start.split(':').map(Number);const total=h*60+m+hours*60;return `${String(Math.floor(total/60)%24).padStart(2,'0')}:${String(Math.round(total%60)).padStart(2,'0')}`;};

export function DashboardPage(){
  const {data,toast,setProposal,applyProposal,toggleBlock,addBlock,addTask,toggleTask,importTimetable}=useOps();
  const [day,setDay]=useState(localDate);
  const [scenario,setScenario]=useState('');
  const [analyzing,setAnalyzing]=useState(false);
  const [modal,setModal]=useState<ModalKind>(null);
  const [whyBlock,setWhyBlock]=useState<ScheduleBlock|null>(null);
  const [uploading,setUploading]=useState(false);
  const [uploadError,setUploadError]=useState('');
  const fileRef=useRef<HTMLInputElement>(null);
  const scenarioRef=useRef<HTMLInputElement>(null);
  const festivalApplied=data.schedule.some(item=>item.id==='festival-protected');
  const balance=festivalApplied?'91%':'88%';
  const dayBlocks=useMemo(()=>data.schedule.filter(item=>item.date===day).sort((a,b)=>a.start.localeCompare(b.start)),[data.schedule,day]);
  const dayTasks=data.tasks.filter(task=>task.deadline===day);
  const submitScenario=async(text=scenario)=>{
    if(!text.trim()){scenarioRef.current?.focus();toast('Add a situation first','Tell TimeOS what changed in your day.','info');return;}
    setScenario(text);setAnalyzing(true);setProposal(null);
    try{const proposal=await analyzeScheduleScenario(text,data.schedule);setProposal(proposal);}
    catch{toast('Could not build a proposal','Your live schedule is unchanged. Try a shorter description.','info');}
    finally{setAnalyzing(false);}
  };
  const apply=()=>{applyProposal();toast('Plan updated','Your new schedule is saved. Festival time and 7.5 hours of sleep are protected.');};
  const discard=()=>{setProposal(null);toast('Proposal discarded','Your current schedule was left exactly as it was.','info');};
  const handleTimetable=async(fileName?:string)=>{
    setUploading(true);setUploadError('');
    try{
      const parsed=await simulateTimetableOCR(fileName);
      const existing=new Set(data.schedule.map(item=>item.id));
      const count=parsed.filter(item=>!existing.has(item.id)).length;
      importTimetable(parsed);
      setModal(null);
      toast(count?'Timetable parsed':'Nothing new to add',count?`${count} lecture blocks added for ${formatDay(tomorrowDate)}.`:'These lecture blocks are already in your planner.',count?'success':'info');
    }catch{setUploadError('We could not read that file. Try a PDF, image, or the sample timetable.');}
    finally{setUploading(false);}
  };
  const submitCommitment=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();const form=new FormData(event.currentTarget);const title=String(form.get('title')||'').trim();
    if(!title){toast('Name your commitment','A short title helps your plan stay clear.','info');return;}
    const date=String(form.get('date')||localDate),start=String(form.get('start')||'18:00'),duration=Number(form.get('duration')||1);
    const [h,m]=start.split(':').map(Number),endM=h*60+m+duration*60,end=`${String(Math.floor(endM/60)%24).padStart(2,'0')}:${String(endM%60).padStart(2,'0')}`;
    const category=String(form.get('category')||'Social') as BlockCategory;
    addBlock({id:`commitment-${Date.now()}`,title,category,date,start,end,why:'Added by you; TimeOS will plan around this commitment.',completed:false,protected:category==='Social'||category==='Personal',source:'commitment'});
    setModal(null);toast('Commitment added',`${title} is on your schedule.`);
  };
  const submitGoal=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();const form=new FormData(event.currentTarget);const title=String(form.get('title')||'').trim();
    if(!title){toast('Add a goal title','Give your next step a clear name.','info');return;}
    const category=String(form.get('category')||'Deep Work') as BlockCategory;
    const hours=Math.max(.5,Number(form.get('hours')||1)),deadline=String(form.get('deadline')||tomorrowDate),preferred=String(form.get('preferred')||'Flexible') as PreferredTime;
    const candidates=preferred==='Morning'?['08:00','10:00','11:00']:preferred==='Night Owl'?['19:00','20:00','21:00']:['16:30','10:00','19:00'];
    const scheduledDate=deadline===localDate?localDate:tomorrowDate;
    const start=candidates.find(candidate=>{const end=timeAfterHours(candidate,hours);return !data.schedule.some(item=>item.date===scheduledDate&&candidate<item.end&&end>item.start);})||'16:30';
    const end=timeAfterHours(start,hours);
    const id=`goal-${Date.now()}`;
    const task:StudentTask={id,title,category,hours,deadline,preferredTime:preferred,completed:false};
    const block:ScheduleBlock={id:`block-${id}`,title,category,date:scheduledDate,start,end,why:`Scheduled in a ${preferred.toLowerCase()} window with room before your deadline.`,completed:false,source:'goal'};
    addTask(task,block);setModal(null);setDay(scheduledDate);toast('Goal added to your plan',`${title} · ${hours} ${hours===1?'hour':'hours'} scheduled.`);
  };
  const dayTabs=[{date:localDate,label:'Today'},{date:tomorrowDate,label:'Tomorrow'},{date:saturdayDate,label:'Weekend'}];
  return <main className="page">
    <section className="welcome-row">
      <div><div className="eyebrow">Your day, with room to be human</div><h1 className="page-title">Good morning. Let’s make today yours.</h1><p className="page-subtitle">A steady plan for your classes, ambitions, energy—and the life happening around them.</p></div>
      <div className="action-row">
        <button className="button-secondary" onClick={()=>setModal('commitment')} data-testid="button-add-commitment"><Plus size={15}/> Add Commitment</button>
        <button className="button-primary" onClick={()=>{scenarioRef.current?.focus();document.getElementById('adaptive-planner')?.scrollIntoView({behavior:'smooth',block:'center'});}} data-testid="button-what-if"><Sparkles size={15}/> What-If Simulator</button>
      </div>
    </section>
    <section className="stats-grid" aria-label="Your weekly wellbeing indicators">
      <StatCard icon={<Activity size={17}/>} tone="indigo" label="Energy state" value="High Focus ⚡" detail="Best window · 2–4 PM"/>
      <StatCard icon={<Target size={17}/>} tone="amber" label="Weekly balance" value={balance} detail="Across your whole week"/>
      <StatCard icon={<Moon size={17}/>} tone="emerald" label="Protected sleep" value="7.5 hours" detail="Every night, no trade-offs"/>
    </section>
    <div className="workspace-grid">
      <section className="column-stack" aria-label="Daily timeline and tasks">
        <div className="card card-pad">
          <div className="card-heading"><div><h2 className="card-title">Your day, at a glance</h2><p className="card-subtitle">{formatDay(day)} · 08:00–23:00</p></div>
            <div className="day-switch" role="tablist" aria-label="Choose planner day">{dayTabs.map(tab=><button role="tab" aria-selected={day===tab.date} className={day===tab.date?'active':''} key={tab.label} onClick={()=>setDay(tab.date)} data-testid={`tab-day-${tab.label.toLowerCase()}`}>{tab.label}</button>)}</div>
          </div>
          {dayBlocks.length===0?<div className="empty-day"><Coffee size={17} style={{marginBottom:7}}/><br/>A little open space. Add a commitment or keep it free.</div>:<div className="timeline">
            {Array.from({length:16},(_,index)=>8+index).map(hour=>{
              const atHour=dayBlocks.filter(item=>Number(item.start.slice(0,2))===hour);
              return <div className="timeline-row" key={hour}><span className="timeline-time">{String(hour).padStart(2,'0')}:00</span><div className="timeline-track">{atHour.map(item=><article key={item.id} className={`event-card ${categoryClass(item.category)} ${item.completed?'completed':''}`} data-testid={`event-${item.id}`}>
                <div className="event-head"><span className="event-name">{item.title}</span><span className="event-clock">{timeLabel(item.start)}–{timeLabel(item.end)}</span></div>
                <div className="event-meta"><span className="category-pill">{item.category}</span>{item.protected&&<span className="category-pill">Protected</span>}<span className="event-actions">
                  <button className="micro-button" aria-label={`Why is ${item.title} scheduled here?`} title="Why is this scheduled here?" onClick={()=>setWhyBlock(item)} data-testid={`button-why-${item.id}`}><Info size={12}/></button>
                  {item.category!=='Sleep'&&<button className="micro-button" aria-label={item.completed?`Mark ${item.title} incomplete`:`Complete ${item.title}`} title={item.completed?'Mark incomplete':'Mark complete'} onClick={()=>{toggleBlock(item.id);toast(item.completed?'Marked as planned':'Nice work — block complete',item.title,'success');}} data-testid={`button-complete-${item.id}`}><Check size={12}/></button>}
                </span></div>
              </article>)}</div></div>;
            })}
          </div>}
          {day===localDate&&<div className="sleep-banner"><span><Moon size={14}/> Sleep stays protected</span><span>11:00 PM – 7:00 AM · 7.5h</span></div>}
          {day!==localDate&&dayBlocks.some(item=>item.id==='festival-protected')&&<div className="sleep-banner" style={{background:'#fff1f2',borderColor:'#ffe4e6',color:'#be123c'}}><span><Heart size={14}/> Protected social time</span><span>Festival · 5:00–10:00 PM</span></div>}
          <div className="timeline-foot"><span><Clock3 size={11} style={{verticalAlign:'-2px'}}/> Space between blocks is intentional</span><span>{dayBlocks.filter(item=>!item.completed).length} planned</span></div>
        </div>
        <div className="card card-pad">
          <div className="card-heading"><div><h2 className="card-title">A few things on your mind</h2><p className="card-subtitle">Small steps, attached to real deadlines.</p></div><button className="button-quiet" onClick={()=>setModal('goal')} data-testid="button-add-goal"><Plus size={14}/> New goal / task</button></div>
          {data.tasks.length===0?<div className="empty-day">No tasks yet. Add a goal when you are ready.</div>:<div className="attendance-list">{data.tasks.slice(0,5).map(task=><div key={task.id} className="attendance-item" data-testid={`task-${task.id}`}><div className="attendance-name" style={{textDecoration:task.completed?'line-through':'none',opacity:task.completed?.55:1}}>{task.title}</div><button className="micro-button" aria-label={task.completed?`Reopen ${task.title}`:`Complete ${task.title}`} onClick={()=>toggleTask(task.id)} data-testid={`button-task-complete-${task.id}`}>{task.completed?<CheckCircle2 size={14}/>:<Check size={14}/>}</button><div className="attendance-note" style={{gridColumn:'1/-1',color:'#94a3b8'}}>Due {formatDay(task.deadline)} · {task.hours}h · {task.preferredTime}</div></div>)}</div>}
          <div className="secondary-tools"><button className="button-secondary" onClick={()=>setModal('upload')} data-testid="button-upload-timetable"><FileUp size={14}/> Upload timetable / syllabus</button><button className="button-secondary" onClick={()=>setModal('goal')} data-testid="button-add-new-task"><Plus size={14}/> Add new goal / task</button></div>
        </div>
      </section>
      <section className="column-stack" aria-label="Adaptive rescheduling">
        <div className="card proposal-card" id="adaptive-planner">
          <div className="proposal-banner"><div className="proposal-topline"><span className="proposal-badge"><WandSparkles size={12}/> TIMEOS ADAPTIVE PLANNER</span>{data.proposal&&<span className="proposal-badge">Ready to review</span>}</div>
            <h2 className="proposal-title">Life Happens: Adaptive Rescheduling</h2><p className="proposal-description">Plans can change. Tell me what happened and I’ll make room for it—not at the expense of your wellbeing.</p>
          </div>
          <form className="scenario-input-wrap" onSubmit={event=>{event.preventDefault();void submitScenario();}}>
            <div className="scenario-input"><input ref={scenarioRef} value={scenario} onChange={event=>setScenario(event.target.value)} placeholder="What changed in your day?" aria-label="Describe a change to your schedule" data-testid="input-scenario"/><button className="button-primary" type="submit" disabled={analyzing} data-testid="button-submit-scenario">{analyzing?<LoaderCircle className="spin" size={14}/>:<ArrowRightLeft size={14}/>}<span>{analyzing?'Thinking':'Replan'}</span></button></div>
          </form>
          <div className="scenario-chips" aria-label="Try a scenario">
            <button className="scenario-chip" onClick={()=>void submitScenario('College festival tomorrow 5–10 PM')} disabled={analyzing} data-testid="scenario-festival"><span>College festival tomorrow</span> · 5–10 PM</button>
            <button className="scenario-chip" onClick={()=>void submitScenario('Feeling low energy today, defer heavy study')} disabled={analyzing} data-testid="scenario-low-energy"><span>Low energy today</span> · defer heavy study</button>
            <button className="scenario-chip" onClick={()=>void submitScenario('DBMS assignment deadline moved up by 1 day')} disabled={analyzing} data-testid="scenario-deadline"><span>DBMS deadline moved up</span> · one day earlier</button>
          </div>
          <div className="proposal-content">
            {analyzing?<div className="reasoning" role="status" aria-live="polite"><span className="reasoning-dot"/><span>Analyzing impact on 4 commitments… protecting the important parts of your day.</span></div>:data.proposal?<ProposalView proposal={data.proposal} onApply={apply} onDiscard={discard}/>:<div className="proposal-empty"><CheckCircle2 size={19} style={{marginBottom:8,color:'#10b981'}}/><br/>No pending changes. Your live schedule is safe.<br/><button className="button-quiet" onClick={()=>void submitScenario('College festival tomorrow 5–10 PM')} style={{marginTop:7}} data-testid="button-preview-festival"><RotateCcw size={12}/> Preview festival plan</button></div>}
          </div>
        </div>
        <div className="card card-pad">
          <div className="card-heading"><div><h2 className="card-title">A better kind of balance</h2><p className="card-subtitle">A week with room for all of you.</p></div><Heart size={16} color="#f43f5e"/></div>
          <div className="balance-list">{[
            ['Academic',35,'#6366f1'],['Skill building',25,'#f59e0b'],['Social / events',20,'#f43f5e'],['Sleep / rest',20,'#10b981'],
          ].map(([label,value,color])=><div className="balance-row" key={label as string}><span className="balance-name">{label}</span><div className="balance-track" role="meter" aria-label={`${label} weekly balance`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(value)}><div className="balance-fill" style={{width:`${value}%`,background:color as string}}/></div><span className="balance-value">{value}%</span></div>)}</div>
        </div>
      </section>
      <aside className="column-stack balance-column" aria-label="Student balance and energy insights">
        <div className="card card-pad">
          <div className="card-heading"><div><h2 className="card-title">Attendance pulse</h2><p className="card-subtitle">Stay curious, keep a little margin.</p></div><CheckCircle2 size={16} color="#10b981"/></div>
          <div className="attendance-list">
            <div className="attendance-item"><span className="attendance-name">Database Systems</span><span className="attendance-state">82% · Safe</span><div className="attendance-bar" role="meter" aria-label="Database Systems attendance" aria-valuemin={0} aria-valuemax={100} aria-valuenow={82}><div className="attendance-fill" style={{width:'82%'}}/></div></div>
            <div className="attendance-item"><span className="attendance-name">Operating Systems</span><span className="attendance-state caution">74% · Watch</span><div className="attendance-bar" role="meter" aria-label="Operating Systems attendance" aria-valuemin={0} aria-valuemax={100} aria-valuenow={74}><div className="attendance-fill caution" style={{width:'74%'}}/></div><span className="attendance-note"><AlertCircle size={11} style={{verticalAlign:'-2px'}}/> One absence away from a low-attendance alert</span></div>
          </div>
        </div>
        <div className="card card-pad">
          <div className="card-heading"><div><h2 className="card-title">Energy & study load</h2><p className="card-subtitle">A gentle guide, not a grade.</p></div><Activity size={16} color="#6366f1"/></div>
          <EnergyChart/>
          <p className="energy-note">Your clearest thinking tends to arrive mid-afternoon. Hard things get the high-energy hours; recovery remains part of the plan.</p>
        </div>
        <div className="card card-pad">
          <div className="card-heading"><div><h2 className="card-title">A little breathing room</h2><p className="card-subtitle">The plan leaves space on purpose.</p></div><Sun size={16} color="#f59e0b"/></div>
          <p className="energy-note" style={{marginTop:0}}>Meals, transitions and a quiet evening aren’t gaps to fill. They are what make a busy week sustainable.</p>
          <div className="secondary-tools"><button className="button-secondary" onClick={()=>toast('Nice work showing up','A completed block stays part of your local history.','info')} data-testid="button-wellbeing-tip"><Dumbbell size={14}/> Wellbeing note</button></div>
        </div>
      </aside>
    </div>
    {modal==='commitment'&&<Dialog title="Add a commitment" subtitle="A class, a plan with friends, or anything else you want your week to respect." onClose={()=>setModal(null)}><form onSubmit={submitCommitment}>
      <div className="form-grid">
        <Field label="What is it?" full><input name="title" placeholder="e.g. Dinner with friends" required data-testid="input-commitment-title"/></Field>
        <Field label="Category"><select name="category" defaultValue="Social" data-testid="select-commitment-category"><option>Academic</option><option>Deep Work</option><option>Wellness</option><option>Social</option><option>Personal</option></select></Field>
        <Field label="Date"><input type="date" name="date" defaultValue={localDate} required data-testid="input-commitment-date"/></Field>
        <Field label="Start time"><input type="time" name="start" defaultValue="18:00" required data-testid="input-commitment-start"/></Field>
        <Field label="How long?"><select name="duration" defaultValue="1" data-testid="select-commitment-duration"><option value=".5">30 minutes</option><option value="1">1 hour</option><option value="1.5">1.5 hours</option><option value="2">2 hours</option><option value="3">3 hours</option></select></Field>
      </div><ModalFooter onCancel={()=>setModal(null)} submitLabel="Add to my day"/>
    </form></Dialog>}
    {modal==='goal'&&<Dialog title="Add a new goal or task" subtitle="Give it a realistic time slot. Your plan will find a sensible place near the deadline." onClose={()=>setModal(null)}><form onSubmit={submitGoal}>
      <div className="form-grid">
        <Field label="Goal or task" full><input name="title" placeholder="e.g. Draft the DBMS report" required data-testid="input-goal-title"/></Field>
        <Field label="Category"><select name="category" defaultValue="Deep Work" data-testid="select-goal-category"><option>Academic</option><option>Deep Work</option><option>Wellness</option><option>Social</option><option>Personal</option></select></Field>
        <Field label="Estimated hours"><input type="number" name="hours" min=".5" max="8" step=".5" defaultValue="1" required data-testid="input-goal-hours"/></Field>
        <Field label="Deadline"><input type="date" name="deadline" min={localDate} defaultValue={tomorrowDate} required data-testid="input-goal-deadline"/></Field>
        <Field label="Preferred time"><select name="preferred" defaultValue="Flexible" data-testid="select-goal-preferred"><option>Morning</option><option>Night Owl</option><option>Flexible</option></select></Field>
      </div><div className="modal-note">TimeOS places this block around your existing commitments. You can still move it later by changing the plan.</div><ModalFooter onCancel={()=>setModal(null)} submitLabel="Add goal to schedule"/>
    </form></Dialog>}
    {modal==='upload'&&<Dialog title="Upload timetable / syllabus" subtitle="A local OCR simulation reads a sample of your course timetable. Nothing is uploaded." onClose={()=>!uploading&&setModal(null)}>
      <div className="upload-zone"><FileUp size={24} color="#6366f1" style={{margin:'0 auto'}}/><strong>{uploading?'Reading timetable…':'Drop your timetable here'}</strong><p>Choose a photo or PDF. OCR runs locally in this demo.</p>
        <button className="button-secondary" disabled={uploading} onClick={()=>fileRef.current?.click()} data-testid="button-choose-timetable">{uploading?<LoaderCircle className="spin" size={14}/>:<Plus size={14}/>} Choose image or PDF</button>
      </div>
      <input ref={fileRef} hidden type="file" accept="image/*,.pdf,application/pdf" aria-label="Choose timetable image or PDF" onChange={event=>{const file=event.currentTarget.files?.[0];if(file)void handleTimetable(file.name);event.currentTarget.value='';}} data-testid="input-timetable-file"/>
      {uploadError&&<p role="alert" style={{fontSize:11,color:'#be123c'}}>{uploadError}</p>}
      <button className="button-secondary sample-option" disabled={uploading} onClick={()=>void handleTimetable('Sample university timetable')} data-testid="button-sample-timetable">{uploading?<><LoaderCircle className="spin" size={14}/> Simulating OCR…</>:<><Sparkles size={14}/> Use sample university timetable</>}</button>
      <div className="modal-note">Sample parse: Database Systems · Operating Systems · HCI Studio · Discrete Mathematics. Repeated imports are safely deduplicated.</div>
    </Dialog>}
    {whyBlock&&<Dialog title="Why this time?" subtitle={whyBlock.title} onClose={()=>setWhyBlock(null)}><div className="reasoning" style={{lineHeight:1.5}}><Sparkles size={15}/><span>{whyBlock.why}</span></div><div className="sleep-banner"><span><Clock3 size={14}/> {formatDay(whyBlock.date)}</span><span>{timeLabel(whyBlock.start)}–{timeLabel(whyBlock.end)}</span></div><ModalFooter onCancel={()=>setWhyBlock(null)} cancelLabel="Got it"/></Dialog>}
  </main>;
}
function StatCard({icon,tone,label,value,detail}:{icon:ReactNode;tone:string;label:string;value:string;detail:string}){
  return <div className="card stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div><span className="stat-detail">{detail}</span></div>;
}
function ProposalView({proposal,onApply,onDiscard}:{proposal:ScheduleProposal;onApply:()=>void;onDiscard:()=>void}){
  return <>
    <div className="reasoning"><span className="reasoning-dot"/><span>{proposal.reasoning}</span></div>
    <div className="diff-label">Your schedule · before & after</div>
    <div className="diff-grid">
      <div className="diff-col"><h4>Current plan</h4>{proposal.changes.map(change=><div className="diff-item" key={change.id}><strong>{change.title}</strong>{change.from}</div>)}</div>
      <div className="diff-col new"><h4>Proposed plan</h4>{proposal.changes.map(change=><div className="diff-item" key={change.id}><strong>{change.title}</strong><em>{change.to}</em><br/>{change.reason}</div>)}</div>
    </div>
    <p className="page-subtitle" style={{fontSize:10,margin:'10px 0 0'}}>{proposal.summary}</p>
    <div className="protection-row">{proposal.protection.map((label,index)=><span className={`protection ${label.toLowerCase().includes('sleep')?'sleep-protect':''}`} key={`${label}-${index}`}>{label.toLowerCase().includes('sleep')?<Moon size={11}/>:<Heart size={11}/>} {label}</span>)}</div>
    <div className="proposal-actions"><button className="button-secondary" onClick={onDiscard} data-testid="button-discard-proposal"><X size={14}/> Discard</button><button className="button-primary" onClick={onApply} data-testid="button-apply-proposal"><Check size={14}/> Apply Changes</button></div>
  </>;
}
function EnergyChart(){
  return <div aria-label="Energy peaks at 2 PM, while study load is balanced across the day" role="img">
    <svg className="energy-chart" viewBox="0 0 330 135" preserveAspectRatio="none">
      <defs><linearGradient id="energy-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity=".17"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0"/></linearGradient></defs>
      {[24,53,82,111].map(y=><line key={y} x1="28" x2="320" y1={y} y2={y} stroke="#edf1f6" strokeDasharray="3 4"/>)}<line x1="28" x2="28" y1="14" y2="112" stroke="#e2e8f0"/>
      <path d="M28 83 C55 76 61 43 92 44 S130 58 151 37 S190 22 210 30 S244 59 265 66 S294 78 320 81 L320 112 L28 112Z" fill="url(#energy-area)"/>
      <path d="M28 83 C55 76 61 43 92 44 S130 58 151 37 S190 22 210 30 S244 59 265 66 S294 78 320 81" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28 92 C60 89 70 80 92 75 S130 73 151 61 S189 67 210 54 S244 58 265 52 S295 60 320 57" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round"/>
      {[[28,'8a'],[92,'11a'],[151,'2p'],[210,'5p'],[265,'8p'],[320,'11p']].map(([x,label])=><text key={String(x)} x={x as number} y="130" textAnchor="middle" fill="#94a3b8" fontSize="9">{label}</text>)}
      <text x="4" y="24" fill="#94a3b8" fontSize="8">High</text><text x="8" y="110" fill="#94a3b8" fontSize="8">Low</text>
    </svg>
    <div className="chart-legend"><span><i className="legend-mark" style={{background:'#6366f1'}}/>Energy</span><span><i className="legend-mark" style={{background:'#f59e0b'}}/>Study load</span></div>
  </div>;
}
function Dialog({title,subtitle,onClose,children}:{title:string;subtitle?:string;onClose:()=>void;children:ReactNode}){
  return <div className="modal-backdrop" role="presentation" onMouseDown={event=>{if(event.currentTarget===event.target)onClose();}}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header className="modal-head"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><button className="modal-close" aria-label="Close dialog" onClick={onClose} data-testid="button-close-dialog"><X size={16}/></button></header><div className="modal-body">{children}</div></section></div>;
}
function Field({label,children,full=false}:{label:string;children:ReactNode;full?:boolean}){return <div className={`form-field ${full?'full':''}`}><label>{label}{children}</label></div>;}
function ModalFooter({onCancel,submitLabel,cancelLabel='Cancel'}:{onCancel:()=>void;submitLabel?:string;cancelLabel?:string}){
  return <div className="modal-foot"><button type="button" className="button-secondary" onClick={onCancel} data-testid="button-cancel-modal">{cancelLabel}</button>{submitLabel&&<button type="submit" className="button-primary" data-testid="button-save-modal"><Check size={14}/>{submitLabel}</button>}</div>;
}