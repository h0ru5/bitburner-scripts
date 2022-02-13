import { scan } from "./hacker-lib.js";

/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const target = ns.args[0];
  const net = scan(ns);
  const srvs = net.filter((srv) => ns.hasRootAccess(srv));
  ns.tprintf(`got ${srvs.length} pwnd-servers, out of ${net.length}`);
  ns.tprintf("attacking " + target || " top growing servers");

  const exclude = ["home"];

  // excluding home
  if (ns.fileExists("slave-host.js", "home")) {
    const targets = srvs.filter((srv) => !exclude.includes(srv));
    // ns.tprint("targets: " + targets.join(","));
    for (let srv of targets) {
      ns.run("slave-host.js", 1, srv, target);
      await ns.sleep(20);
    }
  }
}
