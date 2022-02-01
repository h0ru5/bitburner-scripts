import { sorted_targets, srv_info, fmt } from "./hacker-lib.js";

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
  });
}
