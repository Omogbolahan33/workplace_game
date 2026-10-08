/*
  BIZ — from 00-cities.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface BIZShape {
  id: string;
  name: string;
  icon: string;
  min: number;
  basePrice: number;
  elasticity: number;
  margin: number;
  growth: number;
  laborPer: number;
  rentQ: number;
  wc: number;
  capex: string;
  ceiling: number;
  regRisk: number;
  power: number;
  desc: string;
}

const BIZ: BIZShape[] = [
  {id:'retail', name:'Import & Retail Trading', icon:'📦', min:8000000, basePrice:90000, elasticity:1.7, margin:0.19, growth:0.14,
   laborPer:2.2, rentQ:600000, wc:0.55, capex:'low', ceiling:520e6, regRisk:0.18, power:0.15,
   desc:'Buy containers, sell inventory. Fast cash cycle, thin margins, and FX exposure that kills you quietly.'},
  {id:'food',  name:'Food & Restaurant', icon:'🍲', min:4000000, basePrice:37000, elasticity:1.3, margin:0.47, growth:0.11,
   laborPer:3.0, rentQ:900000, wc:0.25, capex:'low', ceiling:280e6, regRisk:0.30, power:0.55,
   desc:'Everyone eats every day. High margin, brutal operations, staff turnover from hell.'},
  {id:'logi',  name:'Logistics & Delivery', icon:'🛵', min:12000000, basePrice:110000, elasticity:1.1, margin:0.28, growth:0.20,
   laborPer:4.5, rentQ:500000, wc:0.30, capex:'high', ceiling:900e6, regRisk:0.24, power:0.10,
   desc:'Moves with e-commerce. Asset-heavy, fuel-sensitive, scales beautifully if you survive.'},
  {id:'tech',  name:'Tech Startup (SaaS)', icon:'💻', min:3000000, basePrice:20000, elasticity:0.8, margin:0.70, growth:0.34,
   laborPer:1.4, rentQ:350000, wc:0.10, capex:'low', ceiling:4000e6, regRisk:0.10, power:0.45,
   desc:'Near-zero marginal cost, near-infinite ceiling. Long cashless valley, then a cliff up or a cliff down.'},
  {id:'agri',  name:'Agribusiness', icon:'🌾', min:10000000, basePrice:62000, elasticity:0.6, margin:0.34, growth:0.13,
   laborPer:3.5, rentQ:300000, wc:0.45, capex:'high', ceiling:700e6, regRisk:0.16, power:0.30,
   desc:'Real demand, real land, real biology. Disease and weather are shareholders you cannot buy out.'},
  {id:'estate',name:'Real Estate Development', icon:'🏗️', min:40000000, basePrice:40000, elasticity:0.5, margin:0.36, growth:0.17,
   laborPer:1.2, rentQ:700000, wc:0.60, capex:'vhigh',ceiling:6000e6, regRisk:0.42, power:0.05,
   desc:'Lumpy, political, and where the big money lives. One bad title buries the whole project.'},
  {id:'creative',name:'Creative Agency', icon:'🎨', min:2000000, basePrice:23000, elasticity:1.2, margin:0.52, growth:0.16,
   laborPer:1.8, rentQ:400000, wc:0.20, capex:'low', ceiling:450e6, regRisk:0.09, power:0.35,
   desc:'Talent is the whole asset. Clients pay for taste; staff leave with the clients.'},
  {id:'mfg',   name:'Light Manufacturing', icon:'⚙️', min:30000000, basePrice:115000, elasticity:0.9, margin:0.31, growth:0.12,
   laborPer:5.5, rentQ:1500000, wc:0.50, capex:'vhigh',ceiling:2200e6, regRisk:0.28, power:0.85,
   desc:'Defensible, capital-hungry, power-hungry. Every inefficiency is multiplied by volume.'},
  {id:'proserv',name:'Professional Services', icon:'📊', min:1500000, basePrice:23000, elasticity:0.9, margin:0.56, growth:0.14,
   laborPer:1.5, rentQ:550000, wc:0.12, capex:'low', ceiling:800e6, regRisk:0.12, power:0.25,
   desc:'Consulting, accounting, advisory. You bill for brains. Reputation is the entire pipeline.'},
  {id:'energy',name:'Solar & Energy Installs', icon:'☀️', min:9000000, basePrice:55000, elasticity:1.0, margin:0.33, growth:0.24,
   laborPer:2.6, rentQ:450000, wc:0.40, capex:'med', ceiling:1400e6, regRisk:0.14, power:0.05,
   desc:'Riding a structural shortage. Working-capital intensive — clients pay after you buy the panels.'},
];
