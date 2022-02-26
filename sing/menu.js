/** @param {import('../NS').NS} ns **/
export async function main(ns) {
  const crimes = [
    "Mug someone",
    "Homicide",
    "Assassinate",
    "Heist",
    "Kidnap and Ransom",
    "Grand theft Auto",
  ];

  crimes.forEach((crime) => {
    const { karma, money, time, ...stats } = ns.getCrimeStats(crime);
    ns.tprint(`${crime}, chance: ${(ns.getCrimeChance(crime) * 100.0).toFixed(
      2
    )}%, Karma: ${karma}, dur: ${ns.tFormat(time)}, gain: ${ns.nFormat(
      money,
      "$0.000a"
    )}
   ${JSON.stringify(stats, null, 2)}`);
  });
}
