import { scan } from "./hacker-lib.js";

/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const net = scan(ns);
  const srvs = net.filter((srv) => ns.hasRootAccess(srv));
  ns.tprintf(`got ${srvs.length} pwnd-servers, out of ${net.length}`);

  for (let srv of srvs) {
    const srvRam = ns.getServerMaxRam(srv);
    ns.tprint(`server ${srv} (${srvRam} GB) running:`);
    const processes = ns.ps(srv);
    for (let i = 0; i < processes.length; ++i) {
      ns.tprint(
        "  " +
          processes[i].filename +
          " -t " +
          processes[i].threads +
          " " +
          processes[i].args
      );
    }
  }
}
