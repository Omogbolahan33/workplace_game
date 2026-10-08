/*
  The names the data tables call that live in the simulation.

  A table is data, and some of the data is computed: a deck entry whose text is
  a function, a row whose weight comes from the market, a helper that formats a
  figure at the moment it is read. Those calls belong to the simulation the
  tables were lifted out of, so this file says what they are - loosely, and on
  purpose: the tables are checked for their SHAPE here (every field the rules
  read is a field the data has), and this is the list that keeps a table from
  having to be checked for the whole game as well.

  Seeded from what the tables actually referenced when they were lifted out of
  the sections, and maintained by hand since - it is a contract, like host.js,
  not a build artefact. The typecheck gate reports a name here that no table
  uses any more, so this list cannot quietly rot.
*/
declare const console: { log(...a: any[]): void; warn(...a: any[]): void; error(...a: any[]): void; };
declare const CITY: any;  /* 3 uses */
declare const D: any;  /* 4 uses */
declare const S: any;  /* 753 uses */
declare const angriestDirector: any;  /* 9 uses */
declare const archOf: any;  /* 3 uses */
declare const biggestHolder: any;  /* 9 uses */
declare const bizAccounts: any;  /* 2 uses */
declare const bizValue: any;  /* 10 uses */
declare const boardOf: any;  /* 9 uses */
declare const budgetMonthly: any;  /* 2 uses */
declare const chairIsYours: any;  /* 1 use */
declare const clamp: any;  /* 224 uses */
declare const closeBizSilent: any;  /* 7 uses */
declare const closeOutlet: any;  /* 1 use */
declare const cn: any;  /* 36 uses */
declare const covenantBreaches: any;  /* 7 uses */
declare const deedOf: any;  /* 5 uses */
declare const directorById: any;  /* 2 uses */
declare const esc: any;  /* 3 uses */
declare const extHolders: any;  /* 8 uses */
declare const fmt: any;  /* 135 uses */
declare const freeSeats: any;  /* 3 uses */
declare const freedomIndex: any;  /* 1 use */
declare const genCandidate: any;  /* 7 uses */
declare const genDirector: any;  /* 3 uses */
declare const genMD: any;  /* 2 uses */
declare const holderById: any;  /* 14 uses */
declare const hoursLeft: any;  /* 1 use */
declare const informalMonthly: any;  /* 11 uses */
declare const log: any;  /* 24 uses */
declare const makeVignette: any;  /* 1 use */
declare const marketMonthly: any;  /* 7 uses */
declare const naira: any;  /* 132 uses */
declare const noteAction: any;  /* 3 uses */
declare const openResolution: any;  /* 1 use */
declare const outletCount: any;  /* 1 use */
declare const pct: any;  /* 16 uses */
declare const repeatFactor: any;  /* 3 uses */
declare const salaryMonthly: any;  /* 11 uses */
declare const sleepDebt: any;  /* 1 use */
declare const spendHours: any;  /* 3 uses */
declare const staffMonthly: any;  /* 2 uses */
declare const syncCapTable: any;  /* 5 uses */
declare const widenHolder: any;  /* 4 uses */
declare const wipeExternal: any;  /* 4 uses */
declare const yourPct: any;  /* 6 uses */
