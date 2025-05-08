const { spawn } = require("child_process");
var fs = require("fs").promises;
var path = require("path");
const fileSys = require("fs-extra");
const request = require("superagent");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const os = require("os");
const { sql_run } = require(path.join(__dirname, "sql_interface.js"));

const homeDir = os.homedir();

// Construct the path to the Downloads folder
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

var zip_name = "POS-Plugin-2024.zip";
var file_name = "POS-Plugin-2024";

const download_url = `https://pos.mikronexus.com/pos-installation/${zip_name}`;
// const download_url =`http://192.168.1.239:1133/pos-installation/pos-local-server-2024.zip`

const download_dest = path.join(homeDir, "Downloads", zip_name);

const extract_dest = path.join(homeDir, "Downloads", file_name);

const directories_path = require("./directories_path.json");
const { configurationFiles } = require("./config");

const serverUrl =
  "https://pos.mikronexus.com/pos-installation/current_version.json";
// const localServerUrl="http://192.168.1.239:1133/pos-installation/current_version.json";

const reloadProcess = (processName) => {
  return new Promise((resolve, reject) => {
    const pm2Reload = spawn("pm2", ["reload", processName], {
      stdio: "inherit",
      shell: true,
    });

    pm2Reload.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(`Failed to reload process: ${processName}`);
      }
    });
  });
};

function install_packages() {
  console.log("...........Install the packages...........");
  const npmInstall = spawn("npm", ["install"], { stdio: "pipe", shell: true });

  npmInstall.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  npmInstall.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  npmInstall.on("close", async (code) => {
    console.log(`child process exited with code ${code}`);

    console.log("...........Pm2 Reload...........");
    const processList = ["printing", "cart", "offline", "weight", "kds_orders"];
    for (const processName of processList) {
      try {
        await reloadProcess(processName);
        console.log(`Process ${processName} reloaded successfully.`);
        await delay(3000);
      } catch (error) {
        console.error(error);
      }
    }
  });
}

async function pm2_path() {
  try {
    let pm2Path;
    if (os.platform() === "win32") {
      // Windows
      pm2Path = path.join(process.env.USERPROFILE, ".pm2", "dump.pm2");
    } else {
      // Unix-based systems
      pm2Path = path.join(os.homedir(), ".pm2", "dump.pm2");
    }

    const data = await fs.readFile(pm2Path, "utf8");

    // Parse the JSON content of the dump.pm2 file
    const jsonData = JSON.parse(data);

    const [printingPath] = jsonData
      .filter((proc) => proc.name == "printing")
      .map((process) => process.pm_cwd);

    return path.dirname(printingPath);
  } catch (parseErr) {
    console.error(`Failed to parse JSON from dump.pm2: ${parseErr}`);
  }
}

async function update_files(fetched_version, local_version) {
  const destination = await pm2_path();
  const source = extract_dest;

  if (
    parseInt(fetched_version["folder_version_number"]) >
    parseInt(local_version["folder_version_number"])
  ) {
    updatePolls(source, destination);
  }

  for (const key in directories_path) {
    try {
      const directory = directories_path[key];

      if (parseInt(fetched_version[key]) > parseInt(local_version[key])) {
        if (Array.isArray(directory) == true && directory.length) {
          if (key != "config_version") {
            for (const nest_key of directory) {
              try {
                fileSys.copySync(
                  path.join(source, nest_key),
                  path.join(destination, nest_key),
                  { overwrite: true }
                );
              } catch (error) {
                console.log("nest directory error:", error);
              }
            }
          } else {
            configurationFiles(directory, source, destination);
          }
        } else {
          fileSys.copySync(
            path.join(source, directory),
            path.join(destination, directory),
            { overwrite: true }
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (
    parseInt(fetched_version["sql_version"]) >
    parseInt(local_version["sql_version"])
  ) {
    sql_run();
  }

  fileSys.writeFileSync(
    path.join(__dirname, "current_version.json"),
    JSON.stringify(fetched_version, null, 2),
    function (err) {}
  );

  fileSys.removeSync(download_dest);
  // fileSys.removeSync(extract_dest)

  install_packages();
}

async function get_pos_files(fetched_version, local_version) {
  console.log("......................Downloading file........................");

  const { stdout: downloadOutput } = await downloadFile();
  console.log(`Download successful: ${downloadOutput}`);

  // console.log('Extracting file...');
  const { stdout: extractOutput } = await extractFile();
  console.log(`Extraction successful: ${extractOutput}`);

  update_files(fetched_version, local_version);
}

const downloadFile = async () => {
  const curlCommand = `curl -o "${download_dest}" "${download_url}"`;
  return await exec(curlCommand);
};

// Function to extract the file using unzip
const extractFile = async () => {
  const cmd = `powershell -Command "Expand-Archive -Path '${download_dest}' -DestinationPath '${extract_dest}'"`;
  return await exec(cmd);
};

async function updatePolls(source, destination) {
  const sourceFolder = path.join(source, "update_poll");
  const destinationFolder = path.join(destination, "update_poll");

  const sourceDirectoryPath = path.join(sourceFolder, "directories_path.json");
  const destinationDirectoryPath = path.join(
    destinationFolder,
    "directories_path.json"
  );

  const destinationCurrentVersionPath = path.join(
    destinationFolder,
    "current_version.json"
  );

  try {
    // Read files concurrently
    const [
      destinationCurrentVersionData,
      sourceDirectoryData,
      destinationDirectoryData,
    ] = await Promise.all([
      fs.readFile(destinationCurrentVersionPath, "utf8"),
      fs.readFile(sourceDirectoryPath, "utf8"),
      fs.readFile(destinationDirectoryPath, "utf8"),
    ]);

    // Parse JSON data
    let destinationCurrentVersion = JSON.parse(destinationCurrentVersionData);
    const sourceDirectory = JSON.parse(sourceDirectoryData);
    const destinationDirectory = JSON.parse(destinationDirectoryData);

    // Iterate over source directory keys
    for (const key in sourceDirectory) {
      if (!destinationDirectory.hasOwnProperty(key)) {
        // If key does not exist in destination, set version to 0 and copy folder
        destinationCurrentVersion[key] = 0;

        const folderPath = sourceDirectory[key];
        const sourcePath = path.join(source, folderPath);
        const destinationPath = path.join(destination, folderPath);

        // Synchronously copy folder from source to destination
        fileSys.copySync(sourcePath, destinationPath, { overwrite: true });

        console.log(`Copied: ${sourcePath} -> ${destinationPath}`);
      }
    }

    //     // Write updated current version and directory path files
    await Promise.all([
      fs.writeFile(
        destinationCurrentVersionPath,
        JSON.stringify(destinationCurrentVersion, null, 2),
        "utf8"
      ),
      fs.writeFile(
        destinationDirectoryPath,
        JSON.stringify(sourceDirectory, null, 2),
        "utf8"
      ),
    ]);

    console.log("Update successful!");
  } catch (error) {
    console.error("Error during update poll:", error);
  }
}

function check_update() {
  try {
    console.log("..........Check Update..........");
    request.get(serverUrl, (error, response) => {
      if (error) {
        console.error("Error:", error);
      } else {
        let fetched_version = response?._body;
        delete require.cache[require.resolve("./current_version.json")];

        let local_version = require("./current_version.json");
        // fetched_version.extra_version= "0";
        // fetched_version.startup_version="0",
        // fetched_version.ping_version="1"
        // fetched_version.cart_version="1"
        // fetched_version.weight_version="1";
        // fetched_version.templates_version="1";
        // fetched_version.server_version="1";
        // fetched_version.offline_version="2";
        // fetched_version.sql_version="3";
        // fetched_version.config_version="4";
        // fetched_version.kds_version = 4;
        // fetched_version.folder_version_number=5;

        if (isUpdateRequired(fetched_version, local_version)) {
          get_pos_files(fetched_version, local_version);
        } else {
          console.log(
            "-----------------------------No update Available-----------------------------"
          );
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
}

const isUpdateRequired = (fetched_version, local_version) => {
  for (const key in fetched_version) {
    if (parseInt(fetched_version[key]) > parseInt(local_version[key])) {
      console.log(
        parseInt(fetched_version[key]) > parseInt(local_version[key]),
        key
      );
      return true;
    } else if (parseInt(fetched_version[key]).length > 0) {
      return true;
    }
  }
  return false;
};

setInterval(() => {
  check_update();
}, 60 * 60 * 1000 );
