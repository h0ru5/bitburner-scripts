import { search } from "./hacker-lib.js";

export async function main(ns) {
  const target = ns.args[0];
  const path = search(ns, target);
  if (path) ns.tprint("connect " + path.join("; connect "));
}
