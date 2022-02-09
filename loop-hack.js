/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const target = ns.args[0];
  ns.print("loop hacking target " + target);
  while (true) {
    await ns.hack(target);
    await ns.asleep(Math.random() * 10 * 1000);
  }
}
