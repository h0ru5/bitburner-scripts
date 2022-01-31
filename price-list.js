import { fmt } from "./hacker-lib.js";

/** @param {NS} ns **/
export async function main(ns) {
  const myRiches = ns.getServerMoneyAvailable("home");
  const maxSrvs = ns.getPurchasedServerLimit();
  const maxRam = ns.getPurchasedServerMaxRam();
  let sizes = [];
  for (let size = 8; size <= maxRam; size = size * 2) {
    sizes.push(size);
  }
  //const sizes = [8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096...];
  sizes.forEach((size) => {
    const price = ns.getPurchasedServerCost(size);
    const buyQty = Math.floor(myRiches / price);
    const maxQty = Math.min(buyQty, maxSrvs);

    ns.tprint(`${size} GB srv for ${fmt(price)}, can buy ${maxQty}`);
  });
}
