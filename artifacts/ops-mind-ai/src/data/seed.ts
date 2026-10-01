import type { ScheduleBlock, ScheduleProposal, StudentData } from './model';

const shiftDate = (offset: number) => {
  const date = new Date(); date.setHours(12, 0, 0, 0); date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
export const localDate = shiftDate(0);
export const tomorrowDate = shiftDate(1);
export const saturdayDate = shiftDate((6 - new Date().getDay() + 7) % 7 || 7);
export const formatDay = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const block = (id:string,title:string,category:ScheduleBlock['category'],date:string,start:string,end:string,why:string,extra:Partial<ScheduleBlock>={}):ScheduleBlock=>({id,title,category,date,start,end,why,completed:false,...extra});
export const makeInitialSchedule = (): ScheduleBlock[] => [
  block('dbms-lecture','Database Systems Lecture','Academic',localDate,'09:00','11:00','Fixed lecture; your morning focus is strongest for new concepts.'),
  block('coffee-break','Coffee & reset','Personal',localDate,'11:15','11:45','A short reset helps consolidate the lecture before the next block.'),
  block('os-seminar','Operating Systems Seminar','Academic',localDate,'12:00','13:00','A scheduled course session with a little buffer before lunch.'),
  block('lunch','Lunch with Maya','Social',localDate,'13:00','14:00','A real break and time with a friend belongs in the plan.'),
  block('react-hackathon','React Hackathon Project','Deep Work',localDate,'14:00','16:00','Protected peak cognitive window for your most creative project.'),
  block('reading','Operating Systems reading','Academic',localDate,'16:15','17:00','A lighter review fits after the deep-work block.'),
  block('gym','Gym / Strength Workout','Wellness',localDate,'17:30','18:30','Movement at the end of the day supports energy and sleep.'),
  block('dinner','Dinner & decompress','Personal',localDate,'19:00','20:00','Fuel and a genuine pause before the evening.'),
  block('dbms-study','DBMS assignment study','Deep Work',localDate,'20:00','21:15','A contained review session; stop before it crowds out rest.'),
  block('club-checkin','Design club check-in','Social',localDate,'21:15','21:45','A small social connection, not another productivity task.'),
  ...Array.from(new Set([localDate,tomorrowDate,saturdayDate])).map(date=>
    block(`sleep-${date}`,'Protected sleep','Sleep',date,'23:00','07:00','Non-negotiable overnight sleep window; 7.5 hours of sleep are protected.',{protected:true})
  ),
  block('tomorrow-dbms','DBMS assignment study','Deep Work',tomorrowDate,'10:00','12:00','Assignment focus before the afternoon gets busy.'),
  block('tomorrow-lunch','Lunch on campus','Personal',tomorrowDate,'12:00','13:00','A protected meal break.'),
  block('tomorrow-project','React Hackathon Project','Deep Work',tomorrowDate,'14:00','16:00','Continue the prototype during a high-focus window.'),
  block('tomorrow-os','Operating Systems lecture','Academic',tomorrowDate,'16:00','17:00','Fixed course commitment.'),
  block('saturday-project','React Hackathon Project','Deep Work',saturdayDate,'10:00','12:00','Weekend build session with a clear stop time.'),
  block('saturday-social','Brunch with friends','Social',saturdayDate,'12:30','14:00','Social time is part of a balanced week.'),
];
export const makeFestivalProposal = (schedule:ScheduleBlock[],minimumSleepHours=7.5):ScheduleProposal => {
  const adjusted=schedule.map(item=>item.id==='tomorrow-dbms'?{...item,date:saturdayDate,start:'09:00',end:'10:30',why:'Moved out of festival day; a calm morning slot protects the deadline.'}:item.id==='tomorrow-project'?{...item,date:saturdayDate,start:'10:45',end:'12:45',why:'Moved to Saturday morning so your festival stays truly free.'}:item);
  adjusted.push(block('festival-protected','College festival','Social',tomorrowDate,'17:00','22:00','Protected social time — the schedule now works around your festival.',{protected:true}));
  return {id:'proposal-festival',scenario:'College festival tomorrow 5–10 PM',summary:'Your festival is protected. Two flexible study blocks move to Saturday morning, while sleep and fixed lectures stay untouched.',reasoning:'I found 4 commitments on festival day. I moved flexible study, kept the fixed Operating Systems lecture, and left your evening open.',changes:[
    {id:'tomorrow-dbms',title:'DBMS assignment study',from:`Tomorrow · 10:00–12:00`,to:`${formatDay(saturdayDate)} · 09:00–10:30`,reason:'Moved earlier to keep the assignment on track.'},
    {id:'tomorrow-project',title:'React Hackathon Project',from:'Tomorrow · 14:00–16:00',to:`${formatDay(saturdayDate)} · 10:45–12:45`,reason:'Flexible deep work shifted away from festival time.'},
    {id:'festival-protected',title:'College festival',from:'Not scheduled',to:'Tomorrow · 17:00–22:00',reason:'Added and protected as social time.',protected:true},
  ],protection:['College festival · 5 hours',`${minimumSleepHours} hours sleep · protected`],schedule:adjusted};
};
export const makeInitialData = ():StudentData => {
  const schedule=makeInitialSchedule();
  return {schedule,tasks:[
    {id:'task-dbms',title:'Finish normalization problem set',category:'Academic',hours:1.5,deadline:tomorrowDate,preferredTime:'Morning',completed:false,status:'today',priority:'high'},
    {id:'task-lab',title:'Prepare OS lab notes',category:'Academic',hours:1,deadline:shiftDate(2),preferredTime:'Flexible',completed:false,status:'in-progress',priority:'normal'},
    {id:'task-personal',title:'Pick up groceries',category:'Personal',hours:.5,deadline:shiftDate(1),preferredTime:'Flexible',completed:false,status:'backlog',priority:'low'},
  ],attendance:[
    {id:'dbms-attendance',subject:'Database Systems',percentage:82,safeThreshold:75},
    {id:'os-attendance',subject:'Operating Systems',percentage:74,safeThreshold:75,sessionsUntilAlert:1},
  ],preferences:{energyPreference:'Morning Person',minimumSleepHours:7.5,commuteBufferMinutes:15},timetableImported:false,proposal:makeFestivalProposal(schedule)};
};