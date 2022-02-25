/** @param {import('../NS').NS} ns **/
export async function main(ns) {
  while (true) {
    ns.commitCrime("Mug someone");
    await ns.asleep(5000);
  }
}
