import { sorted_targets, srv_sec } from "./hacker-lib.js";

/** @param {NS} ns **/
export async function main(ns) {
  while (true) {
    const output = sorted_targets(ns)
      .map((srv) => ({
        ...srv,
        ...srv_sec(ns, srv.name),
      }))
      .filter((info) => info.sec_curr > info.sec_min + 1);

    ns.print(
      `top targets: ${output
        .map((info) => `${info.name} ${info.sec_curr}/${info.sec_min}`)
        .join(", ")}`
    );

    if (output.length > 0) {
      const info = output[0];
      ns.print(
        `Target ${info.name}, before: ${info.sec_curr}/${info.sec_min} ${info.sec_pct}%`
      );
      await ns.weaken(info.name);
      const post = srv_sec(ns, info.name);
      ns.print(
        `  after sec: ${post.sec_curr}/${post.sec_min} ${post.sec_pct}%`
      );
      ns.tprint(
        `weakened ${info.name}: ${info.sec_curr} -> ${post.sec_curr}/${post.sec_min}, now at ${post.sec_pct}%`
      );
    }
    await ns.sleep(100);
  }
}