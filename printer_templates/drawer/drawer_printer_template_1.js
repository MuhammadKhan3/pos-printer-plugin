const { drawer_serial_port } = require("./drawer_serial_port_template");

module.exports = {
  drawer_printer_template_1: function (printer_conn, print_data, date_time) {
    try {
      print_handler(printer_conn, print_data, date_time);
    } catch (e) {
      setTimeout(function () {
        console.log("Printer is not reachable...", e);
      }, 1);
    }
  },
};

function print_handler(printer_conn, print_data, date_time) {
  console.log("Cashdrawer opened on no sale");
  if (print_data.drawer == 1.1) {
    printer_conn.cashdraw();
    drawer_serial_port(
      print_data?.k_id,
      print_data?.printer_meta?.counter_printer_ips
    );

    printer_conn.beep(2, 1).text(" ").close();

    return;
  }

  printer_conn.cashdraw();

  drawer_serial_port(
    print_data?.k_id,
    print_data?.printer_meta?.counter_printer_ips
  );

  printer_conn
    .size(2, 1)
    .align("ct")
    .text("******* No Sale ********")
    .text("-- DRAWER OPENED --")
    .size(1, 1)
    .align("ct")
    .text("\n")
    .beep(2, 1)
    .text("Staff Name: " + print_data.staff_name)
    .text("\n")
    .text("This action has been recorded")
    .text("\n")
    .size(1, 1)
    .align("ct")
    .text("Print date-time: " + date_time.date + " " + date_time.time)
    .text("\n")
    .cut()
    .close();
}
