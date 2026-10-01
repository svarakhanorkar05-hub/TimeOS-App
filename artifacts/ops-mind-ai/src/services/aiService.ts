import type { BlockCategory, ScheduleBlock, ScheduleProposal } from '../data/model';
import { formatDay, localDate, makeFestivalProposal, saturdayDate, tomorrowDate } from '../data/seed';

const pause=(ms=850)=>new Promise<void>(resolve=>window.setTimeout(resolve,ms));
const block=(id:string,title:string,category:BlockCategory,date:string,start:string,end:string,why:string,protectedTime=false):ScheduleBlock=>({id,title,category,date,start,end,why,completed:false,protected:protectedTime});
export async function analyzeScheduleScenario(text:string,schedule:ScheduleBlock[],minimumSleepHours=7.5):Promise<ScheduleProposal>{
  await pause(920);
  const query=text.toLowerCase();
  const sleepProtection=`${minimumSleepHours} hours sleep · protected`;
  if(query.includes('festival')||query.includes('5 pm')||query.includes('5–10')||query.includes('5-10'))return makeFestivalProposal(schedule,minimumSleepHours);
  if(query.includes('energy')||query.includes('low')||query.includes('tired')){
    const updated=schedule.map(item=>item.id==='dbms-study'?{...item,date:saturdayDate,start:'09:00',end:'10:30',why:'Deferred because today is a low-energy day; return to it after rest.'}:item);
    return {id:`proposal-energy-${Date.now()}`,scenario:text,summary:'Today gets lighter. The heavy DBMS study moves to a rested morning; essentials, movement and sleep stay protected.',reasoning:'I found 4 mentally demanding commitments. I moved the heaviest flexible study block and kept your fixed classes, meals and recovery time intact.',changes:[{id:'dbms-study',title:'DBMS assignment study',from:'Today · 20:00–21:15',to:`${formatDay(saturdayDate)} · 09:00–10:30`,reason:'Heavy study deferred to a higher-energy window.'}],protection:['Meals & reset time',sleepProtection],schedule:updated};
  }
  if(query.includes('deadline')||query.includes('dbms')||query.includes('assignment')||query.includes('one day')){
    const updated=schedule.map(item=>item.id==='dbms-study'?{...item,date:tomorrowDate,start:'08:30',end:'10:30',why:'Moved earlier to protect the newly advanced DBMS deadline.'}:item);
    return {id:`proposal-deadline-${Date.now()}`,scenario:text,summary:'The DBMS assignment moves into tomorrow morning. Lighter review stays optional and sleep remains protected.',reasoning:'The deadline moved forward by a day, so I prioritized the DBMS assignment in your clearest morning window without displacing fixed classes.',changes:[{id:'dbms-study',title:'DBMS assignment study',from:'Today · 20:00–21:15',to:'Tomorrow · 08:30–10:30',reason:'Earlier deadline needs a focused, earlier start.'}],protection:['Fixed lectures remain unchanged',sleepProtection],schedule:updated};
  }
  const updated=schedule.map(item=>item.id==='dbms-study'?{...item,date:saturdayDate,start:'09:00',end:'10:30',why:'Rescheduled to leave room for your new commitment.'}:item);
  const event=block(`whatif-${Date.now()}`,'New commitment','Social',tomorrowDate,'17:00','18:00','Added from your what-if scenario.',true);
  updated.push(event);
  return {id:`proposal-custom-${Date.now()}`,scenario:text,summary:'I made room for your new commitment by shifting flexible study, while preserving classes and rest.',reasoning:'I compared the new request with your existing commitments and found one flexible block to move.',changes:[{id:'dbms-study',title:'DBMS assignment study',from:'Today · 20:00–21:15',to:`${formatDay(saturdayDate)} · 09:00–10:30`,reason:'Moved to make the new plan fit.'},{id:event.id,title:'New commitment',from:'Not scheduled',to:`${formatDay(tomorrowDate)} · 17:00–18:00`,reason:'Added as protected personal time.',protected:true}],protection:['New commitment protected',sleepProtection],schedule:updated};
}
export async function simulateTimetableOCR(_fileName='Sample university timetable',commuteBufferMinutes=15):Promise<ScheduleBlock[]>{
  await pause(1050);
  const commuteMinutes=Math.max(0,Math.min(60,commuteBufferMinutes));
  const monday=new Date(`${localDate}T12:00:00`);
  const day=monday.getDay();
  monday.setDate(monday.getDate()+((8-day)%7||7));
  const dateFor=(weekday:number)=>{
    const date=new Date(monday);
    date.setDate(monday.getDate()+weekday-1);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  };
  const lessons=[
    {id:'dbms-mon',title:'Database Systems · Lecture',date:dateFor(1),start:'09:00',end:'10:30'},
    {id:'hci-mon',title:'HCI Studio',date:dateFor(1),start:'14:00',end:'15:30'},
    {id:'os-tue',title:'Operating Systems · Lecture',date:dateFor(2),start:'10:00',end:'11:30'},
    {id:'math-tue',title:'Discrete Mathematics · Tutorial',date:dateFor(2),start:'15:00',end:'16:00'},
    {id:'hci-wed',title:'Human–Computer Interaction · Studio',date:dateFor(3),start:'13:30',end:'15:00'},
    {id:'os-lab-wed',title:'Operating Systems · Lab',date:dateFor(3),start:'15:30',end:'17:00'},
    {id:'dbms-thu',title:'Database Systems · Lecture',date:dateFor(4),start:'09:00',end:'10:30'},
    {id:'os-thu',title:'Operating Systems · Seminar',date:dateFor(4),start:'11:00',end:'12:30'},
    {id:'hci-fri',title:'Human–Computer Interaction · Studio',date:dateFor(5),start:'10:00',end:'11:30'},
    {id:'math-fri',title:'Discrete Mathematics · Tutorial',date:dateFor(5),start:'14:00',end:'15:30'},
  ];
  return lessons.flatMap((lesson,index)=>{
    const lecture={...block(`ocr-${lesson.id}-${lesson.date}`,lesson.title,'Academic',lesson.date,lesson.start,lesson.end,'Parsed from your timetable; fixed lecture block.'),source:'timetable' as const};
    if(!commuteMinutes)return [lecture];
    const lectureStart=Number(lesson.start.slice(0,2))*60+Number(lesson.start.slice(3));
    const previous=lessons.slice(0,index).filter(item=>item.date===lesson.date).sort((a,b)=>a.start.localeCompare(b.start)).at(-1);
    const previousEnd=previous?Number(previous.end.slice(0,2))*60+Number(previous.end.slice(3)):0;
    const bufferStart=Math.max(lectureStart-commuteMinutes,previousEnd);
    if(bufferStart>=lectureStart)return [lecture];
    const start=`${String(Math.floor(bufferStart/60)).padStart(2,'0')}:${String(bufferStart%60).padStart(2,'0')}`;
    const buffer={...block(`commute-${lesson.id}-${lesson.date}`,`Commute buffer · ${lesson.title.split(' · ')[0]}`,'Personal',lesson.date,start,lesson.start,'Travel buffer added from your student preferences.',true),source:'timetable' as const};
    return [buffer,lecture];
  });
}