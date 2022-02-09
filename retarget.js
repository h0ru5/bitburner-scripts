import { sorted_targets, srv_info, fmt, tfmt } from "./hacker-lib.js";

/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const output = sorted_targets(ns).filter((tgt) => tgt.name !== "n00dles");

  const maxGrowth = output.filter((tgt) => tgt.growth >= output[0].growth);

  let target = maxGrowth[0];

  if (maxGrowth.length > 1) {
    const maxGrowth_Money = maxGrowth.sort((a, b) => a.money_max - b.money_max);
    const maxGrowth_maxMoney = maxGrowth_Money.filter(
      (tgt) => tgt.money_max >= maxGrowth_Money[0]
    );
    if (maxGrowth_maxMoney.length > 1) {
      // several with max growth and money
      target = maxGrowth_maxMoney.sort((a, b) => b.sec_min - a.sec_min)[0];
    } else target = maxGrowth_maxMoney[0];
  }

  ns.tprintf(`new target is ${target.name}`);
  ns.run("official/monitor.js", 1, target.name);

  ns.run("slave-net.js", 1, target.name);
  ns.run("slave-home.js", 1, target.name);
}
