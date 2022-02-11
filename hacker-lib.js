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
  for (let node of nodes) {
    if (node == tgt) {
      path.push(node);
      ns.tprintf(`found ${tgt}, route: ${path.join(" -> ")}`);
      return path;
    } else {
      let mpath = [...path];
      const res = rec_search(ns, node, tgt, mpath);
      if (res !== null) return res;
    }
  }
  return null;
}

export function search(ns, tgt) {
  let path = [];
  return rec_search(ns, "home", tgt, path);
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
 * get a list of top growth targets
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

/**
 *  find best target among currently owned servers
 * @param {import('./NS').NS} ns
 **/
export function best_target(ns) {
  const output = sorted_targets(ns).filter((tgt) => tgt.name !== "n00dles");

  const maxGrowth = output.filter((tgt) => tgt.growth >= output[0].growth);

  let target = maxGrowth[0];

  if (maxGrowth.length > 1) {
    const maxGrowth_Money = maxGrowth.sort((a, b) => b.money_max - a.money_max);
    ns.tprintf(
      `found ${maxGrowth_Money.length} targets with growth ${
        maxGrowth_Money[0].growth
      }: ${maxGrowth_Money.map((elm) => elm.name).join(", ")}`
    );
    const maxGrowth_maxMoney = maxGrowth_Money.filter(
      (tgt) => tgt.money_max >= maxGrowth_Money[0].money_max
    );
    if (maxGrowth_maxMoney.length > 1) {
      // several with max growth and money
      const max_gm = maxGrowth_maxMoney.sort((a, b) => a.sec_min - b.sec_min);
      ns.tprintf(
        `found ${max_gm.length} targets with growth ${
          max_gm[0].growth
        } and maxMoney ${max_gm[0].money_max}: ${max_gm
          .map((elm) => elm.name)
          .join(", ")}`
      );
      target = [0];
    } else {
      target = maxGrowth_maxMoney[0];
    }
  }
  //ns.tprint(`best target was determined as ${JSON.stringify(target)}`);
  return target;
}
