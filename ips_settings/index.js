var https = require("https");
var fs = require("fs");
var path = require("path");
const cors = require("cors");
const childProcess = require("child_process");
const ping = require("ping");
const printers_filename = "../config/printer_config.json";
const printers = require(printers_filename);
var express = require("express");
const { getIPs } = require("./IpDetect/gateway");
var app = express();

var options = {
  key: fs.readFileSync(path.join(__dirname, "../config/ssl/", "", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "../config/ssl/", "", "cert.pem")),
};

app.use(express.json({ limit: "100mb" }));

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res, next) => {
  try {
    res.sendFile(__dirname + "/template/index.html");
  } catch (error) {
    console.log(error);
  }
});

app.get("/printers", (req, res, next) => {
  try {
    res.json({
      printers: printers,
      status: true,
      message: "Successfully Fetched",
    });
  } catch (error) {
    console.log(error);
  }
});

app.put("/printers", (req, res, next) => {
  try {
    const printerIps = req.body;
    for (const key in printerIps) {
      printers[key] = printerIps[key];
    }

    fs.writeFile(
      printers_filename,
      JSON.stringify(printers),
      function writeJSON(err) {
        if (err) return console.log(err);
      }
    );

    const command = "pm2 reload printing";

    childProcess.exec(command, function (error, stdout, stderr) {
      if (error) {
        console.error("Error executing the batch file:", error);
      } else {
        console.log("Stdout:", stdout);
        console.log("Stderr:", stderr);
      }
    });

    res.json({ status: true, message: "Successfully Updated File" });
  } catch (error) {
    console.log(error);
  }
});

app.post("/ping-ip", async (req, res, next) => {
  try {
    const { pingIp } = req.body;
    console.log(`------------------pingIp:${pingIp}------------------------`);
    let DataIp = await ping.promise.probe(pingIp);

    res.json({
      data: DataIp,
      status: true,
      message: "Successfully Updated File",
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/ips-lists", async (req, res, next) => {
  try {
    console.log(
      "---------------------------------ips lists-------------------------------"
    );

    const ips = await getIPs();
    res.json(ips);
  } catch (error) {
    console.log(error);
  }
});

https.createServer(options, app).listen(7000, "0.0.0.0");
app.listen(7001, () => {
  console.log("http://localhost:7001");
});
