/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  let target = ns.args[0];
  ns.tprint("farming and hacking target " + target);
  const moneyThresh = ns.getServerMaxMoney(target) * 0.9;
  const securityThresh = ns.getServerMinSecurityLevel(target) + 2;
  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      await ns.weaken(target);
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      await ns.grow(target);
    } else {
      await ns.hack(target);
    }
  }
}
