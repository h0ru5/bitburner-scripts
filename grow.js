/** @param {NS} ns **/
export async function main(ns) {
  const target = ns.args[0];
  const moneyThresh = ns.getServerMaxMoney(target);
  let moneyStash = ns.getServerMoneyAvailable(target);
  while (moneyStash < moneyThresh) {
    ns.print(
      "growing " + target + ", have " + moneyStash + " want " + moneyThresh
    );
    await ns.grow(target);
    moneyStash = ns.getServerMoneyAvailable(target);
  }
}
