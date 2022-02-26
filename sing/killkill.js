/** @param {import('../NS').NS} ns **/
export async function main(ns) {
  const target = -54000;
  ns.disableLog("ALL");
  ns.tail();
  while (true) {
    ns.clearLog();

    const karma = ns.heart.break();
    if (karma > target)
      ns.print(`Current Karma : ${karma}, ${(karma / target).toFixed(2)}%`);

    const crime = "Homicide";

    const { karma: dkarma, money, time, ...stats } = ns.getCrimeStats(crime);
    ns.print(`${crime}, chance: ${(ns.getCrimeChance(crime) * 100.0).toFixed(
      2
    )}%,
Karma: -${dkarma}, dur: ${ns.tFormat(time)}, gain: ${ns.nFormat(
      money,
      "$0.000a"
    )}
   ${JSON.stringify(stats, null, 2)}`);
    const dur = ns.commitCrime(crime);
    await ns.asleep(dur);
  }
}
