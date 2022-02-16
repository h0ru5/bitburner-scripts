import { search } from "./hacker-lib.js";

export function connect(path) {
  const doc = eval("document");
  const terminalInput = doc.getElementById("terminal-input");
  terminalInput.value = `home;${path}`;
  const handler = Object.keys(terminalInput)[1];
  terminalInput[handler].onChange({ target: terminalInput });
  terminalInput[handler].onKeyDown({ keyCode: 13, preventDefault: () => null });
}

export async function main(ns) {
  const target = ns.args[0];
  const path = search(ns, target);
  if (path && path.length > 0 && path[0] == "home") {
    path.shift();
  }
  if (path) {
    const connectStr = "connect " + path.join("; connect ");
    connect(connectStr);
  }
}

export function autocomplete(data, args) {
  return [...data.servers];
}
