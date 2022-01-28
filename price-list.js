/** @param {NS} ns **/
export async function main(ns) {
  const myRiches = ns.getServerMoneyAvailable("home");
  const maxSrvs = ns.getPurchasedServerLimit();
  const sizes = [8, 16, 32, 64, 128, 256, 512, 1024];
  sizes.forEach((size) => {
    const price = ns.getPurchasedServerCost(size);
    const buyQty = Math.floor(myRiches / price);
    const maxQty = Math.min(buyQty, maxSrvs);

    ns.tprint(`${size} GB srv for ${price}, can buy ${maxQty}`);
  });
}
