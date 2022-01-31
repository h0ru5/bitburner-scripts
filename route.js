import { search } from "./hacker-lib.js";

export async function main(ns) {
  const target = ns.args[0];
  search(ns, target);
}
