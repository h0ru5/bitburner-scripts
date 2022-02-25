/** @param {import('../NS').NS} ns **/
export async function main(ns) {
  ns.disableLog("ALL");
  ns.tail();
  while (true) {
    ns.clearLog();
    ns.print("Current Karma : ", ns.heart.break());
    ns.commitCrime("Homicide");
    await ns.asleep(5000);
  }
}
