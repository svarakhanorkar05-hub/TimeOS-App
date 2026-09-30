import type { OpsData, Task, DocumentRecord } from './model';

const sources = ['Project Atlas Status Report', 'Vendor Evaluation', 'Engineering Meeting Notes'];
const docs: DocumentRecord[] = [
  { id:'doc-atlas', title:'Project Atlas Status Report', type:'Project report', department:'Engineering', uploadedAt:'2026-06-11', status:'Analyzed', summary:'Atlas is tracking toward its October integration milestone, but final Vendor Alpha API approval remains the critical path. Engineering has completed the sandbox build and needs a confirmed rate-limit contract before production integration.', keyDecisions:['Keep the October 3 integration milestone','Hold production rollout until API approval is documented'], actions:['Complete vendor API approval','Confirm rate-limit contract','Schedule integration readiness review'], deadlines:['Vendor approval — June 16, 2026','Integration readiness — June 23, 2026'], risks:['Vendor approval delay may block three downstream engineering tasks'], relatedProjects:['Project Atlas'], sources },
  { id:'doc-vendor', title:'Vendor Evaluation', type:'Evaluation', department:'Finance', uploadedAt:'2026-06-10', status:'Analyzed', summary:'Vendor Alpha scored highest for reliability and total cost of ownership. Finance requested a final security addendum and a six-month pricing checkpoint before contract signature.', keyDecisions:['Selected Vendor Alpha for Atlas integration'], actions:['Complete contract review','Approve the security addendum'], deadlines:['Contract review — June 18, 2026'], risks:['Security addendum has not been returned'], relatedProjects:['Project Atlas','Project Nova'], sources:['Vendor Evaluation','Finance Comparison','Security Review Notes'] },
  { id:'doc-finance', title:'Q3 Financial Planning', type:'Planning', department:'Finance', uploadedAt:'2026-06-09', status:'Analyzed', summary:'Q3 investment priorities are focused on platform reliability, customer onboarding and demand generation. Two cost-center approvals are needed before budget allocation.', keyDecisions:['Reserve 18% of platform budget for reliability work'], actions:['Approve platform budget','Confirm campaign allocation'], deadlines:['Budget sign-off — June 15, 2026'], risks:['Late budget approval could shift the Nova launch window'], relatedProjects:['Project Nova','Project Orion'], sources:['Q3 Financial Planning','Finance Leadership Notes'] },
  { id:'doc-eng', title:'Engineering Meeting Notes', type:'Meeting notes', department:'Engineering', uploadedAt:'2026-06-08', status:'Analyzed', summary:'The team aligned on the Atlas API integration sequence and identified a security review dependency. Priya will coordinate the vendor response while Rahul owns the integration test plan.', keyDecisions:['Run security review before production credentials are issued'], actions:['Complete security review','Publish integration test plan'], deadlines:['Security review — June 17, 2026'], risks:['Test environment access depends on vendor approval'], relatedProjects:['Project Atlas'], sources:['Engineering Meeting Notes','Project Atlas Status Report'] },
  { id:'doc-marketing', title:'Marketing Campaign Plan', type:'Campaign plan', department:'Marketing', uploadedAt:'2026-06-06', status:'Analyzed', summary:'The summer acquisition campaign is staged for a June 24 launch. Creative approvals and regional landing page assets remain open, with the West region most exposed to schedule compression.', keyDecisions:['Prioritize the West region launch assets'], actions:['Finalize campaign assets','Approve landing page copy'], deadlines:['Creative approval — June 14, 2026'], risks:['Late creative sign-off compresses QA window'], relatedProjects:['Project Nova'], sources:['Marketing Campaign Plan','Launch Calendar'] },
  { id:'doc-hr', title:'HR Policy Update', type:'Policy', department:'HR', uploadedAt:'2026-06-04', status:'Analyzed', summary:'The updated flexible-work policy introduces a quarterly manager review and a new equipment reimbursement workflow. Team leads should review the guidance before the next all-hands.', keyDecisions:['Adopt quarterly flexible-work reviews'], actions:['Share policy with department leads','Update reimbursement guide'], deadlines:['Policy acknowledgement — June 30, 2026'], risks:['No material operational risks identified'], relatedProjects:['Project Orion'], sources:['HR Policy Update','People Operations Handbook'] },
];

const taskRows: Array<[string,string,string,string,number,string]> = [
  ['Complete Vendor Alpha API approval','Project Atlas','Priya Shah','High',91,'Vendor security addendum'],
  ['Approve Q3 platform budget','Project Atlas','Sarah Wilson','High',78,'Finance committee review'],
  ['Complete Atlas security review','Project Atlas','Rahul Mehta','High',74,'Vendor API approval'],
  ['Finalize campaign creative assets','Project Nova','Daniel Lee','Medium',76,'Brand review'],
  ['Publish integration test plan','Project Atlas','Rahul Mehta','High',72,'API credentials'],
  ['Review client contract redlines','Project Orion','Sarah Wilson','Medium',38,'Legal review'],
  ['Confirm Nova launch audience','Project Nova','Alex Morgan','Medium',27,'Campaign brief'],
  ['Complete onboarding workflow map','Project Orion','Priya Shah','Medium',34,'Customer interviews'],
  ['Approve regional landing page copy','Project Nova','Daniel Lee','Medium',48,'Creative assets'],
  ['Schedule reliability readiness review','Project Atlas','Alex Morgan','Low',21,'Security review'],
  ['Document Orion data retention policy','Project Orion','Rahul Mehta','Low',18,'Privacy review'],
  ['Review platform vendor invoice','Project Atlas','Sarah Wilson','Medium',31,'Purchase order'],
  ['Prepare customer success handoff','Project Nova','Alex Morgan','Low',12,'Launch audience'],
  ['Complete Q3 forecast validation','Project Orion','Sarah Wilson','Medium',42,'Budget approval'],
  ['Update sales enablement deck','Project Nova','Daniel Lee','Low',23,'Product messaging'],
  ['Confirm infrastructure capacity','Project Atlas','Rahul Mehta','Medium',36,'Load test results'],
  ['Review support escalation matrix','Project Orion','Priya Shah','Low',19,'Service model'],
  ['Approve analytics event taxonomy','Project Nova','Alex Morgan','Medium',44,'Data schema'],
  ['Deliver Atlas sandbox walkthrough','Project Atlas','Rahul Mehta','Medium',29,'API approval'],
  ['Validate procurement controls','Project Orion','Sarah Wilson','Low',25,'Policy update'],
  ['Coordinate cross-team launch review','Project Nova','Priya Shah','Medium',55,'Creative approval'],
  ['Complete customer interview synthesis','Project Orion','Daniel Lee','Low',20,'Interview schedule'],
  ['Resolve legacy access permissions','Project Atlas','Rahul Mehta','Medium',47,'Security review'],
  ['Publish product readiness notes','Project Nova','Alex Morgan','Low',16,'Launch review'],
  ['Confirm HR policy acknowledgements','Project Orion','Priya Shah','Low',11,'Manager review'],
  ['Prepare finance close checklist','Project Atlas','Sarah Wilson','Medium',33,'Q3 plan'],
  ['Review partner support coverage','Project Nova','Daniel Lee','Low',15,'Partner contract'],
  ['Close Atlas API approval','Project Atlas','Priya Shah','High',86,'Vendor Evaluation'],
];
const overdueTitles = new Set(['Review client contract redlines','Finalize campaign creative assets','Approve regional landing page copy']);
const tasks: Task[] = taskRows.map(([title,project,owner,priority,riskScore,dependency],i) => ({
  id:`task-${i+1}`, title, project, owner, priority:priority as Task['priority'],
  deadline:overdueTitles.has(title) ? '2026-06-08' : new Date(Date.UTC(2026,5,12)+((i%8)+1)*86400000).toISOString().slice(0,10),
  status:overdueTitles.has(title) ? 'Overdue' : i===3 || i===0 ? 'In progress' : 'To do',
  riskScore:i===27?66:riskScore, dependency,
}));

export const initialData: OpsData = {
  documents:docs,tasks,
  projects:[
    {id:'p-atlas',name:'Project Atlas',status:'At risk',health:71},
    {id:'p-nova',name:'Project Nova',status:'On track',health:89},
    {id:'p-orion',name:'Project Orion',status:'On track',health:94},
    ...['Project Meridian','Project Summit','Project Beacon','Project Cedar','Project Horizon','Project Juniper','Project Solstice','Project Vertex','Project Willow'].map((name,i)=>({id:`p-extra-${i}`,name,status:i===5?'At risk':'On track',health:88-i%9})),
  ],
  risks:[
    {id:'risk-vendor',title:'Vendor approval delay',severity:'High',probability:82,impact:'High',affectedTasks:3,recommendation:'Escalate approval to Finance leadership within 24 hours and request a firm security addendum delivery date.',project:'Project Atlas',detail:'Vendor Alpha API approval is a critical-path dependency for integration credentials, security review and the Atlas readiness review. Current vendor response time is 2 business days beyond the expected window.'},
    {id:'risk-budget',title:'Q3 budget sign-off approaching',severity:'Medium',probability:61,impact:'High',affectedTasks:2,recommendation:'Book a 20-minute approval checkpoint with Finance before tomorrow afternoon.',project:'Project Atlas',detail:'Budget committee sign-off is needed to reserve platform reliability capacity. Missing the June 15 checkpoint could shift the Nova launch window.'},
    {id:'risk-campaign',title:'Campaign asset review is overdue',severity:'Medium',probability:67,impact:'Medium',affectedTasks:2,recommendation:'Ask Marketing to approve the West region creative set and protect the QA window.',project:'Project Nova',detail:'Creative assets have not cleared brand review. Landing-page QA needs two full working days before the scheduled campaign launch.'},
    {id:'risk-security',title:'Security review dependency',severity:'High',probability:72,impact:'High',affectedTasks:2,recommendation:'Reserve a security reviewer now while vendor evidence is being finalized.',project:'Project Atlas',detail:'Production credentials cannot be released until the security review is complete. The reviewer calendar is filling for next week.'},
    {id:'risk-capacity',title:'Engineering capacity compression',severity:'Low',probability:39,impact:'Medium',affectedTasks:4,recommendation:'Confirm the integration test owner and rebalance sprint work at stand-up.',project:'Project Atlas',detail:'Four engineering tasks converge during the integration readiness window. Current delivery remains feasible if owners are confirmed.'},
  ],
  decisions:[{id:'decision-vendor',title:'Selected Vendor Alpha',date:'2026-05-28',decisionMakers:['Engineering','Finance'],reason:'Lower integration cost and stronger API reliability, with a better support commitment for the Atlas rollout.',evidence:['Vendor Evaluation','Engineering Meeting Notes','Finance Comparison'],relatedTasks:['Complete Vendor Alpha API approval','Complete Atlas security review','Review client contract redlines']}],
  activities:[
    {id:'act-1',label:'Analyzed Project Atlas report',time:'8 min ago'},
    {id:'act-2',label:'Detected 4 action items across 2 documents',time:'24 min ago'},
    {id:'act-3',label:'Identified 2 critical dependencies',time:'1 hr ago'},
    {id:'act-4',label:'Scheduled 2 follow-up reminders',time:'2 hrs ago'},
  ],
  insights:[
    {id:'ins-1',title:'Engineering workload concentration',description:'Engineering currently owns 42% of all pending high-priority work. Rebalance one Atlas review task to Operations to protect the integration window.',category:'Workload'},
    {id:'ins-2',title:'Vendor dependencies are clustering',description:'Vendor-related dependencies account for 35% of current project risk exposure. A single approval checkpoint would unblock three Atlas tasks.',category:'Risk trend'},
    {id:'ins-3',title:'Five deadlines are approaching',description:'Five deadlines fall within the next 72 hours. Two need an owner confirmation and one is already overdue.',category:'Deadlines'},
  ],
  preferences:{compact:false,reminders:true,weeklyDigest:true},
};