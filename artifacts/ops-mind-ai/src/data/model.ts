export type BlockCategory = 'Academic' | 'Deep Work' | 'Wellness' | 'Social' | 'Sleep' | 'Personal';
export type PreferredTime = 'Morning' | 'Night Owl' | 'Flexible';
export type TaskStatus = 'backlog' | 'today' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'normal' | 'high';
export type EnergyPreference = 'Morning Person' | 'Night Owl';
export interface ScheduleBlock {
  id: string; title: string; category: BlockCategory; date: string; start: string; end: string;
  why: string; completed: boolean; protected?: boolean; source?: 'timetable' | 'goal' | 'commitment';
}
export interface StudentTask {
  id: string; title: string; category: BlockCategory; hours: number; deadline: string;
  preferredTime: PreferredTime; completed: boolean; status?: TaskStatus; priority?: TaskPriority;
}
export interface StudentPreferences {
  energyPreference: EnergyPreference; minimumSleepHours: number; commuteBufferMinutes: number;
}
export interface AttendanceRecord {
  id: string; subject: string; percentage: number; safeThreshold: number; sessionsUntilAlert?: number;
}
export interface ScheduleChange { id: string; title: string; from: string; to: string; reason: string; protected?: boolean }
export interface ScheduleProposal {
  id: string; scenario: string; summary: string; reasoning: string; changes: ScheduleChange[];
  protection: string[]; schedule: ScheduleBlock[];
}
export interface StudentData {
  schedule: ScheduleBlock[]; tasks: StudentTask[]; attendance: AttendanceRecord[];
  preferences: StudentPreferences; timetableImported: boolean;
  proposal: ScheduleProposal | null;
}