import { scan } from "./hacker-lib.js";

const scriptWeaken = "weaken-top.js";
const scriptGrow = "grow-top.js";
const scriptHack = "hack-top.js";

/** @param {NS} ns **/
export async function main(ns) {
  const net = scan(ns);
  const srvs = net.filter((srv) => ns.hasRootAccess(srv));
  ns.tprintf(`got ${srvs.length} pwnd-servers, out of ${net.length}`);

  const sizeWeaken = ns.getScriptRam(scriptWeaken);
  const sizeGrow = ns.getScriptRam(scriptGrow);
  const sizeHack = ns.getScriptRam(scriptHack);
  const partGrow = (ns.args[0] || 50) / 100;
  const partWeaken = 1.0 - partGrow;

  const hackFactor = 0.1;

  const exclude = ["home"];

  // excluding cash cows
  for (let srv of srvs.filter((srv) => !exclude.includes(srv))) {
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

    if (countWeaken > 0) ns.exec(scriptWeaken, srv, countWeaken);
    if (countGrow > 0) ns.exec(scriptGrow, srv, countGrow);
    if (countHack > 0) ns.exec(scriptHack, srv, countHack);

    // break out of lockstep
    await ns.sleep(9999);
  }
}
