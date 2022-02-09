import { scan } from "./hacker-lib.js";

/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const srv = ns.args[0];
  const target = ns.args[1];

  const scriptWeaken = !target ? "weaken-top.js" : "loop-weaken.js";
  const scriptGrow = !target ? "grow-top.js" : "loop-grow.js";
  const scriptHack = !target ? "hack-top.js" : "loop-hack.js";

  ns.tprint(
    `host ${srv}, target ${target}, scripts: ${scriptWeaken},${scriptGrow},${scriptHack}`
  );

  const sizeWeaken = ns.getScriptRam(scriptWeaken);
  const sizeGrow = ns.getScriptRam(scriptGrow);
  const sizeHack = ns.getScriptRam(scriptHack);
  const partGrow = (ns.args[2] || 45) / 100;
  const partWeaken = 1.0 - partGrow;

  const hackFactor = 0.1;

  const srvRam = ns.getServerMaxRam(srv);

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

  await ns.scp("hacker-lib.js", srv);
  await ns.scp(scriptWeaken, srv);
  await ns.scp(scriptGrow, srv);
  await ns.scp(scriptHack, srv);
  ns.killall(srv);

  if (countWeaken > 0) ns.exec(scriptWeaken, srv, countWeaken, target);
  if (countGrow > 0) ns.exec(scriptGrow, srv, countGrow, target);
  if (countHack > 0) ns.exec(scriptHack, srv, countHack, target);
}

export function autocomplete(data, args) {
  return [...data.servers];
}
