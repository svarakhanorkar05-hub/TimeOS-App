import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { initialData } from '../data/seed';
import type { Activity, DocumentRecord, OpsData, Risk, Task } from '../data/model';

interface OpsContextValue {
  data: OpsData; updateTask:(id:string,patch:Partial<Task>)=>void; addTask:(task:Task)=>void;
  addDocument:(doc:DocumentRecord)=>void; addRisk:(risk:Risk)=>void; addActivity:(label:string)=>void;
  addInsights:(items:OpsData['insights'])=>void;
  updatePreference:(key:keyof OpsData['preferences'],value:boolean)=>void; resetDemo:()=>void;
  toast:(title:string,detail?:string,type?:'success'|'info')=>void; toasts:ToastRecord[]; dismissToast:(id:string)=>void;
}
interface ToastRecord {id:string;title:string;detail:string;type:'success'|'info'}
const OpsContext=createContext<OpsContextValue|null>(null);
const STORE_KEY='opsmind-demo-v1';
export function OpsProvider({children}:{children:ReactNode}) {
  const [data,setData]=useState<OpsData>(()=>{try{const raw=localStorage.getItem(STORE_KEY);return raw?{...initialData,...JSON.parse(raw)}:initialData;}catch{return initialData;}});
  const [toasts,setToasts]=useState<ToastRecord[]>([]);
  useEffect(()=>{localStorage.setItem(STORE_KEY,JSON.stringify(data));},[data]);
  const toast=(title:string,detail='',type:'success'|'info'='success')=>{
    const id=`toast-${Date.now()}-${Math.random()}`;
    setToasts(items=>[...items,{id,title,detail,type}]);
    window.setTimeout(()=>setToasts(items=>items.filter(t=>t.id!==id)),4300);
  };
  const addActivity=(label:string)=>setData(current=>({...current,activities:[{id:`activity-${Date.now()}`,label,time:'Just now'},...current.activities].slice(0,8)}));
  const value=useMemo<OpsContextValue>(()=>({
    data,
    updateTask:(id,patch)=>setData(current=>({...current,tasks:current.tasks.map(task=>task.id===id?{...task,...patch}:task)})),
    addTask:task=>setData(current=>({...current,tasks:[task,...current.tasks]})),
    addDocument:doc=>setData(current=>({...current,documents:[doc,...current.documents]})),
    addRisk:risk=>setData(current=>({...current,risks:[risk,...current.risks]})),
    addActivity,
    addInsights:items=>setData(current=>({...current,insights:[...items.filter(item=>!current.insights.some(existing=>existing.title===item.title)),...current.insights]})),
    updatePreference:(key,value)=>setData(current=>({...current,preferences:{...current.preferences,[key]:value}})),
    resetDemo:()=>{localStorage.removeItem(STORE_KEY);setData(initialData);toast('Demo data restored','All workspace changes have been reset.','info');},
    toast,toasts,dismissToast:id=>setToasts(items=>items.filter(t=>t.id!==id)),
  }),[data,toasts]);
  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>;
}
export function useOps(){const value=useContext(OpsContext);if(!value)throw new Error('useOps must be used within OpsProvider');return value;}
export function ToastStack(){
  const {toasts}=useOps();
  return <div className="toast-stack" aria-live="polite">{toasts.map(t=><div className={`toast ${t.type}`} key={t.id} data-testid={`toast-${t.id}`}><span className="toast-icon">{t.type==='success'?'✓':'i'}</span><div><strong>{t.title}</strong>{t.detail&&<span>{t.detail}</span>}</div></div>)}</div>;
}
export type { Activity };