/*
  PROFILES — from 00-cities.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface PROFILESShape {
  finance: number;
  ops: number;
  hustle: number;
  network: number;
  tech: number;
}
interface PROFILESShape2 {
  health: number;
  happy: number;
  family: number;
  rep: number;
  stress: number;
}
interface PROFILESShape3 {
  id: string;
  name: string;
  age: number;
  edu: string;
  blurb: string;
  cash: number;
  usd: number;
  salary: number;
  jobTitle: string;
  rent: number;
  skills: PROFILESShape;
  debt: number;
  traits: string[];
  start: PROFILESShape2;
  informalIncome?: number;
}

const PROFILES: PROFILESShape3[] = [
  {id:'grad', name:'The Fresh Graduate', age:23, edu:'BSc',
   blurb:'Degree fresh, account empty. You have time, energy and zero leverage.',
   cash:180000, usd:0, salary:250000, jobTitle:'Graduate Trainee', rent:42000,
   skills:{finance:18,ops:22,hustle:35,network:15,tech:38}, debt:0,
   traits:['Time-rich','Cash-poor'], start:{health:82,happy:70,family:72,rep:35,stress:28}},
  {id:'corp', name:'The Corporate Climber', age:28, edu:'MSc',
   blurb:'Good salary, better title, and a lifestyle that quietly eats all of it.',
   cash:1500000, usd:1200, salary:880000, jobTitle:'Senior Analyst', rent:165000,
   skills:{finance:52,ops:48,hustle:30,network:45,tech:50}, debt:900000,
   traits:['Credible','Lifestyle creep risk'], start:{health:74,happy:66,family:65,rep:55,stress:52}},
  {id:'founder', name:'The Relentless Founder', age:26, edu:'Dropout',
   blurb:'You left school to build. High hustle, low runway, no safety net.',
   cash:620000, usd:0, salary:0, jobTitle:'Unemployed (building)', rent:38000,
   skills:{finance:22,ops:40,hustle:78,network:38,tech:66}, debt:0, informalIncome:150000,
   traits:['High agency','Thin margin for error'], start:{health:78,happy:62,family:58,rep:30,stress:58}},
  {id:'trader', name:'The Market Trader', age:31, edu:'Secondary',
   blurb:'Cash moves through your hands daily. Informal, fast, and completely undocumented.',
   cash:2600000, usd:0, salary:0, jobTitle:'Self-employed trader', rent:55000,
   skills:{finance:34,ops:58,hustle:82,network:66,tech:14}, debt:0,
   informalIncome:430000, traits:['Cashflow-positive','Invisible to banks'], start:{health:76,happy:68,family:74,rep:42,stress:48}},
  {id:'returnee', name:'The Returnee', age:33, edu:'MBA',
   blurb:'Came back with savings, a foreign degree, and a family that now expects miracles.',
   cash:6000000, usd:9000, salary:0, jobTitle:'Between opportunities', rent:210000, informalIncome:300000,
   skills:{finance:64,ops:55,hustle:34,network:60,tech:52}, debt:0,
   traits:['Capital-rich','Expectation-heavy'], start:{health:80,happy:64,family:50,rep:62,stress:44}},
];
