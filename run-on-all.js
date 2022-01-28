/** @param {NS} ns **/
export async function main(ns) {
  const targetScript = ns.args.shift();
  const targetArgs = ns.args;
  const runSize = ns.getScriptRam(targetScript);

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

  // availiable workforce
  const srvs = [...pwnd, ...psrvs];

  // excluding cashcows and home
  const cashcows = ["home"];

  // excluding cash cows
  for (let srv of srvs.filter((srv) => !cashcows.includes(srv))) {
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
    await ns.scp(targetScript, srv);
    await ns.killall(srv);
    const threads = Math.floor(srvRam / runSize);
    ns.tprint(
      `  starting ${targetScript} with -t ${threads} and args ${targetArgs}`
    );
    await ns.exec(targetScript, srv, threads, ...targetArgs);
  }
}
