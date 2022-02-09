import { scan } from "./hacker-lib.js";

/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const target = ns.args[0];

  const scriptWeaken = !target ? "weaken-top.js" : "loop-weaken.js";
  const scriptGrow = !target ? "grow-top.js" : "loop-grow.js";
  const scriptHack = !target ? "hack-top.js" : "loop-hack.js";

  ns.tprint(
    `target ${target}, scripts: ${scriptWeaken},${scriptGrow},${scriptHack}`
  );

  const sizeWeaken = ns.getScriptRam(scriptWeaken);
  const sizeGrow = ns.getScriptRam(scriptGrow);
  const sizeHack = ns.getScriptRam(scriptHack);
  const partGrow = (ns.args[1] || 45) / 100;
  const partWeaken = 1.0 - partGrow;
  const hackFactor = 0.1;

  const srv = "home";
  const srvRam = ns.getServerMaxRam(srv) * 0.99;

  const countWeaken = Math.floor(
    (srvRam * (1.0 - hackFactor) * partWeaken) / sizeWeaken
  );
  const countGrow = Math.floor(
    (srvRam * (1.0 - hackFactor) * partGrow) / sizeGrow
  );
  const countHack = Math.floor((srvRam * hackFactor) / sizeHack);

  ns.tprint(
    `server ${srv} (${srvRam} GB): ${countWeaken} weaken / ${countGrow} grow / ${countHack} hack threads`
  );

  if (countWeaken > 0) ns.run(scriptWeaken, countWeaken, target);
  if (countGrow > 0) ns.run(scriptGrow, countGrow, target);
  if (countHack > 0) ns.run(scriptHack, countHack, target);
}
