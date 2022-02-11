/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const target = ns.args[0];
  // await ns.asleep(Math.random() * 60 * 1000);
  while (true) {
    ns.print("loop weaken target " + target);
    const amt = await ns.weaken(target);
    ns.print("weakened target " + target + " by " + amt);
    await ns.asleep(Math.random() * 10 * 1000);
  }
}
