/*
  QR_M — from 24-seadraftcode.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface QR_MShape {
  ec: number;
  blocks: number;
  data: number;
  align: any[];
}
interface QR_MShape2 {
  ec: number;
  blocks: number;
  data: number;
  align: number[];
}

const QR_M: Array<null | QR_MShape | QR_MShape2> = [null,
  { ec:10, blocks:1, data:16,  align:[]      },
  { ec:16, blocks:1, data:28,  align:[6,18]  },
  { ec:26, blocks:1, data:44,  align:[6,22]  },
  { ec:18, blocks:2, data:64,  align:[6,26]  },
  { ec:24, blocks:2, data:86,  align:[6,30]  },
  { ec:16, blocks:4, data:108, align:[6,34]  }
];
