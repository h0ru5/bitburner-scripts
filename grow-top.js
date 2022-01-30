import { scan, srv_money } from "hacker-lib.js";

/** @param {NS} ns **/
export async function main(ns) {
  while (true) {
    const infos = scan(ns)
      .filter((srv) => ns.hasRootAccess(srv))
      .map((srv) => srv_money(ns, srv));

    const output = infos
      .filter((info) => info.money_max != 0)
      .sort((a, b) => a.money_max - b.money_max)
      .slice(-5) //top 5
      .filter((info) => info.money_curr < info.money_max);

    ns.tprint(
      `top targets: ${output
        .map(
          (info) =>
            `${info.name} ${info.money_max.toExponential(2)}$ ${
              info.money_pct
            }%`
        )
        .join(", ")}`
    );

    if (output.length > 0) {
      const info = output[output.length - 1];
      ns.tprint(`Target ${info.name}:`);
      ns.tprint(
        `  before money: ${info.money_curr}/${info.money_max} ${info.money_pct}%`
      );
      await ns.grow(info.name);
      const after = srv_money(ns, info.name);
      ns.tprint(
        `  after money: ${after.money_curr}/${after.money_max} ${
          after.money_pct
        }% (raised ${percentage(info.money_curr, after.money_curr)}%)`
      );
    }
    await ns.sleep(100);
  }
}
