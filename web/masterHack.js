/** @param {NS} ns **/
export async function main(ns) {
  // Parameters
  // param 1: Server you want to hack
  // param 2: OPTIONAL - Server you want to start the hack from, i.e. any public servers, purchased servers or 'home'
  //
  // EXAMPLE 1: run masterHack.js joesguns
  // This will start hacking 'joesguns' using the RAM of 'joesguns'
  //
  // EXAMPLE 2: run masterHack.js joesguns s1
  // This will start hacking 'joesguns' using the RAM of my purchased server 's1'
  //
  // This 'masterHack.js' process will stay active on whatever server you execute it from.
  // I usually start it from 'home', then I can track all my earnings in one place.
  // Keep in mind, when using 'home' as second parameter the script might use all available RAM
  // and you might become unable to execute any other scripts on 'home' until you kill the process.

  var target = ns.args[0];
  var serverToHackFrom = target; // For single argument calls - server will hack itself
  var hackScript = "hack.js";
  var growScript = "grow.js";
  var weakenScript = "weaken.js";
  var hackScriptRAM = ns.getScriptRam(hackScript);
  var growScriptRAM = ns.getScriptRam(growScript);
  var serverMaxMoney = ns.getServerMaxMoney(target);
  var serverGrowthPercentage = ns.getServerGrowth(target) / 100;
  var serverMaxRAM;
  var serverGrowthRate;
  var moneyThresh = serverMaxMoney * 0.9; // 0.90 to maintain near 100% server money.  You can use 0.75 when starting out/using low thread counts
  var securityThresh = ns.getServerMinSecurityLevel(target) + 5;
  var currentServerMoney;
  var currentServerSecurity;
  var useThreadsHack;
  var possibleThreads;
  var maxHackFactor = 0.001;
  var growWeakenRatio = 0.9; // How many threads are used for growing vs. weaking (90:10).
  var sleepTime;
  var cores = 1; // I didn't bother with cores for now. Uncomment the line 51 if you want to use this.
  var coreMultiplier;
  const hackSecurityIncrease = 0.002; // Yes these values are constant. Grow security increase is hack * 2 = 0.004 per thread. hackAnalyzeSecurity() just wastes RAM and this script is too big already.
  const serverMaxGrowthRate = 1.0035; // Taken from the source code. I couldn't find a way to calculate the future growth amount without checking the src code for the growthAnalyze() function.
  const serverBaseGrowthRate = 1.03; // Taken from the source code
  const bitNodeMultiplierServerGrowthRate = 1; // Adjust this according to your BitNode as long as you are not in BN5 or don't have SF-5. In BN5 or with SF-5 you can use ns.getBitNodeMultipliers().ServerGrowthRate instead.
  // Check https://github.com/danielyxie/bitburner/blob/62ac7f7d170b14bb7a9988411d7c6f17e690f058/src/BitNode/BitNode.tsx and search for the initBitNodeMultipliers function, there you will find all the different multipliers.

  // If second argument is provided, hack will run from this server instead
  if (ns.args[1]) {
    serverToHackFrom = ns.args[1];
  }
  serverMaxRAM = ns.getServerMaxRam(serverToHackFrom);
  // cores = ns.getServer(serverToHackFrom).cpuCores; // Not sure if this is relevant anywhere outside of 'home'
  coreMultiplier = 1 + (cores - 1) / 16;

  // Gain root access. Make sure you have the nuke.js script on 'home'
  if (!ns.hasRootAccess(target)) {
    ns.exec("nuke.js", "home", 1, target);
    await ns.sleep(2000);
  }

  // Copy the work scripts, if not already on server
  if (!ns.fileExists(hackScript, serverToHackFrom)) {
    await ns.scp(hackScript, "home", serverToHackFrom);
  }
  if (!ns.fileExists(growScript, serverToHackFrom)) {
    await ns.scp(growScript, "home", serverToHackFrom);
  }
  if (!ns.fileExists(weakenScript, serverToHackFrom)) {
    await ns.scp(weakenScript, "home", serverToHackFrom);
  }

  // To prevent the script from crashing/terminating after closing and restarting the game.
  while (
    ns.isRunning(hackScript, serverToHackFrom, target) ||
    ns.isRunning(growScript, serverToHackFrom, target) ||
    ns.isRunning(weakenScript, serverToHackFrom, target)
  ) {
    await ns.sleep(10000);
  }

  // Main loop - will terminate if no RAM available
  while (
    1 <
    (possibleThreads = Math.floor(
      (serverMaxRAM - ns.getServerUsedRam(serverToHackFrom)) / growScriptRAM
    ))
  ) {
    currentServerMoney = ns.getServerMoneyAvailable(target);
    currentServerSecurity = ns.getServerSecurityLevel(target);

    // The first to cases are for new servers with high SECURITY LEVELS and to quickly grow the server to above the threshold
    if (
      currentServerSecurity > securityThresh &&
      currentServerMoney < moneyThresh
    ) {
      sleepTime = ns.getWeakenTime(target) + 1000; // Added 1 second to the 'sleepTime' variables to prevent any issues with overlapping work scripts
      ns.exec(
        growScript,
        serverToHackFrom,
        Math.ceil(possibleThreads / 2),
        target
      );
      ns.exec(
        weakenScript,
        serverToHackFrom,
        Math.floor(possibleThreads / 2),
        target
      );
      await ns.sleep(sleepTime); // wait for the weaken command to finish
    } else if (currentServerMoney < moneyThresh) {
      sleepTime = ns.getWeakenTime(target) + 1000;
      ns.exec(
        growScript,
        serverToHackFrom,
        Math.floor(possibleThreads * growWeakenRatio),
        target
      );
      ns.exec(
        weakenScript,
        serverToHackFrom,
        Math.ceil(possibleThreads * (1 - growWeakenRatio)),
        target
      );
      await ns.sleep(sleepTime); // wait for the weaken command to finish
    } else {
      // Define max amount that can be restored with one grow (using all available threads) and therefore will be used to define hack threads.
      // This loop narrows the hack factor to the best possible value and considers the necessary growth threads AFTER the hack has been performed, since
      // the work time is determined with SECURITY LEVEL before start, but the grow amount is determined using the updated SECURITY LEVEL when grow() finishes.
      // The code/formula for calculating the grow threads (line 101 - 104) is fully taken from the 'numCycleForGrowth' function that is used by growthAnalyze and others in the source code. I'm not that smort. I simply adjusted it to my needs.
      // Maybe they could implement the possibility to give growthAnalyze additional security levels/'hackDifficulty' as a parameter. That way you don't need to use getHackingMultipliers() and save >> 4 << GB.
      // Also I didn't bother optimizing the 'growWeakenRatio', as 90% is good enough already. It will be just a few more hack threads, if any at all - even with large RAM sizes.
      while (
        maxHackFactor < 0.999 &&
        Math.floor(
          (possibleThreads / growScriptRAM -
            (useThreadsHack = Math.floor(
              ns.hackAnalyzeThreads(target, currentServerMoney * maxHackFactor)
            )) /
              hackScriptRAM) *
            growScriptRAM *
            growWeakenRatio
        ) >
          Math.floor(
            Math.log(serverMaxMoney / (serverMaxMoney * (1 - maxHackFactor))) /
              (Math.log(
                (serverGrowthRate =
                  1 +
                  (serverBaseGrowthRate - 1) /
                    (currentServerSecurity +
                      hackSecurityIncrease * useThreadsHack)) >
                  serverMaxGrowthRate
                  ? serverMaxGrowthRate
                  : serverGrowthRate
              ) *
                ns.getHackingMultipliers().growth *
                serverGrowthPercentage *
                bitNodeMultiplierServerGrowthRate *
                coreMultiplier)
          )
      ) {
        maxHackFactor += 0.001; // increase by 0.1% with each iteration
      }
      maxHackFactor -= 0.001; // Since it's more than 'possibleThreads' can handle now, we need to dial it back once.
      sleepTime = ns.getHackTime(target) + 1000;
      useThreadsHack = Math.min(useThreadsHack, possibleThreads); // Prevents going above RAM limit or hacking too much
      ns.tprint(
        `threads for hacking ${useThreadsHack} = min(${useThreadsHack},${possibleThreads})`
      );
      if (useThreadsHack > 0) {
        ns.exec(hackScript, serverToHackFrom, useThreadsHack, target);
      }
      possibleThreads = Math.floor(
        (serverMaxRAM - ns.getServerUsedRam(serverToHackFrom)) / growScriptRAM
      );
      if (possibleThreads >= 2) {
        sleepTime = ns.getWeakenTime(target) + 1000;
        const growThreads = Math.floor(possibleThreads * growWeakenRatio);
        if (growThreads)
          ns.exec(growScript, serverToHackFrom, growThreads, target);
        ns.exec(
          weakenScript,
          serverToHackFrom,
          Math.ceil(possibleThreads * (1 - growWeakenRatio)),
          target
        );
      }
      await ns.sleep(sleepTime); // wait for the weaken command to finish
      maxHackFactor = 0.001;
    }
  }
  ns.tprint(
    "Script was terminated. Not enough RAM available on '" +
      serverToHackFrom +
      "'."
  );
}
