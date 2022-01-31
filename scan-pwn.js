import { scan } from "./hacker-lib.js";

/** @param {NS} ns **/
export async function main(ns) {
  const net = scan(ns);

  // determine ports we can open
  let can_ports = 0;
  if (ns.fileExists("BruteSSH.exe", "home")) can_ports++;
  if (ns.fileExists("FTPCrack.exe", "home")) can_ports++;
  if (ns.fileExists("relaySMTP.exe", "home")) can_ports++;
  if (ns.fileExists("HTTPWorm.exe", "home")) can_ports++;
  if (ns.fileExists("SQLInject.exe", "home")) can_ports++;

  // check ma 1337 skillz
  const skillz = ns.getHackingLevel();

  const pwnd = net.filter((srv) => ns.hasRootAccess(srv));
  const unpwnd = net.filter((srv) => !pwnd.includes(srv));
  const tgts = unpwnd.filter((srv) => {
    const needPorts = ns.getServerNumPortsRequired(srv);
    const needSkillz = ns.getServerRequiredHackingLevel(srv);
    return needPorts <= can_ports && needSkillz <= skillz;
  });

  ns.tprintf(
    `got ${pwnd.length} p0wnd servers, out of ${net.length}, found ${tgts.length} targets`
  );

  tgts.forEach((srv) => {
    const needPorts = ns.getServerNumPortsRequired(srv);
    const needSkillz = ns.getServerRequiredHackingLevel(srv);
    if (needPorts <= can_ports && needSkillz <= skillz) {
      ns.tprintf(`tgt ${srv}`);
      if (needPorts >= 1) ns.brutessh(srv);
      if (needPorts >= 2) ns.ftpcrack(srv);
      if (needPorts >= 3) ns.relaysmtp(srv);
      if (needPorts >= 4) ns.httpworm(srv);
      if (needPorts >= 5) ns.sqlinject(srv);
      ns.nuke(srv);
      ns.tprintf(`p0wnd ${srv}`);
      if (ns.fileExists("slave-host.js", "home")) {
        ns.run("slave-host.js", 1, srv);
      }
    }
  });
}
