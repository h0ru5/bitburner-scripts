import { scan } from "hacker-lib.js";

/** @param {import('../NS').NS} ns **/
export function idle_threads(ns, size) {
  const srvs = scan(ns).filter((srv) => ns.hasRootAccess(srv));
  const capa = srvs.map((srv) => {
    let freeRam = ns.getServerMaxRam(srv) - ns.getServerUsedRam(srv);
    if (srv == "home" && ns.getServerUsedRam(srv) < 20) {
      /* ns.tprintf(
        `Home: free ${freeRam} max ${ns.getServerMaxRam(
          srv
        )} used ${ns.getServerUsedRam(srv)}`
      ); */
      freeRam -= 20;
    }
    const idleThreads = Math.floor(freeRam / size);
    return { name: srv, threads: idleThreads, free: freeRam };
  });
  const total = capa.reduce((sum, elem) => sum + elem.threads, 0);
  return { capa, total };
}

/** @param {import('../NS').NS} ns **/
export async function main(ns) {
  const { capa, total } = idle_threads(ns, 1.7);
  for (const elem of capa) {
    if (elem.threads > 0) {
      ns.tprint(`${elem.name}: ${elem.threads} (${elem.free} GB)`);
    }
  }
  ns.tprint(total + " threads can be added");
}
