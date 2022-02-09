import {
  sorted_targets,
  best_target,
  srv_info,
  fmt,
  tfmt,
} from "./hacker-lib.js";

/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const output = sorted_targets(ns).map((srv) => ({
    ...srv,
    ...srv_info(ns, srv.name),
  }));

  output.reverse().forEach((info) => {
    ns.tprint(`Target ${info.name}:`);
    ns.tprint(
      `  money: ${fmt(info.money_curr)}/${fmt(info.money_max)} ${
        info.money_pct
      }%`
    );
    ns.tprint(`  sec  : ${info.sec_curr}/${info.sec_min} ${info.sec_pct}%`);
    ns.tprint(`  score: ${fmt(info.score)}`);
    ns.tprint(`  growth: ${fmt(info.growth)}`);
    ns.tprint(
      `  times: grow ${tfmt(ns.getGrowTime(info.name))} weak ${tfmt(
        ns.getWeakenTime(info.name)
      )} hack ${tfmt(ns.getHackTime(info.name))} `
    );
  });

  ns.tprint(`best target is ${best_target(ns).name}`);
}
