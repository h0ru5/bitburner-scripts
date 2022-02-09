/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const target = ns.args[0];
  ns.print("loop weaken target " + target);
  while (true) {
    await ns.weaken(target);
    await ns.asleep(Math.random() * 10 * 1000);
  }
}
