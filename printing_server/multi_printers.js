const escpos = require("escpos");

const kitchen_printer_template_1 = require("../printer_templates/kitchen/kitchen_printer_template_1.js");
const counter_printer_template_1 = require("../printer_templates/counter/counter_printer_template_1.js");
const counter_printer_template_2 = require("../printer_templates/counter/counter_printer_template_2.js");
const counter_printer_template_3 = require("../printer_templates/counter/counter_printer_template_3.js");

const printer_config_check = require("./global_config/global_config.js");
const {
  drawer_serial_port,
} = require("../printer_templates/drawer/drawer_serial_port_template.js");

module.exports = {
  multi_printers: function (req) {
    printer_start_multiple(req);
  },
};

var current_date;
var current_time;
var now;
var current_month;

var attributes = [];
var printers = [];

var current_printer;
var current_device;
var current_conn;
var current_print_data_other;
var order_data;
var order_info_global;
var current_attr_ids = [];

var printer_flag = false;

function printer_start_multiple(req) {
  var printer_meta = req.printer_meta;

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
  var ord_info_alt = [];
  var order_info_all_items = [];

  attributes = req.attributes;
  printers = [];
  temp_printers = [];
  temp_ips = [];

  var default_items = [];

  order_data = req;

  order_info = req.order_info;

  ord_info_alt = req.order_info;

  order_info_global = req.order_info;

  var check_print_count = 1;

  if (order_data.order_info_all_items != undefined) {
    order_info_all_items = order_data.order_info_all_items;
  } else {
    order_info_all_items = order_info;
  }

  if (printer_meta.receipt == "counter_and_kitchen_attributes") {
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
          order_data.checkPrintCount !== undefined &&
          order_data.checkPrintCount !== null
        ) {
          check_print_count = Number(order_data.checkPrintCount);
        }

        for (
          var print_count = 0;
          print_count < check_print_count;
          print_count++
        ) {
          printer_device = new escpos.Network(
            printer_meta.counter_printer_ips[counter_printers].ip
          );
          printer_conn = new escpos.Printer(printer_device, options);

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

  var all_ips_arr = [];

  attributes.forEach(function (attr_arr) {
    if (Array.isArray(attr_arr?.attributes)) {
      let sortedArray = attr_arr?.attributes?.sort((a, b) => {
        if (a.attribute_text === "DEFAULT") {
          return -1;
        } else if (b.attribute_text === "DEFAULT") {
          return 1;
        } else {
          return a.attribute_text.localeCompare(b.attribute_text);
        }
      });
      attr_arr.attributes = sortedArray;
    }

    if (
      attr_arr.attributes.length != undefined &&
      attr_arr.attributes.length > 0
    ) {
      attr_arr.attributes.forEach(function (attr_obj) {
        console.log("attr_obj", attr_obj);

        if (attr_obj.ip != undefined) {
          let ip_arr = attr_obj.ip.split(",");
          console.log("ip_arr", ip_arr);

          ip_arr.forEach(function (ip) {
            ip = ip.trim();

            let attr_obj_temp = {
              ip: ip,
              ids: [attr_obj.id],
              attribute_text: attr_obj.attribute_text,
            };
            console.log("attr_obj_temp", attr_obj_temp);
            let attr_unique_index = isItemInArray(all_ips_arr, attr_obj_temp);
            console.log("attr_unique_index", attr_unique_index);

            if (attr_unique_index === false) {
              all_ips_arr.push(attr_obj_temp);
            } else {
              all_ips_arr[attr_unique_index].ids.push(attr_obj.id);
            }

            if (attr_obj.attribute_text.indexOf("RUNNER") !== -1) {
              let runner_attr = attr_obj.attribute_text.split("(");

              // runner_attr = [attr_obj.attribute_id];

              if (runner_attr.length > 1) {
                runner_attr = runner_attr[1].split(")");
                if (runner_attr.length > 1) {
                  runner_attr = runner_attr[0].split(",");

                  runner_attr.forEach((attr) => {
                    runner_attr.push(attr.trim());
                  });
                } else {
                  runner_attr = [];
                }
              } else {
                runner_attr = [];
              }

              console.log("runner_attr", runner_attr);

              printer_device = new escpos.Network(ip);
              printer_conn = new escpos.Printer(printer_device, options);

              printers.push({
                printer_device: printer_device,
                printer_conn: printer_conn,
                ip: ip,
                template: printer_meta.kitchen_printer_template,
                template_style: printer_meta.kitchen_printer_template_style,
                print_data: order_info,
                print_data_other: order_info_all_items,
                attr_ids: runner_attr,
                type: "kitchen_runner",
              });
            }
          });
        }
      });
    }
  });

  // console.log(all_ips_arr);

  // return;

  all_ips_arr.forEach(function (attr_obj) {
    let attr_flag = false;

    order_info.forEach(function (item) {
      if (item.attribute_id == undefined) {
        if (item.attributeId == undefined) {
          item.attribute_id = 0;
        } else {
          item.attribute_id = item.attributeId;
        }
      }

      if (item.attribute_id === undefined || item.attribute_id == 0) {
        all_ips_arr.forEach(function (attr_obj) {
          if (attr_obj.attribute_text.indexOf("DEFAULT") !== -1) {
            console.log("default_attr....");

            printer_device = new escpos.Network(attr_obj.ip);
            printer_conn = new escpos.Printer(printer_device, options);

            printers.push({
              printer_device: printer_device,
              printer_conn: printer_conn,
              ip: attr_obj.ip,
              template: printer_meta.kitchen_printer_template,
              template_style: printer_meta.kitchen_printer_template_style,
              print_data: default_items,
              print_data_other: order_info_all_items,
              attr_ids: [0],
              type: "kitchen",
            });
          }
        });
      }

      if (isItemIdInArray(attr_obj.ids, item.attribute_id) === true) {
        attr_flag = true;
      }

      console.log(
        "Item ATTR ID: " +
          item.menuItem +
          " || " +
          item.attribute_id +
          " || ATTR: " +
          attr_obj.ids +
          " (" +
          attr_flag +
          ")"
      );
    });

    if (attr_flag === true && attr_obj.ip != "0.0.0.0") {

      attr_obj.ids.forEach(item => {

        // attr_obj.ip = '192.168.1.202';

      printer_device = new escpos.Network(attr_obj.ip);
      printer_conn = new escpos.Printer(printer_device, options);

      printers.push({
        printer_device: printer_device,
        printer_conn: printer_conn,
        ip: attr_obj.ip,
        template: printer_meta.kitchen_printer_template,
        template_style: printer_meta.kitchen_printer_template_style,
        print_data: order_info,
        print_data_other: order_info_all_items,
        attr_ids: [item],
        type: "kitchen",
      });

    });

    }
  });


  if(req?.origin_host_data && (req?.origin_host_data).indexOf('localhost') === -1){
    console.log('Cash Drawer Open not allowed');
   
   }
   else{
    drawer_serial_port(req?.k_id, printer_meta?.counter_printer_ips);
   
}

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
    current_print_data_other = current_printer.print_data_other;

    current_attr_ids = current_printer.attr_ids;

    console.log("Current Printing IP old: " + current_printer.ip);

    current_device.open(
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
              order_info_global,
              order_data,
              {
                date: current_date,
                time: current_time,
              },
              current_printer.template_style,
              current_print_data_other,
              current_attr_ids,
              attributes
            );
          }
        }

        if (current_printer.type == "kitchen_runner") {
          if (current_printer.template == "1") {
            kitchen_printer_template_1.kitchen_printer_template_1(
              current_conn,
              order_info_global,
              order_data,
              {
                date: current_date,
                time: current_time,
              },
              current_printer.template_style,
              current_print_data_other,
              current_attr_ids,
              attributes,
              true
            );
          }
        }

        printer_flag = true;
      },
      (error) => {
        printer_flag = true;
      }
    );
  } else {
    printer_config_check.global_config.current_active_printing_attribute = false;
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

function isItemInArray(array, item) {
  for (var i = 0; i < array.length; i++) {
    if (array[i]["ip"] == item["ip"]) {
      return i;
    }
  }
  return false;
}

function isItemIdInArray(array, item) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == item) {
      return true;
    }
  }
  return false;
}
