/** @param {NS} ns **/
export async function main(ns) {
  const targetRam = ns.args.shift();
  const targetScript = ns.args.shift();
  const targetArgs = ns.args;
  const runSize = ns.getScriptRam(targetScript);
  const threads = Math.floor(targetRam / runSize);

  const psrvs = ns.getPurchasedServers();
  const maxSrvs = ns.getPurchasedServerLimit();
  ns.tprintf(
    `got ${psrvs.length} p-servers, max ${maxSrvs}:\n${psrvs.join(", ")}`
  );
  ns.tprintf(`adding servers with ${targetRam} GB RAM`);

  let i = psrvs.length;
  while (i < maxSrvs) {
    // Check if we have enough money to purchase a server
    if (
      ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(targetRam)
    ) {
      const hostname = await ns.purchaseServer("psrv-" + i, targetRam);
      ns.tprintf(
        `got new server ${hostname}, running ${targetScript} -t ${threads} ${targetArgs.join(
          " "
        )}`
      );
      await ns.scp(targetScript, hostname);
      await ns.exec(targetScript, hostname, threads, ...targetArgs);
      ++i;
    }
  }
}
