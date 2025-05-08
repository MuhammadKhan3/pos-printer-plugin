const exec = require("child_process").exec;
const ping = require("ping");
const defaultGateway = require("default-gateway");

async function getGateway(callback) {
  // return new Promise((resolve, reject) => {
  //   exec("ipconfig /all", function (err, stdout, stderr) {
  //     if (err) {
  //       reject(err);
  //       return;
  //     }

  //     const concatenatedLines = [];
  //     const lines = stdout.split("\n");

  //     let defaultGatewayLine = lines.filter(
  //       (line) =>
  //         line.includes("Default Gateway") ||
  //         line.includes("Wireless LAN adapter Wi-Fi") ||
  //         line.includes("Ethernet adapter Ethernet")
  //     );
  //     console.log(defaultGatewayLine);

  //     defaultGatewayLine = defaultGatewayLine.map((line) => {
  //       return line.includes("Default Gateway")
  //         ? line.split(":")[1].trim()
  //         : line.split(":")[0];
  //     });
  //     for (let i = 0; i < defaultGatewayLine?.length; i += 2) {
  //       const currentLine = defaultGatewayLine[i].concat(
  //         ":",
  //         defaultGatewayLine[i + 1] || ""
  //       ); // concatenate current and next line (or empty string if there's no next line)
  //       concatenatedLines.push(currentLine);
  //     }
  //     const wirelessAdapter = concatenatedLines.filter((adapter) =>
  //       adapter.startsWith("Wireless LAN adapter")
  //     )[0];
  //     const stringIps = wirelessAdapter?.split(":");
  //     console.log(stringIps);
  //     resolve(stringIps);
  //   });
  // });

  const { gateway } = await defaultGateway.v4();

  return gateway;
}

async function getAliveIps(defaultGateway, concurrencyLimit = 50) {
  let ips = [];
  const dg_array = defaultGateway.split(".");

  let ip = `${dg_array[0]}.${dg_array[1]}.${dg_array[2]}`;
  let promises = [];

  for (let port = 2; port < 255; port++) {
    const currentIp = `${ip}.${port}`;

    promises.push(
      ping.promise.probe(currentIp).then((res) => {
        const { alive, host, output } = res;

        // const data = output.search(/Request timed out/i);
        if (alive) {
          ips.push(host);
          console.log(`Alive Ip:${host}`)
        }
      })
    );

    // Process pings in batches to avoid overwhelming the network
    if (promises.length >= concurrencyLimit) {
      await Promise.allSettled(promises);
      promises = []; // Reset the promise array after processing the batch
    }
  }
  if (promises.length > 0) {
    await Promise.allSettled(promises);
  }
  // await Promise.all(promises);
  return ips;
}

async function getIPs() {
  try {
    const defaultGatewayIP = await getGateway();
    const aliveIps = await getAliveIps(defaultGatewayIP);
    return aliveIps;
  } catch (error) {
    console.error("Error in getIPs:", error);
    throw error; // Re-throw the error to propagate it to the caller
  }
}

function isValidIp(ip) {
  ip = ip.replace(":", "");
  // Regular expression to match valid IPv4 addresses
  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // Test if the provided IP matches the pattern
  return ipRegex.test(ip);
}

module.exports = { getIPs };
