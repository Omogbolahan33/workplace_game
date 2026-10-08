/*
  ROLES — from 29-the-cast-who-remembers.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface ROLESShape {
  label: string;
  blurb: string;
}
interface ROLESShape2 {
  friend: ROLESShape;
  sibling: ROLESShape;
  cousin: ROLESShape;
  mentor: ROLESShape;
  contact: ROLESShape;
  love: ROLESShape;
  banker: ROLESShape;
  supplier: ROLESShape;
  elder: ROLESShape;
  rival: ROLESShape;
}

const ROLES: ROLESShape2 = {
  friend:  {label:'Old friend',            blurb:'You have known each other since you were both broke.'},
  sibling: {label:'Sibling',               blurb:'Blood. Which complicates every financial conversation.'},
  cousin:  {label:'Cousin',                blurb:'Always between jobs. Always with a plan.'},
  mentor:  {label:'Mentor',                blurb:'Opened a door for you once. Doors have a way of reopening.'},
  contact: {label:'Government contact',    blurb:'Knows which file a request sits in, and who signs it.'},
  love:    {label:'Someone you are seeing',blurb:'This is either the beginning of everything or a very expensive year.'},
  banker:  {label:'Banker',                blurb:'Friendly while you do not need anything.'},
  supplier:{label:'Supplier',              blurb:'Sells you the thing your business cannot run without.'},
  elder:   {label:'Community elder',       blurb:'Remembers your mother. Expects better of you.'},
  rival:   {label:'Business rival',        blurb:'Wants what you have. Says hello like it is a threat.'},
};
