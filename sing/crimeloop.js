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
  const crime = ns.args.join(" ");
  const target = -54000;
  ns.disableLog("ALL");
  ns.tail();
  while (true) {
    ns.clearLog();

    const { karma: dkarma, money, time, ...stats } = ns.getCrimeStats(crime);
    const karma = ns.heart.break();

    if (karma > target)
      ns.print(
        `Current Karma : ${karma}, ${(karma / target).toFixed(
          2
        )}%, delta Karma: -${dkarma}`
      );

    ns.print(`${crime}, chance: ${(ns.getCrimeChance(crime) * 100.0).toFixed(
      2
    )}%, 
    dur: ${ns.tFormat(time)}, gain: ${ns.nFormat(money, "$0.000a")}
   ${JSON.stringify(stats, null, 2)}`);
    const dur = ns.commitCrime(crime);
    await ns.asleep(dur);
  }
}

export function autocomplete(data, args) {
  return [...crimes];
}
