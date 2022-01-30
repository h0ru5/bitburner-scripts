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
  const partGrow = (ns.args[0] || 70) / 100;
  const partWeaken = 1.0 - partGrow;

  const exclude = ["home"];

  // excluding cash cows
  for (let srv of srvs.filter((srv) => !exclude.includes(srv))) {
    const srvRam = ns.getServerMaxRam(srv);

    const countWeaken = Math.floor((srvRam * partWeaken) / sizeWeaken);
    const countGrow = Math.floor((srvRam * partGrow) / sizeGrow);

    ns.tprint(
      `server ${srv} (${srvRam} GB): ${countWeaken} weaken / ${countGrow} grow threads`
    );

    await ns.scp("hacker-lib.js", srv);
    await ns.scp(scriptWeaken, srv);
    await ns.scp(scriptGrow, srv);
    ns.killall(srv);

    if (countWeaken > 0) ns.exec(scriptWeaken, srv, countWeaken);
    if (countGrow > 0) ns.exec(scriptGrow, srv, countGrow);
  }
}
