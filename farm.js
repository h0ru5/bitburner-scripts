/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  let target = ns.args[0];
  ns.tprint("farming target " + target);
  const moneyThresh = ns.getServerMaxMoney(target);
  const securityThresh = ns.getServerMinSecurityLevel(target) + 2;
  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      await ns.weaken(target);
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      await ns.grow(target);
    } else {
      ns.print("server " + target + "is full and weak");
      await ns.sleep(1000);
    }
  }
}
