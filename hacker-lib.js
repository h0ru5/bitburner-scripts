/**
 * Utility function for recursive netowrk scan
 * @param {NS} ns
 * **/
export const rec_scan = (ns, srv, net) => {
  const nodes = ns.scan(srv).filter((srv) => !net.includes(srv));
  ns.print(`subnet of ${srv} has ${nodes}`);
  net.push(srv);
  nodes.forEach((node) => {
    rec_scan(ns, node, net);
  });
};

/**
 * Scan the reachable network
 *
 * @param {NS} ns
 * **/
export const scan = (ns) => {
  let net = [];
  rec_scan(ns, "home", net);
  ns.tprintf(`found ${net.length} servers`);
  return net;
};

/**
 * Run a script with maximum threads on target host
 *
 * @param {NS} ns
 * @param {string} targetScript script to run
 * @param {string} srv host to run on
 **/
export const run_max = (ns, targetScript, srv) => {
  const runSize = ns.getScriptRam(targetScript);
  const srvRam = ns.getServerMaxRam(srv);

  const threads = Math.floor(srvRam / runSize);
  if (threads > 0) {
    ns.tprint(
      `  starting ${targetScript} on ${srv} with -t ${threads} and args ${targetArgs}`
    );
    ns.exec(targetScript, srv, threads, ...targetArgs);
  }
};
