import { scan } from "./hacker-lib.js";

const scriptWeaken = "weaken-top.js";
const scriptGrow = "grow-top.js";
const scriptHack = "hack-top.js";

/** @param {NS} ns **/
export async function main(ns) {
  const sizeWeaken = ns.getScriptRam(scriptWeaken);
  const sizeGrow = ns.getScriptRam(scriptGrow);
  const sizeHack = ns.getScriptRam(scriptHack);
  const partGrow = (ns.args[0] || 40) / 100;
  const partWeaken = 1.0 - partGrow;
  const hackFactor = 0.2;

  const srv = ns.getHostName();
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

  if (countWeaken > 0) ns.run(scriptWeaken, countWeaken);
  if (countGrow > 0) ns.run(scriptGrow, srv, countGrow);
  if (countHack > 0) ns.spawn(scriptHack, srv, countHack);
}
