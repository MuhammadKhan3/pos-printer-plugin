const fs = require('fs')
const path = require('path');
var axios = require('axios');
const util = require('util');
const http = require('https')
const exec = util.promisify(require('child_process').exec);
const ProgressBar = require('progress');


async function posReplace() {
  try {
    let currentVersion = require('../update_poll/current_version.json');
    let localPosVersion = Number(currentVersion.pos_version);
    let response = await axios.get('https://pos.mikronexus.com/pos-installation/current_version.json');
    const data = response.data;
    // let posVersion=data?.pos_version;
    let posVersion = await data.split(',')[0].split(":")[1];
    posVersion = Number(JSON.parse(posVersion));
    if (posVersion > localPosVersion) {
      console.log('..............................posReplace..............................');
      const command5 = await exec(`del /f /q pos.zip"`);
      const downloadUrl = 'https://pos.mikronexus.com/pos-installation/pos.zip';
      const destinationPath = path.join(__dirname, 'pos.zip');

      const file = fs.createWriteStream(destinationPath);
      const request = http.get(downloadUrl, function (response) {
        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;
        const progressBar = new ProgressBar('Downloading [:bar] :percent :etas', {
          complete: '=',
          incomplete: ' ',
          width: 20,
          total: totalSize,
        });

        response.on('data', function (chunk) {
          downloadedSize += chunk.length;
          progressBar.tick(chunk.length);
        });

        response.pipe(file);

        file.on('finish', function () {
          file.close(async () => {
            const command1 = await exec(`powershell -Command "Expand-Archive -Path ${destinationPath} -Force"`);
            const command2 = await exec(`xcopy /E /Y "pos\\*" "..\\offline_server\\pos"`);
            const checkProcess = await exec(`pm2 pid offline`);
            if (checkProcess?.stdout != '0\n' && checkProcess?.stdout != '0' && checkProcess?.stdout != '\n') {
              console.log('...........offline command........', checkProcess?.stdout)
              const command3 = await exec(`pm2 reload offline`);
            }

            const command4 = await exec(`rmdir /s /q "pos"`);
            if (command4.stderr) {
              console.error(`Error: ${command4.stderr}`);
            } else {
              const filePath = "../update_poll/current_version.json";
              currentVersion.pos_version = posVersion.toString();
              currentVersion = JSON.stringify(currentVersion);

              fs.writeFile(filePath, currentVersion, function writeJSON(err) {
                if (err) return console.log(err);
              });

              posReplace();
            }

          });
        });
      });

      request.on('error', function (err) {
        console.error('Error downloading file:', err.message);
      });

      file.on('error', function (err) {
        console.error('Error writing to file:', err.message);
      });


    } else {
      console.log('..............Not Update Yet...................')
      const time = setTimeout(posReplace, 6000*60*24);
      // clearTimeout(time)
    }
  } catch (error) {
    console.error('Error in pos_replace:', error.message);
  }
};

posReplace();