const crimes = [
  "Shoplift",
  "Rob Store",
  "Mug",
  "Larceny",
  "Deal Drugs",
  "Bond Forgery",
  "Traffick Arms",
  "Homicide",
  "Grand Theft Auto",
  "Kidnap",
  "Assassination",
  "Heist",
];

/** @param {import('../NS').NS} ns **/
export async function main(ns) {
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
