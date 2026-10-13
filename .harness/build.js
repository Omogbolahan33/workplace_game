const fs=require('fs');
const src=fs.readFileSync(__dirname+'/check.js','utf8');
const names=['newGame','advanceQuarter','ACT','UI','render','netWorth','DIFFS','CITIES','PROFILES',
'resolveOption','endGame','TABS','BIZ','DEAL_TYPES','AMBITIONS','ERAS','ARCS','ROLES','recompute','fmt',
'freedomIndex','dateLabel','budgetMonthly','debtTotal','bizValue','takeDeal','genDeal','viewDash',
'viewPeople','viewDeals','viewWork','viewInvest','viewMoney','viewLegacy','viewLedger','renderStart',
'modalHTML','helpModal','settingsModal','yearModal','renderModal','makeVignette','genCandidate',
'genRival','stepRival','genPartnerOffer','maybeSwan','stepCast','stepEra','maybeStartArc','dueThread','renderThreadStage',
'afterThreadChoice','refreshDeals','resolveDeals','ambitionPct','fireEvent','pickEvent',
'simBusiness','stepAssets','stepMarket','startBiz','startAnotherBiz','bizList','bizById','setActiveBiz','openOutlet','closeOutlet','upgradeOutlet','maintainOutlet','bizValueTotal','startNego','negResolveTactic','NEG_TACTICS','negoModal','negoTacticButtons','refreshContractOffers','submitBid','renewContract','contractRevenue','contractBidOptions','CONTRACT_KINDS','portfolioBar','anotherBizModal','viewOutlets','viewContracts','viewStaffDeep','promoteGM','trainStaff','hasGM','STAFF_ROLES','normaliseContract','viewAgenda','agendaItems','outletValue','staffNeed','staffCover','companyCulture','allocateOutlets','normaliseContract','bizDemand','endModal','snapshot','checkEnd','genCastMember','buildCast',
'ensureGov','totalShares','yourPct','yourShares','holderPct','holderById','extHolders','syncCapTable','addHolder','issueTo','grantPct',
'buyoutExternal','doBuyoutExternal','liquidationWaterfall','widenHolder','wipeExternal','govDot',
'boardOf','directorById','chairOf','seatEntitlement','freeSeats','formBoard','boardSkill','chairIsYours','genDirector','dirVotes','dirStance',
'openResolution','openResolutions','callVote','whipCount','executeResolution','lobbyDirector','LOBBY_MODES','RES_KINDS','BOARD_ARCHETYPES','archOf','resMeta',
'deedOf','defaultDeed','reservedMatter','canShotgun','triggerShotgun','resolveShotgun','stepGovernance','boardProposes','genMD','bizMomentum',
'genInboundBid','runDiligence','completeSale','bidHead','stepEarnouts','refreshTargets','diligenceTarget','makeBid','absorbTarget','declareDividend',
'viewGovernance','viewRegister','viewBoard','viewResolutions','viewDeed','viewPromises','viewInbound','viewTargets','govVoteModal','govWarn','undertakingMet','fulfilUndertaking',
'bizAccounts','bizDep','bizInterest','lastQ','sumQ','valuationBridge','sectorComps','defaultPlan','planVariance','planGrade','planLabel',
'covenantsOf','covenantState','covenantActual','covenantBreaches','covenantWarnings','addCovenant','facilityPackage','COVENANT_KINDS','SECTOR_MULT',
'poolPct','grantOptions','topUpPool','vestedOptions','viewPack','acctRow','GOV_SUBS','defaultPlan',
'ensureHoldco','holdcoName','groupSubs','groupOn','mgmtPct','setMgmtFee','intercoLoans','entityName','entityCash',
// household: staff employed for your own life
'HOUSE_ROLES','HOUSE_PERKS','houseRoleAvail','houseSalaryFor','housePerkCost','houseQ',
'houseMonthly','houseMonthlyYou','houseMonthlyBiz','staffSupport','houseTimeBoost','ownerTimeEff','gmCoverQ',
'genHouseCand','refreshHouseCands','hireHouse','fireHouse','houseTrain','houseRaise','housePerkToggle',
'staffMonthly','marketSalary',
'houseReassign','houseSetPayer','houseToggleDeclare','stepHouse','viewHousehold','viewLife','housePayrollSummary',
'negFinish','ownerTime',
// player profile, run history, adaptive difficulty
'PKEY','MAX_RUNS','blankProfile','loadProfile','saveProfile','ensureProfile','profReset',
'runQuality','skillRating','skillBand','computeTune','captureRun','appendRun','profileSummary',
'endGame','checkEnd','finalReport','rank','wipe','hasSave',
'D','exportProfile','importProfile',
'stepPersonal','advanceQuarter','newGame','viewBiz','viewCareer','viewEngine','subsFor','SUBS','routeView','routeViewInner','routeKey','ROUTE_WHY','routeKey','whyStrip','whyText','whyHTML','renderWhy','renderSubs','normTab','startModal','TABS','sect','groupRoute','ROUTE_GROUPS','splitTop','groupLevel','cardTitle','viewMoneyPosition','viewMoneyBudget','viewMoneyProperty','viewInvestPortfolio','viewInvestMarkets','viewLedgerChronicle','viewLedgerSettings','viewOverview','viewPulse','viewPressure','viewRival','bigStat',
'nextActions','nextBtn','NEXT_DEST','subLabel','bellHTML','notifModel','notifCounts','notifGroups','NOTIF_TIERS','renderTop',// phase 7 commitments: irreversibility
'commitNew','commitBreak','commitCancel','commitSunk','commitBuilding','committedFixedQ','commitActivate','stepCommitments','stepRamp','viewCommitments',// phase 8 working capital
'wcPolicy','wcTargetInv','wcCollectRate','wcFunded','cccOf','growthBill','recentGrowth','viewWorkingCapital',
  'priceBand','stepPriceMemory','bizDemand',
  'stepQuality','outletAvgCond',
  'stepCustomers','stepCompetitor','outletScale',
  // seasons: fixed finish line + comparable score
  'SEASON_AXES','seasonTurnFor','seasonDateOf','seasonsLeft','seasonStatus',
  'scoreAxes','scoreRun','checkEnd',
  'seasonStrip','scoreBlock','viewSeason','seasonPublish','seasonFetchAsync','seasonSubmit','seasonLeaderboard',
  'seasonModal','seasonRowHTML','seaCode','seaDraftCode','seedName','seedOffers','copyText','startModal',
  'qrEncode','qrSVG','seasonLink','seasonFromURL','seasonCodeFrom','seasonCanScan','renderStart',
  'seaCity','seaProfile','seaDifficulty','seaPins','CITIES','PROFILES','DIFFS','tierUnlocked','tierLockNote',
  'eraChipHTML','eraLeft','eraFxLine','ERA_TONE','ERAS','eraById','stepEra','initEra','dateLabel','esc',
  // phase 12: the lever map and the three term commitments
  'LEVER_KINDS','leverOf','leverActive','leverPending','leverTake','leverPlace','inputIndex',
  'shiftCapMult','shiftWageMult','channelDemandMult','channelCut','supplyCogsMult','supplyOverpay',
  'commitDropCost','commitDrop','commitCancel','commitBreak','commitNew',
  'viewLevers','leverColSet','leverColCommit','leverColNego','leverColReact','leverRow','leverGoto',
  'bizCapacity','bizDemand','staffMonthly','outletCount','marketSalary','cccOf','pct',
  'takePartner','partnerSharesFor','undertakingMet','genPartnerOffer','yourPct','totalShares','extHolders',
  'buildStamp','buildStampInfo','buildStampStart','viewLedgerSettings','offerById','offerRemove',
  'startBizCost',
  /* `switchbiz` is an action id the ui dispatches, not a function; it was in
     this list and could never be found here. */
  'portfolioBar','anotherBizModal','startAnotherBiz','renderStart',
  /* `genHouseCand` is the generator and `S.houseCands` the field it fills;
     `genHouseCands` and `houseCands` were in this list as names that do not
     exist - which is why every build printed them as missing. */
  'render','renderModal','genCandidate','formalizeBiz','openOutlet','buyAsset','genHouseCand','snapshot',
  // the install-prompt state: the fact the Settings screen renders from
  'installAvailable','doInstall','seasonCanScan',
  // inventory audit: the data tables the feature list makes countable claims about
  'ASSETS','GOODS','TRAITS','LIFE_EVENTS','BIZ_EVENTS','MORE_EVENTS','GOV_EVENTS','POLICY_EVENTS',
  /* the cast screen is viewPeople; there has never been a viewCast */
  'HOUSE_ROLES','ARCS','CONTRACT_KINDS','STAFF_ROLES','ROLES','CAREER','MAX_RUNS','viewRival','viewPeople',
  'hire','fire','giveRaise','expandBiz','expandCost','bizCapacity','staffProd','staffNeed','staffCover','openOutlet','closeOutlet','weeklyFreeHours','hoursBudget','hoursSpent','hoursLeft','sleepDebt','spendHours','repeatFactor','noteAction','WEEKS_PER_QUARTER','CAREER',
'cloudConfigured','cloudSessionValid','cloudRefresh','cloudPullQuiet','cloudPushQuiet','cloudSyncBackground',
'challengeIndex','tierAmp','tierUnlocked','tierLockNote','challengeLabel','diffListHTML',
'mergeProfiles','cloudCfg','cloudReady','cloudAuth','cloudPush','cloudPull','cloudLogout',
'viewCareerRecord','runInfoModal','profileModal','CLOUD_SQL',
/* the progress and onboarding surface (§22.61): what the header's save line is
   drawn from, and the record head the app's React screen embeds */
'noteSaved','savedAtLabel','saveLineHTML','profileHeadHTML',
'intercoLoan','repayInterco','intercoOwed','intercoUpstream','intercoInterestTotal','divCapacity','divNote',
'payDividendUp','stepGroup','groupAccounts','groupBreaches','groupCrossDefault','groupCovenantStrip','viewGroup',
'WHT_RATE','IC_RATE','ARMS_LENGTH','_gcell','_glabel',
/* the scene you can tap (VISUAL.md, M11): the cards a tap opens, so the text
   audit can count the buttons one tap away as the route's own */
'hotModal','sceneFirst','castStripHTML','staffStripHTML','castStripBody','staffStripBody','faceBadgeSVG','houseControlsHTML','houseFacesHTML','directorFactsHTML','boardFacesHTML','doorQueue','applicantFacesHTML','leverSliderHTML','coverButtonsHTML','machineTilesHTML','commitTilesHTML','commitCardHTML','dealMoment','dealTilesHTML','dealCardHTML','offerFacesHTML','offerCardHTML','deedClauses','deedTilesHTML','clauseCardHTML','registerPictureHTML','chronicleQuarters','lifeLineSVG','chronicleTilesHTML','chronicleInnerHTML','quarterCardHTML','quarterEntryHTML','waterfallSVG','accountsPictureHTML','cashPictureHTML','kpisPictureHTML','delta','wcCycleInner','positionInner','companyMeterInner'];
const decl=new Set();
for(const m of src.matchAll(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm)) decl.add(m[1]);
for(const m of src.matchAll(/^(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=/gm)) decl.add(m[1]);
const have=names.filter(n=>decl.has(n));
console.log('missing:', names.filter(n=>!decl.has(n)).join(', ')||'(none)');
fs.writeFileSync(__dirname+'/mod.js', src+"\nmodule.exports={getS:()=>S,setS:v=>{S=v},"+have.join(",")+"};");
