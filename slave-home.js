import { scan } from "./hacker-lib.js";

/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const target = ns.args[0];

  const scriptWeaken = "loop-weaken.js";
  const scriptGrow = "loop-grow.js";
  const scriptHack = "loop-hack.js";

  ns.tprint(
    `target ${target}, scripts: ${scriptWeaken},${scriptGrow},${scriptHack}`
  );

  const srv = "home";
  const sizeWeaken = ns.getScriptRam(scriptWeaken);
  const sizeGrow = ns.getScriptRam(scriptGrow);
  const sizeHack = ns.getScriptRam(scriptHack);

  const size = sizeWeaken; //all have same size

  const partGrow = 0.45;
  const partWeaken = 0.45;

  const srvRam = ns.getServerMaxRam(srv);
  const srvThreads = srvRam / size;

  const countWeaken = srvThreads * partGrow;
  const countGrow = srvThreads * partWeaken;
  let countHack = srvThreads - countGrow - countWeaken;

  ns.tprint(
    `server ${srv} (${srvRam} GB): ${countWeaken} weaken / ${countGrow} grow / ${countHack} hack threads`
  );

  if (countWeaken > 0) ns.run(scriptWeaken, countWeaken, target);
  if (countGrow > 0) ns.run(scriptGrow, countGrow, target);
  if (countHack > 0) ns.run(scriptHack, countHack, target);
}
