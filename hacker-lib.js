/**
 * Utility function for recursive netowrk scan
 * @param {import('./NS').NS} ns
 * **/
export function rec_scan(ns, srv, net) {
  const nodes = ns.scan(srv).filter((srv) => !net.includes(srv));
  ns.print(`subnet of ${srv} has ${nodes}`);
  net.push(srv);
  nodes.forEach((node) => {
    rec_scan(ns, node, net);
  });
}

/**
 * Scan the reachable network
 *
 * @param {import('./NS').NS} ns
 * **/
export function scan(ns) {
  let net = [];
  rec_scan(ns, "home", net);
  ns.print(`found ${net.length} servers`);
  return net;
}

export function rec_search(ns, srv, tgt, path) {
  const nodes = ns.scan(srv).filter((srv) => !path.includes(srv));
  path.push(srv);
  nodes.forEach((node) => {
    if (node == tgt) {
      path.push(node);
      ns.tprintf(`found ${tgt}, route: ${path.join(" -> ")}`);
    } else {
      let mpath = [...path];
      rec_search(ns, node, tgt, mpath);
    }
  });
}

export function search(ns, tgt) {
  let path = [];
  rec_search(ns, "home", tgt, path);
}

/**
 * Run a script with maximum threads on target host
 *
 * @param {import('./NS').NS} ns
 * @param {string} targetScript script to run
 * @param {string} srv host to run on
 **/
export function run_max(ns, targetScript, srv) {
  const runSize = ns.getScriptRam(targetScript);
  const srvRam = ns.getServerMaxRam(srv);

  const threads = Math.floor(srvRam / runSize);
  if (threads > 0) {
    ns.tprint(
      `  starting ${targetScript} on ${srv} with -t ${threads} and args ${targetArgs}`
    );
    ns.exec(targetScript, srv, threads, ...targetArgs);
  }
}

export const percentage = (part, total) => Math.round((part / total) * 100);

//todo style as k,m,b
export const fmt = (number) => {
  if (number < 1e3) return Number.parseFloat(number).toFixed(3);
  if (number > 1e3 && number < 1e6)
    return Number.parseFloat(number / 1e3).toFixed(3) + "k";
  if (number > 1e6 && number < 1e9)
    return Number.parseFloat(number / 1e6).toFixed(3) + "m";
  if (number > 1e9 && number < 1e12)
    return Number.parseFloat(number / 1e9).toFixed(3) + "b";
  if (number > 1e12) return Number.parseFloat(number / 1e12).toFixed(3) + "t";
};

export function tfmt(msec) {
  let secs = msec / 1000;
  let mins = secs > 60 ? Math.floor(secs / 60) : 0;
  secs = Math.max(Math.floor(secs - mins * 60), 0);
  let hours = mins > 60 ? mins / 60 : 0;
  mins = Math.max(Math.floor(mins - hours * 60), 0);
  return `${hours ? hours + "h " : ""}${mins ? mins + "m " : ""}${
    secs ? secs + "s" : ""
  }`;
}

/** @param {import('./NS').NS} ns **/
export function srv_info(ns, target) {
  const maxMoney = ns.getServerMaxMoney(target);
  const minSec = ns.getServerMinSecurityLevel(target);
  const currSec = ns.getServerSecurityLevel(target);
  const currMoney = ns.getServerMoneyAvailable(target);

  return {
    name: target,
    money_max: maxMoney,
    money_curr: currMoney,
    money_pct: percentage(currMoney, maxMoney),
    sec_min: minSec,
    sec_curr: currSec,
    sec_pct: percentage(currSec, minSec),
  };
}

/** @param {import('./NS').NS} ns **/
export function srv_money(ns, target) {
  const maxMoney = ns.getServerMaxMoney(target);
  const currMoney = ns.getServerMoneyAvailable(target);

  return {
    name: target,
    money_max: maxMoney,
    money_curr: currMoney,
    money_pct: percentage(currMoney, maxMoney),
  };
}

/** @param {import('./NS').NS} ns **/
export function srv_sec(ns, target) {
  const maxSec = ns.getServerMinSecurityLevel(target);
  const currSec = ns.getServerSecurityLevel(target);

  return {
    name: target,
    sec_min: maxSec,
    sec_curr: currSec,
    sec_pct: percentage(currSec, maxSec),
  };
}

/** @param {import('./NS').NS} ns **/
export function top_money(ns, count) {
  const infos = scan(ns)
    .filter((srv) => ns.hasRootAccess(srv))
    .map((srv) => ({ name: srv, money_max: ns.getServerMaxMoney(srv) }));

  const output = infos
    .filter((info) => info.money_max != 0)
    .sort((a, b) => a.money_max - b.money_max)
    .slice(-count); //top 5
}

/**
 *
 * @param {import('./NS').NS} ns
 **/
export function sorted_targets(ns) {
  const infos = scan(ns)
    .filter((srv) => ns.hasRootAccess(srv))
    .map((srv) => ({
      name: srv,
      money_max: ns.getServerMaxMoney(srv),
      sec_min: ns.getServerMinSecurityLevel(srv),
      growth: ns.getServerGrowth(srv),
    }))
    .map((srv) => ({ ...srv, score: srv.money_max / srv.sec_min }));

  return infos
    .filter((info) => info.money_max != 0)
    .sort((a, b) => b.growth - a.growth);
}
