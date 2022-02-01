import { scan } from "./hacker-lib.js";

const scriptWeaken = "weaken-top.js";
const scriptGrow = "grow-top.js";
const scriptHack = "hack-top.js";

/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const net = scan(ns);
  const srvs = net.filter((srv) => ns.hasRootAccess(srv));
  ns.tprintf(`got ${srvs.length} pwnd-servers, out of ${net.length}`);

  const exclude = ["home"];

  // excluding cash cows
  for (let srv of srvs.filter((srv) => !exclude.includes(srv))) {
    if (ns.fileExists("slave-host.js", "home")) {
      ns.run("slave-host.js", 1, srv);
    }

    // break out of lockstep
    await ns.sleep(9999);
  }
}
