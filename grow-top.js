import { sorted_targets, srv_money, percentage, fmt } from "./hacker-lib.js";

/** @param {NS} ns **/
export async function main(ns) {
  while (true) {
    const output = sorted_targets(ns)
      .map((srv) => ({
        ...srv,
        ...srv_money(ns, srv.name),
      }))
      .filter((info) => info.money_curr < info.money_max);

    ns.print(
      `top targets: ${output
        .map(
          (info) => `${info.name} ${fmt(info.money_max)}$ ${info.money_pct}%`
        )
        .join(", ")}`
    );

    if (output.length > 0) {
      const info = output[0];
      ns.print(`Target ${info.name}:`);
      ns.print(
        `  before money: ${fmt(info.money_curr)}/${fmt(info.money_max)} ${
          info.money_pct
        }%`
      );
      const amount = await ns.grow(info.name);
      const after = srv_money(ns, info.name);
      ns.print(
        `  after money: ${fmt(after.money_curr)}/${fmt(after.money_max)} ${
          after.money_pct
        }% (raised ${percentage(info.money_curr, after.money_curr)}%)`
      );
      ns.tprint(
        `growing ${info.name}: ${fmt(info.money_curr)}$ -> ${fmt(
          after.money_curr
        )}$ / ${fmt(info.money_max)}$  ${after.money_pct}% (+ ${percentage(
          amount,
          info.money_curr
        )}%)`
      );
    } else if (haveTarget) {
      ns.tprint("no more tagets available");
      haveTarget = false;
    }
    await ns.sleep(100);
  }
}
