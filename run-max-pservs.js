import { scan } from "./hacker-lib.js";

/**
 *
 * @param {import('./NS').NS} ns
 **/
export async function main(ns) {
  const targetScript = ns.args.shift();
  const targetArgs = ns.args;
  const runSize = ns.getScriptRam(targetScript);

  for (const srv of ns.getPurchasedServers()) {
    const srvRam = ns.getServerMaxRam(srv);
    const threads = Math.floor(srvRam / runSize);
    if (threads > 0) {
      await ns.scp(targetScript, srv);
      ns.killall(srv);
      ns.tprint(
        `  starting ${targetScript} on ${srv} with -t ${threads} and args ${targetArgs}`
      );
      await ns.exec(targetScript, srv, threads, ...targetArgs);
    }
  }
}

export function autocomplete(data, args) {
  return [...data.scripts];
}
