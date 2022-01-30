import { srv_info } from "./hacker-lib.js";

/** @param {NS} ns **/
export async function main(ns) {
  let target = ns.args[0];
  ns.tprint("watching target " + target);
  while (true) {
    const info = srv_info(ns, target);
    ns.tprint("watching target " + target);
    ns.tprint(
      `  money: ${info.money_curr}/${info.money_max} ${info.money_pct}%`
    );
    ns.tprint(`  sec  : ${info.sec_curr}/${info.sec_max} ${info.sec_pct}%`);
    await ns.sleep(1000);
  }
}
