import { scan, srv_info } from "hacker-lib.js";

/** @param {NS} ns **/
export async function main(ns) {
  const infos = scan(ns)
    .filter((srv) => ns.hasRootAccess(srv))
    .map((srv) => srv_info(ns, srv));

  const output = infos
    .filter((info) => info.money_max != 0)
    .sort((a, b) => a - b);

  output.forEach((info) => {
    ns.tprint(`Target ${info.name}:`);
    ns.tprint(
      `  money: ${info.money_curr}/${info.money_max} ${info.money_pct}%`
    );
    ns.tprint(`  sec  : ${info.sec_curr}/${info.sec_max} ${info.sec_pct}%`);
  });
}
