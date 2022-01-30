import { scan, srv_sec } from "hacker-lib.js";

/** @param {NS} ns **/
export async function main(ns) {
  while (true) {
    const infos = scan(ns)
      .filter((srv) => ns.hasRootAccess(srv))
      .map((srv) => srv_sec(ns, srv));

    //ns.tprint(`info: ${infos.map((info) => info.name).join(", ")}`);

    const output = infos
      .filter((info) => info.money_max != 0)
      .sort(
        (a, b) => ns.getServerMaxMoney(a.name) - ns.getServerMaxMoney(b.name)
      )
      .slice(-5) //top 5
      .filter((info) => info.sec_curr > info.sec_min + 1);

    ns.tprint(
      `top targets: ${output
        .map((info) => `${info.name} ${info.sec_curr}/${info.sec_min}`)
        .join(", ")}`
    );

    if (output.length > 0) {
      const info = output[output.length - 1];
      ns.tprint(`Target ${info.name}:`);
      ns.tprint(
        `  before sec: ${info.sec_curr}/${info.sec_min} ${info.sec_pct}%`
      );
      await ns.weaken(info.name);
      const post = srv_sec(ns, info.name);
      ns.tprint(
        `  after sec: ${post.sec_curr}/${post.sec_min} ${post.sec_pct}%`
      );
    }
    await ns.sleep(100);
  }
}
