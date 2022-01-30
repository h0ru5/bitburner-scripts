import { scan, srv_sec, percentage } from "hacker-lib.js";

/** @param {NS} ns **/
export async function main(ns) {
  while (true) {
    const infos = scan(ns)
      .filter((srv) => ns.hasRootAccess(srv))
      .map((srv) => srv_sec(ns, srv))
      .map((srv) => ({
        ...srv,
        money_curr: ns.getServerMoneyAvailable(srv.name),
      }));

    //ns.tprint(`info: ${infos.map((info) => info.name).join(", ")}`);

    const output = infos
      .filter((info) => info.money_curr != 0)
      .filter((info) => info.sec_curr <= info.sec_min + 1)
      .sort((a, b) => ns.money_curr - ns.money_curr);
    //.slice(-5); //top 5

    ns.tprint(
      `top targets: ${output
        .map((info) => `${info.name} ${info.sec_curr}/${info.sec_min}`)
        .join(", ")}`
    );

    if (output.length > 0) {
      const info = output[output.length - 1];
      ns.tprint(`Target ${info.name}:`);
      const preMoney = ns.getServerMoneyAvailable(info.name).toExponential(3);
      ns.tprint(
        `  before hack sec: ${info.sec_curr}/${info.sec_min} ${info.sec_pct}%, money: ${preMoney}`
      );
      await ns.hack(info.name);
      const postMoney = ns.getServerMoneyAvailable(info.name).toExponential(3);
      ns.tprint(
        `  after hack sec:  ${info.sec_curr}/${info.sec_min} ${
          info.sec_pct
        }%, money: ${postMoney}, got ${percentage(
          preMoney - postMoney,
          preMoney
        )}`
      );
    }
    await ns.sleep(100);
  }
}
