/**
 * @param {NS} ns
 **/
export async function main(ns) {
  const srv = ns.args.shift();
  const targetScript = ns.args.shift();
  const targetArgs = ns.args;
  const runSize = ns.getScriptRam(targetScript);
  const srvRam = ns.getServerMaxRam(srv);

  const threads = Math.floor(srvRam / runSize);
  ns.tprint(
    `  starting ${targetScript} on ${srv} with -t ${threads} and args ${targetArgs}`
  );
  await ns.exec(targetScript, srv, threads, ...targetArgs);
}

export function autocomplete(data, args) {
  switch (args.length) {
    case 1:
      return [...data.servers];
    case 2:
      return [...data.scripts];
    default:
      return [];
  }
}
