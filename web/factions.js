/** @param {NS} ns **/
export async function main(ns) {
  var factions = [];
  const faction_list = [
    "CyberSec",
    "Tian Di Hui",
    "Netburners",
    "Sector-12",
    "Chongqing",
    "New Tokyo",
    "Ishima",
    "Aevum",
    "Volhaven",
    "NiteSec",
    "The Black Hand",
    "BitRunners",
    "ECorp",
    "MegaCorp",
    "KuaiGong International",
    "Four Sigma",
    "NWO",
    "Blade Industries",
    "OmniTek Incorporated",
    "Bachman & Associates",
    "Clarke Incorporated",
    "Fulcrum Secret Technologies",
    "Slum Snakes",
    "Tetrads",
    "Silhouette",
    "Speakers for the Dead",
    "The Dark Army",
    "The Syndicate",
    "The Covenant",
    "Daedalus",
    "Illuminati",
  ];
  ns.tail();
  for (let f of faction_list) {
    if (ns.joinFaction(f) || ns.getFactionRep(f) > 0) {
      factions.push(f);
    }
  }
  for (let f of factions) {
    var augs = ns.getAugmentationsFromFaction(f);
    for (let a of augs) {
      ns.purchaseAugmentation(f, a);
    }
  }
}
