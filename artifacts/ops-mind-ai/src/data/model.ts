export type TaskStatus = 'To do' | 'In progress' | 'Blocked' | 'Completed' | 'Overdue';
export type Priority = 'High' | 'Medium' | 'Low';
export interface DocumentRecord {
  id: string; title: string; type: string; department: string; uploadedAt: string; status: string;
  summary: string; keyDecisions: string[]; actions: string[]; deadlines: string[]; risks: string[];
  relatedProjects: string[]; sources: string[];
}
export interface Task {
  id: string; title: string; project: string; owner: string; priority: Priority; deadline: string;
  status: TaskStatus; riskScore: number; dependency: string;
}
export interface Project { id: string; name: string; status: string; health: number }
export interface Risk {
  id: string; title: string; severity: 'High' | 'Medium' | 'Low'; probability: number; impact: string;
  affectedTasks: number; recommendation: string; project: string; detail: string;
}
export interface Decision {
  id: string; title: string; date: string; decisionMakers: string[]; reason: string;
  evidence: string[]; relatedTasks: string[];
}
export interface Activity { id: string; label: string; time: string }
export interface Insight { id: string; title: string; description: string; category: string }
export interface OpsData {
  documents: DocumentRecord[]; tasks: Task[]; projects: Project[]; risks: Risk[];
  decisions: Decision[]; activities: Activity[]; insights: Insight[];
  preferences: { compact: boolean; reminders: boolean; weeklyDigest: boolean };
}