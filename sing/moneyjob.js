/** @param {import('../NS').NS} ns **/
export async function main(ns) {
  while (true) {
    ns.commitCrime("Heist");
    await ns.asleep(5000);
  }
}
