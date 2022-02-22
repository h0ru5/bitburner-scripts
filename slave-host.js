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

  const size = sizeWeaken; //all have same size

  const partGrow = 0.9;
  const partWeaken = 0.09;

  const srvRam = ns.getServerMaxRam(srv);
  const srvThreads = srvRam / size;

  const countWeaken = srvThreads * partWeaken;
  const countGrow = srvThreads * partGrow;
  let countHack = srvThreads - countGrow - countWeaken;

  ns.tprint(
    `server ${srv} (${srvRam} GB): ${Math.floor(
      countWeaken
    )} weaken / ${Math.floor(countGrow)} grow / ${Math.floor(
      countHack
    )} hack threads`
  );

  await ns.scp("hacker-lib.js", srv);
  await ns.scp(scriptWeaken, srv);
  await ns.scp(scriptGrow, srv);
  await ns.scp(scriptHack, srv);
  await ns.scp("weaken-after.js", "home", srv);
  await ns.scp("grow-after.js", "home", srv);
  await ns.scp("hack-after.js", "home", srv);
  ns.killall(srv);

  if (countWeaken > 0) ns.exec(scriptWeaken, srv, countWeaken, target);
  if (countGrow > 0) ns.exec(scriptGrow, srv, countGrow, target);
  if (countHack > 0) ns.exec(scriptHack, srv, countHack, target);
  ns.tprint("done slaving " + srv);
}

export function autocomplete(data, args) {
  return [...data.servers];
}
