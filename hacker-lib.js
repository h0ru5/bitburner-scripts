/** @param {NS} ns **/
export const rec_scan = (ns, srv, net) => {
  const nodes = ns.scan(srv).filter((srv) => !net.includes(srv));
  ns.print(`subnet of ${srv} has ${nodes}`);
  net.push(srv);
  nodes.forEach((node) => {
    rec_scan(ns, node, net);
  });
};

/** @param {NS} ns **/
export const scan = (ns) => {
  let net = [];
  rec_scan(ns, "home", net);
  ns.tprintf(`found ${net.length} servers`);
  return net;
};
