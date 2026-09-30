import type { ReactNode } from 'react';
import { ArrowUpRight, Check, X } from 'lucide-react';

export function PageHeading({eyebrow,title,subtitle,actions}:{eyebrow?:string;title:string;subtitle?:string;actions?:ReactNode}) {
  return <div className="page-heading animate-in"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1 className="page-title">{title}</h1>{subtitle&&<p className="page-subtitle">{subtitle}</p>}</div>{actions&&<div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>{actions}</div>}</div>;
}
export function Panel({children,className='',style}:{children:ReactNode;className?:string;style?:React.CSSProperties}) {
  return <section className={`panel ${className}`} style={style}>{children}</section>;
}
export function PanelTitle({title,subtitle,action}:{title:string;subtitle?:string;action?:ReactNode}) {
  return <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}><div><h2 className="section-title">{title}</h2>{subtitle&&<div className="section-subtitle">{subtitle}</div>}</div>{action}</div>;
}
export function StatusPill({status}:{status:string}) {
  const s=status.toLowerCase();
  const cls=s.includes('complete')?'pill-done':s.includes('progress')?'pill-progress':s.includes('block')||s.includes('overdue')?'pill-risk':s.includes('review')||s.includes('risk')?'pill-review':'pill-pending';
  return <span className={`status-pill ${cls}`}>{status}</span>;
}
export function PriorityPill({priority}:{priority:string}){return <span className={`priority-pill priority-${priority.toLowerCase()}`}>{priority}</span>}
export function EmptyState({title,detail,action}:{title:string;detail:string;action?:ReactNode}) {
  return <div className="empty-state"><div className="empty-icon"><Check size={20}/></div><strong>{title}</strong><p>{detail}</p>{action}</div>;
}
export function Modal({title,subtitle,onClose,children,footer}:{title:string;subtitle?:string;onClose:()=>void;children:ReactNode;footer?:ReactNode}) {
  return <div className="detail-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header className="modal-header"><div><h2 className="modal-title">{title}</h2>{subtitle&&<div className="section-subtitle">{subtitle}</div>}</div><button className="modal-close" onClick={onClose} aria-label="Close dialog" data-testid="button-close-modal"><X size={16}/></button></header><div className="modal-body">{children}</div>{footer&&<footer className="modal-footer">{footer}</footer>}</section></div>;
}
export function SourceButton({label,onClick}:{label:string;onClick:()=>void}) {
  return <button className="source-chip" onClick={onClick} data-testid={`source-${label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}><span>{label}</span><ArrowUpRight size={11}/></button>;
}