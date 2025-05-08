const cors = require("cors");
const multi_printers = require("./multi_printers.js");
const single_printers = require("./single_printers_new.js");
const raw_printers = require("./raw_printers");
const dayclose_printers = require("./dayclose_printers");
const shift_printers = require("./shift_printers");
const report_printers = require("./report_printers");
const appointment_printers = require("./appointment_printers");
const drawer_printers = require("./drawer_printers");
const label_printers = require("./label_printers");
const giftcard_printers = require("./giftcards_printers");
const ping_check = require("../ping_check/ping_check");
const printer_config = require("../config/printer_config.json");
const printer_config_check = require("./global_config/global_config.js");
var https = require("https");
var fs = require("fs");
var path = require("path");
var axios = require("axios");
var proxy_config = require(path.join(
  __dirname,
  "..",
  "config",
  "proxy.config.json"
))["printing_server"];

var options = {
  key: fs.readFileSync(path.join(__dirname, "../config/ssl/", "", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "../config/ssl/", "", "cert.pem")),
};

var printQueue = [];
var req;

var express = require("express");
const { laserCounterReceipt } = require("./laser/couter_template.js");

var app = express();
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

app.use("/", express.static(path.join(__dirname, "laser")));

var port = process.env.PORT || 8080;

var router_print_handle = express.Router();

var auto_parining_handle = express.Router();

router_print_handle.get("/check_connection", async function (req, res) {
  // console.log("---Request in check_connection---");
  if (proxy_config.use === "self") {
    res.status(200).send({
      status: true,
      message: `Connection is active`,
      content:  printer_config_check.global_config.error_logs
    });
    printer_config_check.global_config.error_logs = '';
  } else {
    console.log("............remote............");
    const body = req.body;
    let data = await axios.get(
      `${proxy_config.remote_ip}/api/check_connection`,
      body
    );
    data = await data.data;
    res.status(200).json(data);
  }
});

router_print_handle.post("/", async function (req, res) {
  console.log("---Request in print_handle---");

  if (proxy_config.use === "self") {
    console.log("............self............");

    
    printQueuePush(req);

    res.json({
      message: "Printing...",
      status: true,
    });
  } else {
    console.log("............remote............");
    const body = req.body;
    let data = await axios.post(`${proxy_config.remote_ip}/api`, body);
    data = await data.data;
    res.status(200).json(data);
  }
});

router_print_handle.post("/receiptGenerate", (req, res, next) => {
  console.log("...............receipt............");
  let { body } = req;
  laserCounterReceipt(body, "invoice.pdf", res);
});

var router_ping_check = express.Router();

router_ping_check.get("/", async function (req, res) {
  console.log("---Request in ping_check---");
  if (proxy_config.use === "self") {
    console.log("............self............");

    req.body = printer_config;

    var ping_data = ping_check.ping_check(req.body);
    var ping_data_html = "";

    setTimeout(function () {
      for (var i = 0; i < ping_data.length; i++) {
        ping_data_html += ping_data[i].html;
      }

      res.json({
        list: ping_data,
        html: ping_data_html,
      });
    }, 10000);
  } else {
    console.log("............remote............");
    const body = req.body;
    let data = await axios.get(`${proxy_config.remote_ip}/ping_check`, body);
    data = await data.data;
    res.status(200).json(data);
  }
});

auto_parining_handle.get("/auto_pairing", async (req, res, next) => {
  console.log("---Request in Printing Auto Pairing---");

  if (proxy_config.use === "self") {
    console.log("............self............");
    res.send({
      status: true,
      massage: `Connection is active`,
    });
  } else {
    console.log("............remote............");
    const body = req.body;
    let data = await axios.get(`${proxy_config.remote_ip}/auto_pairing`, body);
    data = await data.data;
    res.status(200).json(data);
  }
});

app.use("/", auto_parining_handle);

app.use("/api", router_print_handle);

app.use("/ping_check", router_ping_check);

process.on("uncaughtException", function (err) {
  console.log(err.stack);
});

https.createServer(options, app).listen(8081, "0.0.0.0");
app.listen(8080);
console.log("Printing Server started on port:" + port);

setInterval(function () {
  var current_time = new Date();
  var current_time_display =
    "[" +
    (Number(current_time.getMonth()) + 1) +
    "/" +
    current_time.getDate() +
    "/" +
    current_time.getFullYear() +
    " " +
    current_time.getHours() +
    ":" +
    current_time.getMinutes() +
    "]";

  try {
    if (
      printQueue.length > 0 &&
      printer_config_check.global_config.current_active_printing_single ===
        false &&
      printer_config_check.global_config.current_active_printing_attribute ===
        false
    ) {
      let req = JSON.parse(printQueue.shift());

      console.log(
        "req.body.printer_meta.receipt",
        req.body.printer_meta.receipt,
        req.body.receipt,
        current_time_display
      );

      if (
        req.body.payment_info !== undefined &&
        req.body.payment_info.order_id !== undefined
      ) {
        console.log(
          "req.body.order_data.payment_info.order_id",
          req.body.payment_info.order_id,
          current_time_display
        );
      }

      if (
        req.body.printer_meta.receipt == "kitchen_counter" ||
        req.body.printer_meta.receipt == "counter" ||
        req.body.printer_meta.receipt == "kitchen" ||
        req.body.printer_meta.receipt == "staff_clock_out" ||
        req.body.printer_meta.receipt == "staff_counter_clock_in" ||
        req.body.printer_meta.receipt == "staff_counter_clock_out"
      ) {
        if (
          req.body.order_info !== undefined &&
          req.body.order_info.length > 0
        ) {
          printer_config_check.global_config.current_active_printing_single = true;

          single_printers.single_printers(req.body);
        } else if (
          req.body.printer_meta.receipt == "staff_counter_clock_out" ||
          req.body.printer_meta.receipt == "staff_counter_clock_in" ||
          req.body.printer_meta.receipt == "staff_clock_out"
        ) {
          printer_config_check.global_config.current_active_printing_single = true;

          single_printers.single_printers(req.body);
        }
      } else if (
        req.body.printer_meta.receipt == "counter_and_kitchen_attributes" ||
        req.body.printer_meta.receipt == "kitchen_attributes"
      ) {
        if (req.body.order_info.length > 0) {
          printer_config_check.global_config.current_active_printing_attribute = true;

          multi_printers.multi_printers(req.body);
        }
      } else if (
        req.body.printer_meta.receipt == "raw_counter" ||
        req.body.printer_meta.receipt == "raw_kitchen" ||
        req.body.printer_meta.receipt == "raw_kitchen_counter"
      ) {
        raw_printers.raw_printers(req.body);
      } else if (req.body.printer_meta.receipt == "giftcard_stats") {
        giftcard_printers.giftcard_printers(req.body);
      } else if (req.body.printer_meta.receipt == "dayclose") {
        dayclose_printers.dayclose_printers(req.body);
      } else if (req.body.printer_meta.receipt == "drawer" || req.body.printer_meta.receipt == 'cash_drawer_report') {
        drawer_printers.drawer_printers(req.body);
      } else if (
        req.body.printer_meta.receipt == "shift_started" ||
        req.body.printer_meta.receipt == "staff_clockout_report"
      ) {
        shift_printers.shift_printers(req.body);
      } else if (req.body.printer_meta.receipt == "rider_report") {
        report_printers.report_printers(req.body);
      } else if (req.body.printer_meta.receipt == "appointment_receipt") {
        appointment_printers.appointment_printers(req.body);
      } else if (req.body.printer_meta.receipt == "weight_label") {
        label_printers.label_printers(req.body);
      }
    }
  } catch (e) {
    console.log(e);
  }
}, 800);

function printQueuePush(req_push) {


  var origin_data = req_push.headers.host;

  req_push = req_push.body;
  req_push['origin_host_data'] = origin_data;

  console.log('ORIGIN-HOST', origin_data);

  let req_parsed = JSON.stringify(req_push);

  try {
    req_parsed = { body: JSON.parse(req_parsed) };

    if (req_parsed.body.receipt === undefined) {
      req_parsed.body.receipt = "";
    }

    printer_config.receipt = "";

    if (
      (req_parsed.body.receipt == "kitchen" ||
        req_parsed.body.receipt == "no_receipt_kitchen") &&
      req_parsed.body.kitchen_format_regular == false
    ) {
      printer_config.receipt = "kitchen_attributes";

      req_parsed.body.printer_meta = printer_config;
    } else if (
      req_parsed.body.receipt == "check" ||
      req_parsed.body.receipt == "check_no_tip" ||
      req_parsed.body.receipt == "regular"
    ) {
      printer_config.receipt = "counter";

      req_parsed.body.printer_meta = printer_config;
    } else if (req_parsed.body.receipt == "raw") {
      printer_config.receipt = "raw_counter";

      req_parsed.body.printer_meta = printer_config;
    } else if (req_parsed.body.receipt == "giftcard_stats") {
      printer_config.receipt = "giftcard_stats";

      req_parsed.body.printer_meta = printer_config;
    } else if (
      (req_parsed.body.receipt == "regular" ||
        req_parsed.body.receipt == "dual" ||
        req_parsed.body.receipt == "no_receipt" ||
        req_parsed.body.receipt == "no_print_drawer") &&
      req_parsed.body.kitchen_format_regular == false
    ) {
      if (
        req_parsed.body.receipt == "no_print_drawer" ||
        req_parsed.body.receipt == "regular"
      ) {
        printer_config.receipt = "counter";
      } else {
        printer_config.receipt = "counter_and_kitchen_attributes";
      }

      req_parsed.body.printer_meta = printer_config;
    } else if (
      (req_parsed.body.receipt == "kitchen" ||
        req_parsed.body.receipt == "no_receipt_kitchen") &&
      (req_parsed.body.kitchen_format_regular == undefined ||
        req_parsed.body.kitchen_format_regular == true)
    ) {
      printer_config.receipt = "kitchen";

      req_parsed.body.printer_meta = printer_config;
    } else if (
      (req_parsed.body.receipt == "regular" ||
        req_parsed.body.receipt == "dual" ||
        req_parsed.body.receipt == "no_receipt" ||
        req_parsed.body.receipt == "no_print_drawer") &&
      (req_parsed.body.kitchen_format_regular === undefined ||
        req_parsed.body.kitchen_format_regular === true)
    ) {
      if (
        req_parsed.body.receipt == "no_print_drawer" ||
        req_parsed.body.receipt == "regular"
      ) {
        printer_config.receipt = "counter";
      } else {
        printer_config.receipt = "kitchen_counter";
      }

      req_parsed.body.printer_meta = printer_config;
    } else if (req_parsed.body.receipt == "shift_started") {
      printer_config.receipt = "shift_started";

      req_parsed.body.printer_meta = printer_config;
    } else if (req_parsed.body.receipt == "staff_clock_out") {
      printer_config.receipt = "staff_clock_out";

      req_parsed.body.printer_meta = printer_config;
    } else if (req_parsed.body.receipt == "staff_counter_clock_in") {
      printer_config.receipt = "staff_counter_clock_in";

      req_parsed.body.printer_meta = printer_config;
    } else if (req_parsed.body.receipt == "staff_counter_clock_out") {
      printer_config.receipt = "staff_counter_clock_out";

      req_parsed.body.printer_meta = printer_config;
    } else if (req_parsed.body.receipt == "staff_clockout_report") {
      printer_config.receipt = "staff_clockout_report";

      req_parsed.body.printer_meta = printer_config;
    } else if (req_parsed.body.receipt == "rider_report") {
      printer_config.receipt = "rider_report";

      req_parsed.body.printer_meta = printer_config;
    } else if (req_parsed.body.receipt == "appointment_receipt") {
      printer_config.receipt = "appointment_receipt";

      req_parsed.body.printer_meta = printer_config;
    } else if (req_parsed.body.receipt == "weight_label") {
      printer_config.receipt = "weight_label";

      req_parsed.body.printer_meta = printer_config;
    } else if (req_parsed.body.drawer == 2 || req_parsed.body.drawer == 2.1) {
      printer_config.receipt = "dayclose";

      req_parsed.body.printer_meta = printer_config;
    } else if (req_parsed.body.drawer == 1) {
      printer_config.receipt = "drawer";

      req_parsed.body.printer_meta = printer_config;
    } else if (req_parsed.body.drawer == 1.1) {
      printer_config.receipt = "drawer";

      req_parsed.body.printer_meta = printer_config;
    }
    else if (req_parsed.body.receipt == 'cashDrawerManagementReport') {
      printer_config.receipt = "cash_drawer_report";

      req_parsed.body.printer_meta = printer_config;
    }

    printQueue.push(JSON.stringify(req_parsed));
  } catch (e) {
    console.log(e);
  }
}
