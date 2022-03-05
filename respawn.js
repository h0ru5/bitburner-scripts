/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  ns.purchaseTor();
  while (!ns.purchaseProgram("BruteSSH.exe")) {}
  while (!ns.purchaseProgram("FTPCrack.exe")) {}
  while (!ns.purchaseProgram("relaySMTP.exe")) {}
  while (!ns.purchaseProgram("HTTPWorm.exe")) {}
  while (!ns.purchaseProgram("SQLInject.exe")) {}
  ns.run("gang/gang-mgmt-combat.js");
  ns.run("neo/runc.js");
}
