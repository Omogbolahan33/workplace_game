

/* =========================================================================
   Section 21e: Events that only exist because other people own part of it
   ========================================================================= */

function angriestDirector(b){
  return boardOf(b).filter(function(d){ return !d.yours; })
    .sort(function(a,c){ return ((a.patience||50)+(a.loyalty||50)) - ((c.patience||50)+(c.loyalty||50)); })[0] || null;
}
function biggestHolder(b){
  return extHolders(b).slice().sort(function(a,c){ return (c.shares||0)-(a.shares||0); })[0] || null;
}

/*@table:GOV_EVENTS@*/

/* Four decks, one list: each is typed from its own data, and they are read here
   only as "events", so the cast says which of the two facts this line is about. */
const ALL_EVENTS = /** @type {any[]} */ (LIFE_EVENTS).concat(BIZ_EVENTS).concat(MORE_EVENTS).concat(GOV_EVENTS);