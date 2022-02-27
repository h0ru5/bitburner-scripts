import { idle_threads } from "neo/get-idle-capa.js";

/** @param {import('../NS').NS} ns **/
export function getNeededThreads(ns, server) {
  let money = ns.getServerMoneyAvailable(server) * 0.5;
  if (money === 0) money = 1;
  const maxMoney = ns.getServerMaxMoney(server);
  const minSec = ns.getServerMinSecurityLevel(server);
  const sec = ns.getServerSecurityLevel(server);

  const thack = Math.ceil(ns.hackAnalyzeThreads(server, money));
  const tgrow = Math.ceil(
    ns.growthAnalyze(server, maxMoney / (maxMoney - money))
  );

  const tweaken = Math.ceil((sec - minSec) * 20);
  const tweaken2 = Math.ceil(ns.hackAnalyzeSecurity(thack) * 20);

  /* ns.tprint(
    JSON.stringify({ money, maxMoney, minSec, sec, thack, tgrow, tweaken })
  ); */

  return { thack, tgrow, tweaken, tweaken2 };
}

export function after(millis) {
  return Date.now() + millis;
}

/** @param {import('../NS').NS} ns **/
export function launch(ns, capa, threads, action, target, wait_ms) {
  let have = 0;
  for (const srv of capa.sort((a, b) => a.threads - b.threads)) {
    const launchThreads = Math.min(srv.threads, threads - have);
    if (!launchThreads || launchThreads < 0) continue;
    const pid = ns.exec(
      `${action}-after.js`,
      srv.name,
      launchThreads,
      target,
      wait_ms
    );

    /*ns.tprint(
      `launching ${action} on ${
        srv.name
      } with ${launchThreads} threads, target ${target}, waittime ${ns.tFormat(
        wait_ms
      )}`
    ); */
    if (pid !== 0) have += launchThreads;
    else
      ns.print(
        `failed to launch on ${srv.name}: ${action} -t ${launchThreads} ${target}, free ${srv.threads}`
      );
    if (have >= threads) {
      return true;
    }
  }
  return false;
}

/** @param {import('../NS').NS} ns **/
export async function main(ns) {
  const flags = ns.flags([
    ["refreshrate", 200],
    ["help", false],
  ]);
  if (flags._.length === 0 || flags.help) {
    ns.tprint("This script monitors and starts campaigns for a server.");
    ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_NAME`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()} n00dles`);
    return;
  }
  ns.tail();
  ns.disableLog("ALL");
  let active = []; //active campaigns
  while (true) {
    const server = flags._[0];
    const { thack, tgrow, tweaken, tweaken2 } = getNeededThreads(ns, server);

    const maxMoney = ns.getServerMaxMoney(server);
    let money = ns.getServerMoneyAvailable(server);
    if (money === 0) money = 1;
    const money_pct = (money / maxMoney) * 100;
    const protection =
      ns.getServerSecurityLevel(server) - ns.getServerMinSecurityLevel(server);

    ns.clearLog(server);
    ns.print(`${server}:`);
    ns.print(
      ` $_______: ${ns.nFormat(money, "$0.000a")} / ${ns.nFormat(
        maxMoney,
        "$0.000a"
      )} (${money_pct.toFixed(2)}%)`
    );

    const hacktime = ns.getHackTime(server);
    const growtime = ns.getGrowTime(server);
    const weakentime = ns.getWeakenTime(server);

    ns.print(` security: +${protection.toFixed(2)}`);
    ns.print(` hack____: ${ns.tFormat(hacktime)} (t=${thack})`);
    ns.print(` grow____: ${ns.tFormat(growtime)} (t=${tgrow})`);
    ns.print(` weaken__: ${ns.tFormat(weakentime)} (t=${tweaken})`);
    ns.print(` weaken_2: ${ns.tFormat(weakentime)} (t=${tweaken2})`);

    // get idle capa
    let { capa, total } = idle_threads(ns, 1.75);

    if (protection > 1) {
      const otherWeakeners = active.filter((entry) => entry.type == "weaken");
      const otherWeakenThreads = otherWeakeners
        .map((entry) => entry.threads)
        .reduce((sum, threads) => sum + threads, 0);
      if (otherWeakeners.length == 0 || otherWeakenThreads < tweaken) {
        const launchThreads = Math.min(total, tweaken - otherWeakenThreads);
        if (
          launch(ns, capa, launchThreads, "weaken", server, Math.random() * 10)
        )
          active.push({
            type: "weaken",
            threads: launchThreads,
            dur: weakentime,
            start: 0,
            eta: after(weakentime),
          });
        else
          ns.print(
            `expedite weaken with ${launchThreads} of ${total} threads failed`
          );

        const update = idle_threads(ns, 1.75);
        capa = update.capa;
        total = update.total;
      }
    }

    // prep server money
    if (money_pct < 99) {
      const otherGrowers = active.filter((entry) => entry.type == "grow");
      const otherGrowThreads = otherGrowers
        .map((entry) => entry.threads)
        .reduce((sum, threads) => sum + threads, 0);
      if (otherGrowers.length == 0 || otherGrowThreads < tgrow) {
        const launchThreads = Math.min(total, tgrow - otherGrowThreads);
        if (launch(ns, capa, launchThreads, "grow", server, Math.random() * 10))
          active.push({
            type: "grow",
            threads: launchThreads,
            dur: growtime,
            start: 0,
            eta: after(growtime),
          });
        else
          ns.print(
            `expedite growth with ${launchThreads} of ${total} threads failed`
          );
        const update = idle_threads(ns, 1.7);
        capa = update.capa;
        total = update.total;
      }
    }

    // server is ok, launch campaign
    if (money_pct >= 95 && protection <= 2) {
      const buffer = 200; //ms

      // hwgw
      if (total >= thack + tweaken2 + tgrow + tweaken) {
        let wait_h1, wait_w1_1, wait_g1, wait_w1_2;

        // calc wait times based on longest action
        wait_w1_1 = buffer;
        wait_w1_2 = weakentime + 3 * buffer - weakentime;
        wait_g1 = weakentime + 2 * buffer - growtime;
        wait_h1 = weakentime - hacktime;

        // launch immediately, script will active wait (consider launching delayed)
        if (launch(ns, capa, tweaken, "weaken", server, wait_w1_1))
          active.push({
            type: "weaken",
            threads: tweaken,
            dur: weakentime,
            start: after(wait_w1_1),
            eta: after(wait_w1_1 + weakentime),
          });
        else ns.print("w1 failed");
        let update = idle_threads(ns, 1.7);
        capa = update.capa;
        total = update.total;

        if (launch(ns, capa, tweaken2, "weaken", server, wait_w1_2))
          active.push({
            type: "weaken",
            threads: tweaken,
            dur: weakentime,
            start: after(wait_w1_2),
            eta: after(wait_w1_2 + weakentime),
          });
        else ns.print("w2 failed");
        update = idle_threads(ns, 1.7);
        capa = update.capa;
        total = update.total;

        if (launch(ns, capa, tgrow, "grow", server, wait_g1))
          active.push({
            type: "grow",
            threads: tgrow,
            dur: growtime,
            start: after(wait_g1),
            eta: after(wait_g1 + growtime),
          });
        else ns.print("g failed");
        update = idle_threads(ns, 1.7);
        capa = update.capa;
        total = update.total;

        if (launch(ns, capa, thack, "hack", server, wait_h1))
          active.push({
            type: "hack",
            threads: thack,
            dur: hacktime,
            start: after(wait_h1),
            eta: after(wait_h1 + hacktime),
          });
        else ns.print("h failed");
        update = idle_threads(ns, 1.7);
        capa = update.capa;
        total = update.total;
      } else {
        ns.print(`free: ${total}, need: ${thack + tweaken + tgrow + tweaken}`);
        // lets just hack things
        if (launch(ns, capa, thack, "hack", server, Math.random() * 10))
          active.push({
            type: "hack",
            threads: thack,
            dur: hacktime,
            start: after(wait_h1),
            eta: after(wait_h1 + hacktime),
          });
        else ns.print("h failed");
        const update = idle_threads(ns, 1.7);
        capa = update.capa;
        total = update.total;
      }
    }

    const now = Date.now();
    const waiting = active.filter((active) => active.start > now);
    const running = active.filter(
      (active) => active.start <= now && active.eta >= now
    );
    const done = active.filter((active) => active.eta < now);
    active = active.filter((active) => active.eta >= now);

    ns.print(
      `waiting: ${waiting.length}, running: ${running.length}, done: ${
        done.length
      },free: ${total}, need: ${thack + tweaken + tgrow + tweaken}`
    );
    await ns.sleep(20);
  }
}

export function autocomplete(data, args) {
  return data.servers;
}
