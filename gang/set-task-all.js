const tasks = [
  "Unassigned",
  "Mug People",
  "Deal Drugs",
  "Strongarm Civilians",
  "Run a Con",
  "Armed Robbery",
  "Traffick Illegal Arms",
  "Threaten & Blackmail",
  "Human Trafficking",
  "Terrorism",
  "Vigilante Justice",
  "Train Combat",
  "Train Hacking",
  "Train Charisma",
  "Territory Warfare",
];

/** @param {import('../NS').NS} ns **/
export async function main(ns) {
  const members = ns.gang.getMemberNames();
  const task = ns.args.join(" ");

  for (const member of members) {
    ns.gang.setMemberTask(member, task);
  }
}

export function autocomplete(data, args) {
  return tasks;
}
