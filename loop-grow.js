/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const target = ns.args[0];
  // await ns.asleep(Math.random() * 60 * 1000);
  while (true) {
    ns.print("loop growing target " + target);
    const amt = await ns.grow(target);
    ns.print("grown arget " + target + " by $" + ns.nFormat(amt));
    await ns.asleep(Math.random() * 10 * 1000);
  }
}
