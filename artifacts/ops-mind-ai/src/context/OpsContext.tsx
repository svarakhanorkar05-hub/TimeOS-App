import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ScheduleBlock, ScheduleProposal, StudentData, StudentTask } from '../data/model';
import { makeInitialData } from '../data/seed';

const STORE_KEY='timeos-student-planner-v1';
export interface ToastRecord{id:string;title:string;detail:string;type:'success'|'info'}
interface TimeOSContextValue {
  data:StudentData; toast:(title:string,detail?:string,type?:'success'|'info')=>void; toasts:ToastRecord[];
  setProposal:(proposal:ScheduleProposal|null)=>void; applyProposal:()=>void; toggleBlock:(id:string)=>void;
  addBlock:(block:ScheduleBlock)=>void; addTask:(task:StudentTask,block:ScheduleBlock)=>void; toggleTask:(id:string)=>void;
  importTimetable:(blocks:ScheduleBlock[])=>number; resetDemo:()=>void;
}
const TimeOSContext=createContext<TimeOSContextValue|null>(null);
function normalizeSchedule(schedule:ScheduleBlock[],seed:ScheduleBlock[]):ScheduleBlock[]{
  const normalized=schedule.map(item=>item.category==='Sleep'&&item.protected?{...item,end:'07:00'}:item);
  for(const sleep of seed.filter(item=>item.category==='Sleep')){
    if(!normalized.some(item=>item.date===sleep.date&&item.category==='Sleep'))normalized.push(sleep);
  }
  return normalized.sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start));
}
function loadData():StudentData{
  const initial=makeInitialData();
  try{
    const raw=localStorage.getItem(STORE_KEY);
    if(raw){
      const parsed=JSON.parse(raw) as Partial<StudentData>;
      const proposal='proposal' in parsed?parsed.proposal:initial.proposal;
      return {
        ...initial,...parsed,
        schedule:normalizeSchedule(Array.isArray(parsed.schedule)?parsed.schedule:initial.schedule,initial.schedule),
        proposal:proposal?{...proposal,schedule:normalizeSchedule(proposal.schedule,initial.schedule)}:null,
      };
    }
  }catch{/* Restore the local demo seed when storage is unavailable or malformed. */}
  return initial;
}
export function OpsProvider({children}:{children:ReactNode}){
  const [data,setData]=useState<StudentData>(loadData);
  const [toasts,setToasts]=useState<ToastRecord[]>([]);
  useEffect(()=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(data));}catch{/* The planner remains usable if browser storage is full. */}},[data]);
  const toast=(title:string,detail='',type:'success'|'info'='success')=>{
    const id=`toast-${Date.now()}-${Math.random()}`;setToasts(list=>[...list,{id,title,detail,type}]);
    window.setTimeout(()=>setToasts(list=>list.filter(item=>item.id!==id)),4000);
  };
  const value=useMemo<TimeOSContextValue>(()=>({
    data,toast,toasts,
    setProposal:proposal=>setData(current=>({...current,proposal})),
    applyProposal:()=>setData(current=>current.proposal?({...current,schedule:current.proposal.schedule,proposal:null}):current),
    toggleBlock:id=>setData(current=>({...current,schedule:current.schedule.map(item=>item.id===id?{...item,completed:!item.completed}:item)})),
    addBlock:block=>setData(current=>({...current,schedule:[...current.schedule,block].sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start))})),
    addTask:(task,block)=>setData(current=>({...current,tasks:[task,...current.tasks],schedule:[...current.schedule,block].sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start))})),
    toggleTask:id=>setData(current=>({...current,tasks:current.tasks.map(task=>task.id===id?{...task,completed:!task.completed}:task)})),
    importTimetable:blocks=>{
      let added=0;
      setData(current=>{const existing=new Set(current.schedule.map(item=>item.id));const fresh=blocks.filter(item=>!existing.has(item.id));added=fresh.length;return {...current,schedule:[...current.schedule,...fresh].sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start)),timetableImported:true};});
      return added;
    },
    resetDemo:()=>{const fresh=makeInitialData();setData(fresh);try{localStorage.removeItem(STORE_KEY);}catch{/* noop */}toast('Demo reset','Only your TimeOS planner data was restored.','info');},
  }),[data,toasts]);
  return <TimeOSContext.Provider value={value}>{children}<ToastStack toasts={toasts}/></TimeOSContext.Provider>;
}
export function useOps(){const value=useContext(TimeOSContext);if(!value)throw new Error('useOps must be used within OpsProvider');return value;}
function ToastStack({toasts}:{toasts:ToastRecord[]}){
  return <div className="toast-stack" aria-live="polite">{toasts.map(t=><div className="toast" key={t.id} data-testid={`toast-${t.id}`}><span className="toast-icon" aria-hidden="true">{t.type==='success'?'✓':'i'}</span><div><strong>{t.title}</strong><span>{t.detail}</span></div></div>)}</div>;
}