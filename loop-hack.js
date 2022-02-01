/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const target = ns.args[0];
  ns.tprint("loop hacking target " + target);
  while (true) {
    await ns.hack(target);
  }
}
