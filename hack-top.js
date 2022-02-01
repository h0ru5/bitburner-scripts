import {
  sorted_targets,
  srv_sec,
  percentage,
  fmt,
  srv_money,
} from "./hacker-lib.js";

/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  let haveTarget = false;
  while (true) {
    const infos = sorted_targets(ns)
      .map((srv) => ({
        ...srv,
        ...srv_sec(ns, srv.name),
        ...srv_money(ns, srv.name),
      }))
      .filter((info) => info.name !== "n00dles");

    //ns.tprint(`info: ${infos.map((info) => info.name).join(", ")}`);

    const output_s = infos
      .filter((info) => info.money_curr != 0)
      .filter((info) => info.sec_curr <= info.sec_min + 2); // only with reasonably weak security

    ns.print(
      `low-sec targets: ${output_s
        .map(
          (info) =>
            `${info.name} ${info.sec_curr}/${info.sec_min}, ${fmt(
              info.money_curr
            )}$/${fmt(info.money_max)}$`
        )
        .join(", ")}`
    );

    const output = output_s.filter(
      (info) => info.money_curr >= info.money_max * 0.5
    ); // only with decent money

    ns.print(
      `top targets: ${output
        .map((info) => `${info.name} ${info.sec_curr}/${info.sec_min}`)
        .join(", ")}`
    );

    if (output.length > 0) {
      haveTarget = true;
      const info = output[0];
      ns.print(`Target ${info.name}:`);
      const preMoney = info.money_curr;
      ns.print(
        `  before hack sec: ${info.sec_curr}/${info.sec_min} ${
          info.sec_pct
        }%, money: ${fmt(preMoney)}`
      );
      const loot = await ns.hack(info.name);
      const postMoney = ns.getServerMoneyAvailable(info.name);
      ns.print(
        `  after hack sec:  ${info.sec_curr}/${info.sec_min} ${
          info.sec_pct
        }%, money: ${fmt(postMoney)}, got ${percentage(loot, preMoney)}%`
      );
      ns.tprint(
        `Hacked ${info.name}: got ${fmt(loot)} (${percentage(
          loot,
          preMoney
        )}%), now at sec ${info.sec_curr.toFixed(2)}/${info.sec_min} (${
          info.sec_pct
        }%)`
      );
    } else {
      if (haveTarget) {
        ns.tprint("no more tagets available");
        haveTarget = false;
      }
    }
    await ns.sleep(1);
  }
}
