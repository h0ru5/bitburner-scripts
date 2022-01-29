/**
 * @param {NS} ns
 **/
export async function main(ns) {
  const targetScript = ns.args.shift();
  const targetArgs = ns.args;
  const runSize = ns.getScriptRam(targetScript);
  // TODO how to get local hostname or local ram?
  const srvRam = ns.getServerMaxRam("home");

  const threads = Math.floor(srvRam / runSize);
  ns.tprint(
    `  in 10s starting run ${targetScript} -t ${threads} ${targetArgs}`
  );
  ns.spawn(targetScript, threads, ...targetArgs);
}

export function autocomplete(data, args) {
  return [...data.scripts];
}
