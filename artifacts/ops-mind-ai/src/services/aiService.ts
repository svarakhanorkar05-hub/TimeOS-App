import type { DocumentRecord, Insight, Risk, Task } from '../data/model';

const wait = (ms=650) => new Promise(resolve => window.setTimeout(resolve, ms));
export async function analyzeDocument(document:DocumentRecord) {
  await wait();
  return {summary:document.summary, actions:document.actions, risks:document.risks, citations:document.sources};
}
export async function extractTasks(document:DocumentRecord):Promise<Task[]> {
  await wait(450);
  const atlas = document.title.toLowerCase().includes('atlas');
  return [{
    id:`task-ai-${Date.now()}`, title:atlas?'Complete Vendor Alpha API approval':document.actions[0] || `Review ${document.title}`,
    project:document.relatedProjects[0] || 'Project Atlas', owner:atlas?'Priya Shah':'Alex Morgan',
    priority:'High', deadline:atlas?'2026-06-16':'2026-06-19', status:'To do', riskScore:82,
    dependency:atlas?'Vendor security addendum':'Source document review',
  }];
}
export async function detectRisks(document:DocumentRecord):Promise<Partial<Risk>[]> {
  await wait(350);
  if (document.title.includes('Atlas')) return [{title:'Vendor approval delay',severity:'High',probability:82,impact:'High',affectedTasks:3,project:'Project Atlas',recommendation:'Escalate approval to Finance leadership within 24 hours.'}];
  return document.risks.map(title=>({title,severity:'Medium',probability:58,impact:'Medium',affectedTasks:1,project:document.relatedProjects[0]||'Project Nova',recommendation:'Confirm an accountable owner and review the deadline at the next team check-in.'}));
}
export async function answerEnterpriseQuestion(question:string, docs:DocumentRecord[]) {
  await wait(900);
  const q=question.toLowerCase();
  if (q.includes('vendor') || q.includes('alpha') || q.includes('why')) return {
    answer:'Vendor Alpha was selected because it offered lower integration cost and stronger API reliability, alongside a more responsive support commitment for the Atlas rollout. The decision is documented, but final approval of the security addendum is still outstanding. That approval currently gates three downstream engineering tasks.',
    sources:['Vendor Evaluation','Engineering Meeting Notes','Finance Comparison'],
  };
  if (q.includes('overdue')) return {
    answer:'There are 3 overdue actions across the portfolio. Marketing creative review and the regional landing-page copy are blocking the Nova launch QA window; the client contract redlines also need a named reviewer. I recommend confirming owners today.',
    sources:['Marketing Campaign Plan','Client Contract Review','Launch Calendar'],
  };
  if (q.includes('deadline') || q.includes('approach')) return {
    answer:'Five deadlines fall within the next 72 hours. The closest critical checkpoint is the Q3 platform budget sign-off on June 15, followed by Vendor Alpha API approval on June 16 and the Atlas security review on June 17.',
    sources:['Q3 Financial Planning','Project Atlas Status Report','Engineering Meeting Notes'],
  };
  if (q.includes('block') || q.includes('risk')) return {
    answer:'Project Atlas is the only project currently on the critical path. Vendor Alpha API approval is pending and blocks integration credentials, security review and the readiness review. Nova remains on track, although campaign assets need a prompt approval.',
    sources:['Project Atlas Status Report','Vendor Evaluation','Engineering Meeting Notes'],
  };
  return {answer:`I found ${docs.length} relevant enterprise records. The clearest signal is that teams have documented owners and delivery milestones, but vendor approval and cross-functional review remain the main dependencies. You can open the cited records to trace each recommendation back to its source.`,sources:['Project Atlas Status Report','Q3 Financial Planning','Marketing Campaign Plan']};
}
export async function generateInsights():Promise<Insight[]> {
  await wait(700);
  return [
    {id:`ins-${Date.now()}`,title:'A single approval can recover Atlas schedule',description:'Vendor Alpha approval is upstream of three engineering actions. A 24-hour Finance escalation is likely to protect the June integration readiness checkpoint.',category:'Recommendation'},
    {id:`ins-${Date.now()}-b`,title:'Review load is uneven across departments',description:'Engineering owns 42% of the open high-priority work. Moving one readiness review to Operations would reduce single-team exposure.',category:'Workload'},
  ];
}
export async function explainDecision() {
  await wait(550);
  return 'Vendor Alpha was selected after Engineering and Finance compared reliability, support responsiveness and total integration cost. It was the strongest fit for the Atlas rollout, with a lower integration cost and more reliable API than the alternatives. The remaining open item is the security addendum, not the vendor decision itself.';
}