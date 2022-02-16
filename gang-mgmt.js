/** @param {import('./NS').NS} ns **/
export async function main(ns) {
  while (true) {
    const members = ns.gang.getMemberNames();
    const tasks = ns.gang
      .getTaskNames()
      .map((name) => ns.gang.getTaskStats(name));

    const trainTask = tasks.find((task) => {
      return task.name.toLowerCase().includes("train") && task.hackWeight > 0;
    });

    if (ns.gang.canRecruitMember()) {
      const newGuy = `r00kie-${members.length}`;
      if (ns.gang.recruitMember(newGuy)) {
        ns.tprint("new gang member : " + newGuy);
        members.push(newGuy);
        ns.gang.setMemberTask(newGuy, trainTask.name);
      }
    }

    const equipment = ns.gang
      .getEquipmentNames()
      .map((name) => ({ name, ...ns.gang.getEquipmentStats(name) }))
      .map((stats) => ({
        ...stats,
        price: ns.gang.getEquipmentCost(stats.name),
        type: ns.gang.getEquipmentType(stats.name),
      }))
      .filter((stats) => stats.hack > 0);

    for (let ganger of members.map((name) => ({
      name,
      ...ns.gang.getMemberInformation(name),
    }))) {
      const hasEquip = [...ganger.augmentations, ...ganger.upgrades];
      const needs = equipment.filter((equip) => !hasEquip.includes(equip.name));

      ns.print(
        `gang member ${ganger.name} has: ${hasEquip.join(", ")}, needs: ${needs
          .map((eqp) => eqp.name)
          .join(", ")}`
      );

      for (let eqp of needs) {
        if (eqp.price < ns.getServerMoneyAvailable("home")) {
          ns.tprint(`purchased ${eqp.name} for ${ganger.name}`);
          ns.gang.purchaseEquipment(ganger.name, eqp.name);
        }
      }
    }

    await ns.sleep(20);
  }
}
