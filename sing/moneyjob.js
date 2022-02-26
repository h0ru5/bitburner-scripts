/** @param {import('../NS').NS} ns **/
export async function main(ns) {
  while (true) {
    const time = ns.commitCrime("Heist");
    await ns.asleep(time);
  }
}
