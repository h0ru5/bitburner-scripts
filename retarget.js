import { best_target } from "./hacker-lib.js";

/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const target = best_target(ns);

  ns.tprintf(`new target is ${target.name}`);
  ns.run("official/monitor.js", 1, target.name);

  ns.run("slave-net.js", 1, target.name);
  ns.run("slave-home.js", 1, target.name);
}
