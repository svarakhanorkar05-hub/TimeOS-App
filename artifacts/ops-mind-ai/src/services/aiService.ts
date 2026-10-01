import type { BlockCategory, ScheduleBlock, ScheduleProposal } from '../data/model';
import { formatDay, localDate, makeFestivalProposal, saturdayDate, tomorrowDate } from '../data/seed';

const pause=(ms=850)=>new Promise<void>(resolve=>window.setTimeout(resolve,ms));
const block=(id:string,title:string,category:BlockCategory,date:string,start:string,end:string,why:string,protectedTime=false):ScheduleBlock=>({id,title,category,date,start,end,why,completed:false,protected:protectedTime});
export async function analyzeScheduleScenario(text:string,schedule:ScheduleBlock[]):Promise<ScheduleProposal>{
  await pause(920);
  const query=text.toLowerCase();
  if(query.includes('festival')||query.includes('5 pm')||query.includes('5–10')||query.includes('5-10'))return makeFestivalProposal(schedule);
  if(query.includes('energy')||query.includes('low')||query.includes('tired')){
    const updated=schedule.map(item=>item.id==='dbms-study'?{...item,date:saturdayDate,start:'09:00',end:'10:30',why:'Deferred because today is a low-energy day; return to it after rest.'}:item);
    return {id:`proposal-energy-${Date.now()}`,scenario:text,summary:'Today gets lighter. The heavy DBMS study moves to a rested morning; essentials, movement and sleep stay protected.',reasoning:'I found 4 mentally demanding commitments. I moved the heaviest flexible study block and kept your fixed classes, meals and recovery time intact.',changes:[{id:'dbms-study',title:'DBMS assignment study',from:'Today · 20:00–21:15',to:`${formatDay(saturdayDate)} · 09:00–10:30`,reason:'Heavy study deferred to a higher-energy window.'}],protection:['Meals & reset time','7.5 hours sleep · protected'],schedule:updated};
  }
  if(query.includes('deadline')||query.includes('dbms')||query.includes('assignment')||query.includes('one day')){
    const updated=schedule.map(item=>item.id==='dbms-study'?{...item,date:tomorrowDate,start:'08:30',end:'10:30',why:'Moved earlier to protect the newly advanced DBMS deadline.'}:item);
    return {id:`proposal-deadline-${Date.now()}`,scenario:text,summary:'The DBMS assignment moves into tomorrow morning. Lighter review stays optional and sleep remains protected.',reasoning:'The deadline moved forward by a day, so I prioritized the DBMS assignment in your clearest morning window without displacing fixed classes.',changes:[{id:'dbms-study',title:'DBMS assignment study',from:'Today · 20:00–21:15',to:'Tomorrow · 08:30–10:30',reason:'Earlier deadline needs a focused, earlier start.'}],protection:['Fixed lectures remain unchanged','7.5 hours sleep · protected'],schedule:updated};
  }
  const updated=schedule.map(item=>item.id==='dbms-study'?{...item,date:saturdayDate,start:'09:00',end:'10:30',why:'Rescheduled to leave room for your new commitment.'}:item);
  const event=block(`whatif-${Date.now()}`,'New commitment','Social',tomorrowDate,'17:00','18:00','Added from your what-if scenario.',true);
  updated.push(event);
  return {id:`proposal-custom-${Date.now()}`,scenario:text,summary:'I made room for your new commitment by shifting flexible study, while preserving classes and rest.',reasoning:'I compared the new request with your existing commitments and found one flexible block to move.',changes:[{id:'dbms-study',title:'DBMS assignment study',from:'Today · 20:00–21:15',to:`${formatDay(saturdayDate)} · 09:00–10:30`,reason:'Moved to make the new plan fit.'},{id:event.id,title:'New commitment',from:'Not scheduled',to:`${formatDay(tomorrowDate)} · 17:00–18:00`,reason:'Added as protected personal time.',protected:true}],protection:['New commitment protected','7.5 hours sleep · protected'],schedule:updated};
}
export async function simulateTimetableOCR(fileName='Sample university timetable'):Promise<ScheduleBlock[]>{
  await pause(1050);
  const d=tomorrowDate;
  return [
    block('ocr-lecture-dbms','Database Systems · Lecture','Academic',d,'09:00','10:30','Parsed from your timetable; fixed lecture block.'),
    block('ocr-lecture-os','Operating Systems · Lecture','Academic',d,'11:00','12:30','Parsed from your timetable; fixed lecture block.'),
    block('ocr-lecture-hci','Human–Computer Interaction · Studio','Academic',d,'13:30','15:00','Parsed from your timetable; studio session.'),
    block('ocr-lecture-math','Discrete Mathematics · Tutorial','Academic',d,'15:30','16:30','Parsed from your timetable; tutorial block.'),
  ];
}