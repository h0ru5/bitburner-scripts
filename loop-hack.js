/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const target = ns.args[0];
  await ns.asleep(Math.random() * 60 * 1000);
  ns.print("loop hacking target " + target);
  while (true) {
    const amt = await ns.hack(target);
    ns.print("hacked target " + target + " for $" + ns.nFormat(amt));
    await ns.asleep(Math.random() * 10 * 1000);
  }
}
