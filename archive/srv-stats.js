import { scan, srv_info, fmt } from "./hacker-lib.js";

/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const infos = scan(ns)
    .filter((srv) => ns.hasRootAccess(srv))
    .map((srv) => srv_info(ns, srv));

  const output = infos
    .filter((info) => info.money_max != 0)
    .sort((a, b) => a.money_max / a.sec_min - b.money_max / a.sec_min);

  output.forEach((info) => {
    ns.tprint(`Target ${info.name}:`);
    ns.tprint(
      `  money: ${fmt(info.money_curr)}/${fmt(info.money_max)} ${
        info.money_pct
      }%`
    );
    ns.tprint(`  sec  : ${info.sec_curr}/${info.sec_min} ${info.sec_pct}%`);
  });
}
