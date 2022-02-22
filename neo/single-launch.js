import { idle_threads } from "neo/get-idle-capa.js";
import { launch } from "neo/coordinate.js";

/** @param {import('../NS').NS} ns **/
export async function main(ns) {
  const { capa, total } = idle_threads(ns, 1.7);
  const threads = 10;
  const action = "weaken";
  const target = "comptek";
  const wait_ms = 0;

  if (launch(ns, capa, threads, action, target, wait_ms)) {
    ns.tprintf("success");
  } else ns.tprintf("failed");
}
