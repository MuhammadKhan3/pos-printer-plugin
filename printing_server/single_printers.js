const escpos = require("escpos");
escpos.USB = require("escpos-usb");

const kitchen_printer_template_1 = require("../printer_templates/kitchen/kitchen_printer_template_1");
const counter_printer_template_1 = require("../printer_templates/counter/counter_printer_template_1");
const counter_printer_template_2 = require("../printer_templates/counter/counter_printer_template_2");
const counter_printer_template_3 = require("../printer_templates/counter/counter_printer_template_3");

const printer_config_check = require("./global_config/global_config.js");
const printer_config = require("../config/printer_config.json");
const {
  staff_counter_printer_template_clock_out,
} = require("../printer_templates/counter/counter_staff_template_clock_out.js");
const {
  staff_counter_printer_template_clock,
} = require("../printer_templates/counter/counter_staff_template_clock.js");
const {
  drawer_serial_port,
} = require("../printer_templates/drawer/drawer_serial_port_template.js");

module.exports = {
  single_printers: function (req) {
    printer_start(req);
  },
};

var current_date;
var current_time;
var now;
var current_month;

var printers = [];

var current_printer;
var current_device;
var current_conn;
var current_print_data;
var order_data;

var printer_flag = false;

function printer_start(print_data) {
  printer_count = 0;

  now = new Date();
  current_month = Number(now.getMonth()) + 1;
  current_date =
    "" + current_month + "/" + now.getDate() + "/" + now.getFullYear() + "";
  current_time = tConv24(now.getHours() + ":" + now.getMinutes());

  var printer_device;
  var options = {
    encoding: "UTF-16BE",
  };
  var printer_conn;
  var order_info = [];

  var printer_meta = print_data.printer_meta;

  order_data = print_data;

  order_info = print_data.order_info;

  var order_info_all_items = [];

  var receipt_type = print_data.printer_meta.receipt;

  var check_print_count = 1;

  if (order_data.order_info_all_items != undefined) {
    order_info_all_items = order_data.order_info_all_items;
  } else {
    order_info_all_items = order_info;
  }

  if (receipt_type == "counter" || receipt_type == "kitchen_counter") {
    for (
      var counter_printers = 0;
      counter_printers < printer_meta.counter_printer_ips.length;
      counter_printers++
    ) {
      if (
        (printer_meta.counter_printer_ips[counter_printers].print ==
          undefined ||
          printer_meta.counter_printer_ips[counter_printers].print === true) &&
        (printer_meta.counter_printer_ips[counter_printers].k_id == undefined ||
          order_data.k_id == undefined ||
          printer_meta.counter_printer_ips[counter_printers].k_id ==
            order_data.k_id)
      ) {
        check_print_count = 1;

        if (
          order_data.checkPrintCount != undefined &&
          order_data.checkPrintCount != null
        ) {
          check_print_count = Number(order_data.checkPrintCount);
        }

        for (
          var print_count = 0;
          print_count < check_print_count;
          print_count++
        ) {
          const connection = PrinterConnection(
            printer_meta.counter_printer_ips[counter_printers].ip
          );
          printer_device = connection.printer_device;
          printer_conn = connection.printer_conn;

          let counter_template = printer_meta.counter_printer_template;

          if (order_data.online !== undefined && order_data.online === true) {
            counter_template = 3;
          }

          printers.push({
            printer_device: printer_device,
            printer_conn: printer_conn,
            ip: printer_meta.counter_printer_ips[counter_printers].ip,
            template: counter_template,
            template_style: printer_meta.counter_printer_template_style,
            print_data: order_info_all_items,
            type: "counter",
          });
        }
      }
    }
  }
  if (receipt_type == "kitchen" || receipt_type == "kitchen_counter") {
    for (
      var kitchen_printers = 0;
      kitchen_printers < printer_meta.kitchen_printer_ips.length;
      kitchen_printers++
    ) {
      if (
        (printer_meta.kitchen_printer_ips[kitchen_printers].print ==
          undefined ||
          printer_meta.kitchen_printer_ips[kitchen_printers].print === true) &&
        (printer_meta.kitchen_printer_ips[kitchen_printers].k_id == undefined ||
          order_data.k_id == undefined ||
          printer_meta.kitchen_printer_ips[kitchen_printers].k_id ==
            order_data.k_id)
      ) {
        printer_device = new escpos.Network(
          printer_meta.kitchen_printer_ips[kitchen_printers].ip
        );
        printer_conn = new escpos.Printer(printer_device, options);

        printers.push({
          printer_device: printer_device,
          printer_conn: printer_conn,
          ip: printer_meta.kitchen_printer_ips[kitchen_printers].ip,
          template: printer_meta.kitchen_printer_template,
          template_style: printer_meta.kitchen_printer_template_style,
          print_data: order_info,
          type: "kitchen",
        });
      }
    }
  }

  if (
    receipt_type == "staff_clock_out" ||
    receipt_type == "staff_counter_clock_in" ||
    receipt_type == "staff_counter_clock_out"
  ) {
    for (
      var counter_printers = 0;
      counter_printers < printer_meta.counter_printer_ips.length;
      counter_printers++
    ) {
      if (
        (printer_meta.counter_printer_ips[counter_printers].print ==
          undefined ||
          printer_meta.counter_printer_ips[counter_printers].print === true) &&
        (printer_meta.counter_printer_ips[counter_printers].k_id == undefined ||
          order_data.k_id == undefined ||
          printer_meta.counter_printer_ips[counter_printers].k_id ==
            order_data.k_id)
      ) {
        check_print_count = 1;

        if (
          order_data.checkPrintCount != undefined &&
          order_data.checkPrintCount != null
        ) {
          check_print_count = Number(order_data.checkPrintCount);
        }

        for (
          var print_count = 0;
          print_count < check_print_count;
          print_count++
        ) {
          const connection = PrinterConnection(
            printer_meta.counter_printer_ips[counter_printers].ip
          );
          printer_device = connection.printer_device;
          printer_conn = connection.printer_conn;

          let counter_template = printer_meta.counter_printer_template;

          printers.push({
            printer_device: printer_device,
            printer_conn: printer_conn,
            ip: printer_meta.counter_printer_ips[counter_printers].ip,
            template: counter_template,
            template_style: printer_meta.counter_printer_template_style,
            print_data: print_data,
            type: receipt_type,
          });
        }
      }
    }
  }
  // drawer_serial_port(
  //   print_data?.k_id,
  //   print_data?.printer_meta?.counter_printer_ips
  // );
  if (printers.length > 0) {
    printer_flag = true;
  }
}

setInterval(function () {
  if (printer_flag && printers.length > 0) {
    printer_flag = false;

    current_printer = printers.shift();

    current_device = current_printer.printer_device;
    current_conn = current_printer.printer_conn;
    current_print_data = current_printer.print_data;

    console.log("Current Printing IP: " + current_printer.ip);

    current_device?.open(
      function () {
        if (current_printer.type == "counter") {
          if (current_printer.template == "1") {
            counter_printer_template_1.counter_printer_template_1(
              current_conn,
              order_data,
              {
                date: current_date,
                time: current_time,
              },
              current_printer.template_style
            );
          }

          if (current_printer.template == "2") {
            counter_printer_template_2.counter_printer_template_2(
              current_conn,
              order_data,
              {
                date: current_date,
                time: current_time,
              },
              current_printer.template_style
            );
          }

          if (current_printer.template == "3") {
            console.log("Template 3");

            counter_printer_template_3.counter_printer_template_3(
              current_conn,
              order_data,
              {
                date: current_date,
                time: current_time,
              },
              current_printer.template_style
            );
          }
        }

        if (current_printer.type == "kitchen") {
          if (current_printer.template == "1") {
            kitchen_printer_template_1.kitchen_printer_template_1(
              current_conn,
              current_print_data,
              order_data,
              {
                date: current_date,
                time: current_time,
              },
              current_printer.template_style,
              []
            );
          }
        }

        if (current_printer.type == "staff_clock_out") {
          staff_counter_printer_template_clock_out(
            current_conn,
            order_data,
            {
              date: current_date,
              time: current_time,
            },
            current_printer.template_style
          );
        }

        if (current_printer.type == "staff_counter_clock_in") {
          staff_counter_printer_template_clock(
            current_conn,
            order_data,
            {
              date: current_date,
              time: current_time,
            },
            current_printer.template_style,
            "Clock In"
          );
        }

        if (current_printer.type == "staff_counter_clock_out") {
          staff_counter_printer_template_clock(
            current_conn,
            order_data,
            {
              date: current_date,
              time: current_time,
            },
            current_printer.template_style,
            "Clock Out"
          );
        }

        printer_flag = true;
      },
      (error) => {
        printer_flag = true;
      }
    );
  } else {
    printer_config_check.global_config.current_active_printing_single = false;
  }
}, 500);

function tConv24(time24) {
  var ts = time24.split(":");
  var H = Number(ts[0]);
  var m = Number(ts[1]);
  var h = H % 12 || 12;
  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  var ampm = H < 12 ? " AM" : " PM";
  ts = h + ":" + m + ampm;
  return ts;
}

function PrinterConnection(ip, options) {
  try {
    let printerConnType = printer_config?.printer_conn_type;

    let printer_device, printer_conn;

    if (printerConnType === "usb") {
      console.log(".............usb.................");
      const printerFind = escpos.USB.findPrinter();
      const { idVendor = 0, idProduct = 0 } = printerFind[0]?.deviceDescriptor;

      printer_device = new escpos.USB(idVendor, idProduct);

      printer_conn = new escpos.Printer(printer_device, options);
      return { printer_device, printer_conn };
    } else {
      console.log(".............network.................");

      printer_device = new escpos.Network(ip);
      printer_conn = new escpos.Printer(printer_device, options);

      return { printer_device, printer_conn };
    }
  } catch (error) {
    console.log(error);
  }
}
