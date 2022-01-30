import { scan } from "./hacker-lib.js";

/** @param {NS} ns **/
export async function main(ns) {
  const targetScript = ns.args.shift();
  const targetArgs = ns.args;
  const runSize = ns.getScriptRam(targetScript);

  const net = scan(ns);

  // availiable workforce
  const srvs = net.filter((srv) => ns.hasRootAccess(srv));
  ns.tprintf(`got ${srvs.length} pwnd-servers, out of ${net.length}`);

  // excluding cashcows and home
  const exclude = ["home"];

  // excluding cash cows
  for (let srv of srvs.filter((srv) => !exclude.includes(srv))) {
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
    await ns.scp("hacker-lib.js", srv);
    await ns.scp(targetScript, srv);
    await ns.killall(srv);
    const threads = Math.floor(srvRam / runSize);
    if (threads > 0) {
      ns.tprint(
        `  starting ${targetScript} with -t ${threads} and args ${targetArgs}`
      );
      await ns.exec(targetScript, srv, threads, ...targetArgs);
    }
  }
}
