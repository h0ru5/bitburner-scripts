/** @param {NS} ns **/
export async function main(ns) {
  const psrvs = ns.getPurchasedServers();
  const maxSrvs = ns.getPurchasedServerLimit();
  ns.tprintf(`got ${psrvs.length} p-servers, max ${maxSrvs}`);

  let net = ns.scan("home").filter((srv) => !psrvs.includes(srv));
  // add level 2
  net.forEach((srv) => {
    net.push(
      ...ns
        .scan(srv)
        .filter((nsrv) => !net.includes(nsrv) && !psrvs.includes(srv))
    );
  });

  const pwnd = net.filter((srv) => ns.hasRootAccess(srv));
  ns.tprintf(`got ${pwnd.length} pwnd-servers, out of ${net.length}`);

  const srvs = [...pwnd, ...psrvs];

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
