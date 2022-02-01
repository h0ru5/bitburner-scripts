/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  const target = ns.args[0];

  let securityThresh = ns.getServerMinSecurityLevel(target);
  while (ns.getServerSecurityLevel(target) > securityThresh) {
    ns.print(
      "weaking " +
        target +
        " is " +
        ns.getServerSecurityLevel(target) +
        " want " +
        securityThresh
    );
    await ns.weaken(target);
  }
}
