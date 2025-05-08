var line1 = "________________________________________________";
var line2 = "------------------------------------------------";
var line3 = "================================================";
var line4 = "- - - - - - - - - - - - - - - - - - - - - - - -";

const escpos = require("escpos");

const path = require("path");

const template_styles = require("../../config/template_styles.json");
// const { drawer_serial_port } = require('../drawer/drawer_serial_port_template');

module.exports = {
  counter_printer_template_3: function (
    printer_conn,
    order_data,
    date_time,
    template_style
  ) {
    try {
      print_handler(printer_conn, order_data, date_time, template_style);
    } catch (e) {
      setTimeout(function () {
        console.log("Printer is not reachable...", e);
      }, 1);
    }
  },
};

var currency_symbol = "$";

function print_handler(printer_conn, order_data, date_time, template_style) {
  var fire_line = "";
  var receipt_top_gap_counter = "";
  var top_business_name = false;
  var show_item_extras = true;
  var show_cash_cc_amounts = true;
  var temp_order_id_split = "";
  var show_price_column = true;

  var price_column_text = "";

  var show_bottom_delivery_info = true;

  var show_paid_status_on_check = true;
  var show_item_instructions_on_check = true;

  var logo_on_top = false;

  var logo_print_timeout = 10;

  var qr_print_timeout = 10;

  var show_split_section = false;

  var hold_id_qr_local = false;

  var regular_tip_flag = true;

  if (template_styles[template_style - 1].regular_tip != undefined) {
    regular_tip_flag = template_styles[template_style - 1].regular_tip;
  }

  if (template_styles[template_style - 1].hold_id_qr_local != undefined) {
    hold_id_qr_local = template_styles[template_style - 1].hold_id_qr_local;
  }

  if (template_styles[template_style - 1].show_split_section != undefined) {
    show_split_section = template_styles[template_style - 1].show_split_section;
  }

  if (template_styles[template_style - 1].logo_on_top != undefined) {
    logo_on_top = template_styles[template_style - 1].logo_on_top;
  }

  if (template_styles[template_style - 1].currency_symbol != undefined) {
    currency_symbol = template_styles[template_style - 1].currency_symbol;
  }

  if (
    template_styles[template_style - 1].show_paid_status_on_check != undefined
  ) {
    show_paid_status_on_check =
      template_styles[template_style - 1].show_paid_status_on_check;
  }

  if (
    template_styles[template_style - 1].show_item_instructions_on_check !=
    undefined
  ) {
    show_item_instructions_on_check =
      template_styles[template_style - 1].show_item_instructions_on_check;
  }

  if (template_styles[template_style - 1].show_cash_cc_amounts != undefined) {
    show_cash_cc_amounts =
      template_styles[template_style - 1].show_cash_cc_amounts;
  }

  if (template_styles[template_style - 1].show_item_extras != undefined) {
    show_item_extras = template_styles[template_style - 1].show_item_extras;
  }

  if (template_styles[template_style - 1].receipt_top_gap != undefined) {
    receipt_top_gap_counter =
      template_styles[template_style - 1].receipt_top_gap_counter;
  }

  if (template_styles[template_style - 1].show_price_column != undefined) {
    show_price_column = template_styles[template_style - 1].show_price_column;
  }

  if (
    template_styles[template_style - 1].show_bottom_delivery_info != undefined
  ) {
    show_bottom_delivery_info =
      template_styles[template_style - 1].show_bottom_delivery_info;
  }

  if (
    ((order_data.type == "cash" ||
      order_data.type == "Cash" ||
      order_data.type == "split" ||
      order_data.type == "Split" ||
      order_data.payment_type == "Split" ||
      order_data.payment_type == "split") &&
      order_data.online != true) ||
    (order_data.open_cashdrawer_credit &&
      order_data.open_cashdrawer_credit == true)
  ) {
    if (
      (order_data.receipt != "check" && order_data.receipt != "check_no_tip") ||
      order_data.receipt == "no_print_drawer" ||
      order_data.receipt == "no_receipt"
    ) {
      printer_conn.cashdraw();
      console.log("Cashdrawer opened");
      //   drawer_serial_port(
      //     order_data?.k_id,
      //     order_data?.printer_meta?.counter_printer_ips
      //   );
    }
  }

  if (
    (order_data.receipt == "no_receipt" ||
      order_data.receipt == "no_print_drawer") &&
    order_data.online != true
  ) {
    printer_conn.beep(1, 1).close();

    return;
  }

  printer_conn.font("a").beep(3, 1).align("ct").text(receipt_top_gap_counter);

  printer_conn.align("ct").size(2, 2).text("ONLINE ORDER");

  if (order_data.reprint != undefined && order_data.reprint == true) {
    printer_conn.align("ct").size(2, 2).style("b").text("[DUPLICATE]").text("");
  }

  if (order_data.type != undefined && order_data.type == "void") {
    printer_conn.align("ct").size(2, 2).style("b").text("[VOID]").text("");
  }

  if (logo_on_top === true) {
    escpos.Image.load(
      path.join(__dirname, "../../config/", "", "logo.png"),
      (image) => {
        console.log("PRINTING IMAGE");
        printer_conn.align("ct").image(image);
      }
    );

    // setTimeout(function(){
    //  printer_conn
    //     .cut()
    //     .close()

    // }, 2000);

    logo_print_timeout = 1000;

    // return;
  }

  setTimeout(function () {
    if (
      order_data.business_info &&
      template_styles[template_style - 1].top_business_name != undefined &&
      template_styles[template_style - 1].top_business_name == true
    ) {
      printer_conn
        .align("ct")
        .size(1, 1)
        .style("b")
        .text(order_data.business_info.name)
        .text(order_data.business_info.address);
    }

    if (order_data.vendor_name != undefined && order_data.vendor_name != "") {
      printer_conn
        .align("ct")
        .size(2, 2)
        .style("b")
        .text("")
        .text(order_data.vendor_name)
        .text("");
    }

    if (
      order_data.pos_receipt_number != undefined &&
      order_data.pos_receipt_number != ""
    ) {
      printer_conn
        .align("ct")
        .size(2, 2)
        .style("b")
        .text("Chk " + order_data.pos_receipt_number);
    } else if (
      order_data.instructions.invoiceNumber != undefined &&
      order_data.instructions.invoiceNumber != ""
    ) {
      printer_conn
        .align("ct")
        .size(2, 2)
        .style("b")
        .text("Chk " + order_data.instructions.invoiceNumber);
    }

    printer_conn.font("a").align("ct").size(2, 2);

    if (
      order_data.instructions.giftcard &&
      order_data.instructions.giftcard != "undefined" &&
      order_data.instructions.giftcard.length > 0
    ) {
      var gift_card_amount = 0;
      order_data.instructions.giftcard.forEach(function (giftcard) {
        gift_card_amount = gift_card_amount + Number(giftcard.amount);
      });
    }

    printer_conn
      .align("lt")

      .size(1, 1)

      .text("");
    if (
      order_data.payment_info.order_id != undefined &&
      show_paid_status_on_check == true
    ) {
      temp_order_id_split = (order_data.payment_info.order_id + "").split("-");

      if (
        (order_data.type == "cash" || order_data.type == "Cash") &&
        order_data.online == true
      ) {
        temp_order_id_split = " (NOT PAID)";
      } else if (temp_order_id_split.length == 2) {
        temp_order_id_split = " (PAID)";
      } else {
        temp_order_id_split = " (NOT PAID)";
      }

      printer_conn.text(
        "  Order ID: " + order_data.payment_info.order_id + temp_order_id_split
      );
    }

    if (show_bottom_delivery_info == false) {
      if (order_data.customer_name) {
        printer_conn.text("  Customer Name: " + order_data.customer_name);
      }

      if (order_data.customer_phone) {
        printer_conn.text("  Customer Phone: " + order_data.customer_phone);
      }
    }

    if (order_data.payment_info.order_date) {
      printer_conn.text(
        "  Order Time: " +
          order_data.payment_info.order_date +
          " " +
          order_data.payment_info.order_time
      );
    }
    if (gift_card_amount) {
      printer_conn.text("  Gift Card: " + gift_card_amount);
    }
    if (order_data.instructions.Points) {
      printer_conn.text("  Points Used: " + order_data.instructions.Points);
    }

    if (show_price_column == true) {
      price_column_text = "Price";
    } else {
      price_column_text = "-";
    }

    // printer_conn

    // .text('')
    // .size(1, 1)
    // .style('b')
    // .tableCustom(
    //             [
    //                 {text: '---', align: "LEFT", width: "0.10"},

    //                 {text: '----', align: "LEFT", width: "0.70"},

    //                 {text: '-----', align: "RIGHT", width: "0.20"}
    //             ]
    //         )

    //item
    var tabs;
    var subtotal = 0;
    var nicotine_tax = 0;

    order_data.order_info.forEach(function (order_info) {
      if (order_info.menuItem != "???PRINT_LINE_1???") {
        subtotal = subtotal + Number(order_info.totalPrice);
        if (order_info.additionalTax) {
          nicotine_tax += Number(order_info.additionalTax);
        }

        if (Number(order_info.basePrice) == 0) {
          order_info.basePrice = "--";
        } else {
          order_info.basePrice = "" + Number(order_info.basePrice).toFixed(2);
        }

        if (Number(order_info.totalPrice) == 0) {
          order_info.totalPrice = "--";
        } else {
          order_info.totalPrice = "" + Number(order_info.totalPrice).toFixed(2);
        }

        if (show_price_column == true) {
          price_column_text = order_info.basePrice;
        } else {
          price_column_text = "-";
        }

        printer_conn.text("");

        // printer_conn
        // .size(1, 2)
        // .style('r')
        // .tableCustom(
        //     [
        //         {text: ' '+order_info.quantity+"x", align: "LEFT", width: "0.15"},
        //         {text: order_info.menuItem, align: "LEFT", width: "0.55"},
        //         {text: order_info.totalPrice, align: "RIGHT", width: "0.20"}
        //     ]
        // )

        printer_conn

          .size(1, 2)

          .text(order_info.quantity + " - " + order_info.menuItem.trim());

        if (order_info.unit_text != undefined) {
          if (order_info.unit_text != "") {
            printer_conn
              .size(1, 1)
              .style("r")
              .tableCustom([{ text: order_info.unit_text, align: "LEFT" }]);
          }
        }

        if (order_info.menuExtrasSelected && show_item_extras === true) {
          order_info.menuExtrasSelected.forEach(function (extras) {
            printer_conn.style("r");

            printer_conn.size(1, 2);

            if (order_data.extra_category_title_print) {
              printer_conn.size(1, 1).text("(" + extras.heading.trim() + ")");
            }

            if (extras.optionNameSelected == undefined) {
              extras.optionNameSelected = extras.options;
            }

            extras.optionNameSelected.forEach(function (options) {
              if (Number(options.total) == 0) {
                options.total = "";
              } else {
                options.total = " (" + Number(options.total).toFixed(2) + ")";
              }

              if (show_price_column == true) {
                price_column_text = options.total;
              } else {
                price_column_text = "-";
              }

              printer_conn.size(1, 1).text("> " + options.name.trim());
            });
          });
        }
        if (
          order_info.itemInstructions != undefined &&
          order_info.itemInstructions != "" &&
          show_item_instructions_on_check == true
        ) {
          printer_conn
            .style("r")
            .text("Instructions: " + order_info.itemInstructions);
        }
      } else {
        printer_conn.style("r").text(line2);
      }
    });

    printer_conn.size(1, 1);

    printer_conn
      .text("")
      .align("rt")
      .text("Sub Total: " + Number(subtotal).toFixed(2));
    if (
      order_data.instructions.BusinessDiscount &&
      calculateBusinessDiscount(order_data) > 0
    ) {
      printer_conn.text(
        "Business Discount: -" + calculateBusinessDiscount(order_data)
      );
    }
    if (
      order_data.payment_info.discount != "" &&
      order_data.payment_info.discount != undefined &&
      Number(order_data.payment_info.discount) > 0
    ) {
      printer_conn.text(
        " Discount: -" + Number(order_data.payment_info.discount).toFixed(2)
      );
    }

    if (order_data.instructions.global_discount) {
      var discountTitle = "Discount";
      if (
        order_data.instructions.discount_name != undefined &&
        order_data.instructions.discount_name != "undefined"
      ) {
        discountTitle = order_data.instructions.discount_name;
      }
      printer_conn.text(
        discountTitle +
          ": -" +
          Number(order_data.instructions.global_discount).toFixed(2)
      );
    }

    if (
      order_data.instructions.calculatedDiscount &&
      order_data.instructions.calculatedDiscount != "" &&
      order_data.instructions.calculatedDiscount != "0.00" &&
      order_data.instructions.calculatedDiscount != 0 &&
      order_data.instructions.calculatedDiscount != "0"
    ) {
      printer_conn.text(
        "POS Discount" +
          ": -" +
          Number(order_data.instructions.calculatedDiscount).toFixed(2)
      );
    }

    if (order_data.instructions.Type == "Delivery") {
      printer_conn.text(
        "Delivery Fee: " +
          Number(order_data.instructions.delivery_fee).toFixed(2)
      );
    }

    if (Number(nicotine_tax) > 0) {
      printer_conn.text("Nicotine Tax: " + Number(nicotine_tax).toFixed(2));
    }

    if (order_data.instructions.discount_value_customized) {
      printer_conn.text(
        order_data.instructions.discount_value_customized_text +
          ": " +
          Number(order_data.instructions.discount_value_customized).toFixed(2)
      );
    }

    if (order_data.payment_info.tax == undefined) {
      printer_conn.text("Tax: 0.00");
    } else {
      printer_conn.text(
        "Tax: " + Number(order_data.payment_info.tax).toFixed(2)
      );
    }

    if (gift_card_amount) {
      printer_conn.text("Giftcard: -" + Number(gift_card_amount).toFixed(2));
    }
    if (order_data.instructions.Tip) {
      printer_conn.text(
        "Gratuity: " + Number(order_data.instructions.Tip).toFixed(2)
      );
    }

    if (order_data.instructions.cash_discount) {
      printer_conn.text(
        "DualPriceAdj: " +
          Number(order_data.instructions.cash_discount).toFixed(2)
      );
    }

    if (order_data.instructions.platformFeeAmount) {
      printer_conn.text(
        "Platform Fee: " +
          Number(order_data.instructions.platformFeeAmount).toFixed(2)
      );
    }

    printer_conn.size(2, 2);
    if (order_data.refund) {
      printer_conn.text(
        "Total: - " + currency_symbol + Number(order_data.total).toFixed(2)
      );
    } else {
      printer_conn.text(
        "Total: " + currency_symbol + Number(order_data.total).toFixed(2)
      );
    }

    printer_conn.size(1, 1);

    if (order_data.given_value) {
      printer_conn
        .size(1, 1)
        .text(
          "Amount Given: " +
            currency_symbol +
            Number(order_data.given_value).toFixed(2)
        );
    }

    if (order_data.balance && order_data.type == "cash") {
      printer_conn.text(
        "Change Due: " + currency_symbol + Number(order_data.balance).toFixed(2)
      );
    }

    var paid_status_and_type = "";

    if (order_data.type == "credit" && order_data.payment_type != "split") {
      paid_status_and_type += "Paid by Card";
    }

    paid_status_and_type += temp_order_id_split;

    printer_conn
      .align("rt")
      .text(paid_status_and_type)
      // .text(line1)
      .text("");

    if (
      order_data.cc_amounts != undefined &&
      (order_data.receipt == "check" || order_data.receipt == "check_no_tip") &&
      show_cash_cc_amounts
    ) {
      printer_conn
        // .text(line2)
        .text("")
        .size(1, 1)
        .style("b")
        .tableCustom([
          { text: "Cash Amount", align: "CENTER", width: "0.50" },
          { text: "PAY BY CARD", align: "CENTER", width: "0.50" },
        ]);

      printer_conn
        .size(1, 1)
        .style("b")
        .tableCustom([
          {
            text: currency_symbol + Number(order_data.total).toFixed(2),
            align: "CENTER",
            width: "0.50",
          },
          {
            text:
              currency_symbol + Number(order_data.cc_amounts.total).toFixed(2),
            align: "CENTER",
            width: "0.50",
          },
        ]);

      // console.log('order_data.instructions.cash_discount', order_data.instructions.cash_discount);

      // printer_conn
      // .size(1, 1)
      // .style('b')
      //     .tableCustom(
      //         [
      //             {text: '', align: "CENTER", width: "0.50"},
      //             {text: 'DualPriceAdj: ' + currency_symbol + Number(order_data.cc_amounts.cash_discount).toFixed(2), align: "CENTER", width: "0.50"}
      //         ]
      //     )

      printer_conn
        .size(1, 1)
        .style("r")
        .tableCustom([
          { text: "", align: "CENTER", width: "0.50" },
          {
            text: order_data.cc_amounts.message,
            align: "CENTER",
            width: "0.50",
          },
        ]);
    }

    if (
      (order_data.type == "split" ||
        order_data.type == "Split" ||
        order_data.payment_type == "split" ||
        order_data.payment_type == "Split") &&
      order_data.cc_amounts != undefined &&
      (order_data.receipt != "check" || order_data.receipt != "check_no_tip")
    ) {
      printer_conn
        // .text(line2)
        .text("")
        .text("For split payment");

      printer_conn
        .size(1, 1)
        .text(
          "Paid by Cash: " +
            Number(order_data.cc_amounts.cash_amount).toFixed(2)
        );
      printer_conn.text(
        "Paid by Card: " +
          Number(order_data.cc_amounts.credit_amount).toFixed(2)
      );

      if (order_data.instructions.cash_discount) {
        printer_conn.text(
          "DualPriceAdj: " +
            Number(order_data.instructions.cash_discount).toFixed(2)
        );
      }
    }

    if (show_split_section === true) {
      var total_for_split = Number(order_data.total).toFixed(2);

      printer_conn.align("ct").text("**********");

      printer_conn
        .size(1, 1)
        .style("b")
        .tableCustom([
          { text: "", align: "CENTER", width: "0.10" },
          {
            text:
              "Split/2 Guests: " +
              currency_symbol +
              Number(total_for_split / 2).toFixed(2),
            align: "CENTER",
            width: "0.80",
          },
          { text: "", align: "CENTER", width: "0.10" },
        ]);

      printer_conn
        .size(1, 1)
        .style("b")
        .tableCustom([
          { text: "", align: "CENTER", width: "0.10" },
          {
            text:
              "Split/3 Guests: " +
              currency_symbol +
              Number(total_for_split / 3).toFixed(2),
            align: "CENTER",
            width: "0.80",
          },
          { text: "", align: "CENTER", width: "0.10" },
        ]);

      printer_conn
        .size(1, 1)
        .style("b")
        .tableCustom([
          { text: "", align: "CENTER", width: "0.10" },
          {
            text:
              "Split/4 Guests: " +
              currency_symbol +
              Number(total_for_split / 4).toFixed(2),
            align: "CENTER",
            width: "0.80",
          },
          { text: "", align: "CENTER", width: "0.10" },
        ]);

      printer_conn.align("ct").text("**********").text("");
    }

    if (hold_id_qr_local === true) {
      if (order_data.hold_id != undefined && order_data.hold_id != "") {
        qr_print_timeout = 10;
        printer_conn.qrimage("HH" + order_data.hold_id, function (err) {
          console.log("HOLDID:", "HH" + order_data.hold_id, err);
          printer_conn.text(order_data.hold_id).text("\n");
        });
      }
    }

    //instructions text
    if (
      order_data.instructions.cart_instruction != undefined &&
      order_data.instructions.cart_instruction != ""
    ) {
      printer_conn
        .size(1, 1)
        .align("lt")
        .text(
          "Order Instructions: " + order_data.instructions.cart_instruction
        );
    }

    if (
      order_data.receipt != "check_no_tip" &&
      (order_data.reprint == undefined || order_data.reprint === false) &&
      regular_tip_flag === true
    ) {
      printTipTemplate(printer_conn, Number(subtotal));
    }

    // printer_conn
    //             .align('ct')
    //             .size(1, 1)
    //             .style('b')
    //             .text(temp_order_id_split)

    if (
      order_data.table_name &&
      order_data.table_name != "" &&
      order_data.table_name.trim() != "<>" &&
      order_data?.table_name?.includes("undefined") !== true
    ) {
      if (order_data.fireLine != undefined && order_data.fireLine == true) {
        fire_line = "FIRE -> ";
      } else {
        fire_line = "";
      }

      printer_conn
        .size(2, 2)
        .align("ct")
        .text(fire_line + "Table: " + order_data.table_name);
    }

    printer_conn.size(1, 1);

    if (order_data.instructions.Notes) {
      printer_conn
        .size(1, 1)
        .control("lf")
        .text("Note: " + order_data.instructions.Notes)
        // .text(line1)
        .text("");
    }

    if (
      order_data.rawText != undefined &&
      order_data.rawText != "" &&
      (template_styles[template_style - 1].payment_express_receipt ==
        undefined ||
        template_styles[template_style - 1].payment_express_receipt === true)
    ) {
      if (
        template_styles[template_style - 1].payment_express_tip != undefined &&
        template_styles[template_style - 1].payment_express_tip == true
      ) {
        printTipTemplate(printer_conn, Number(subtotal));
      }

      printer_conn
        .size(1, 1)
        // .text(line1)
        .text("")
        .align("ct")
        // .text('Credit Card Payment Receipt')
        .text(order_data.rawText);
    }

    if (show_bottom_delivery_info === true) {
      printer_conn
        .size(1, 1)
        // .text(line1)
        .text("")
        .align("ct")
        .style("r")
        .size(1, 1);

      if (order_data.instructions.orderTypeLabel) {
        printer_conn
          .text(order_data.instructions.orderTypeLabel.toUpperCase())
          .marginBottom(2);
      } else {
        printer_conn.text(order_data.instructions.Type).marginBottom(2);
      }

      if (order_data.refund == undefined || !order_data.refund) {
        printer_conn.size(1, 1);

        if (order_data.instructions.Type == "Delivery") {
          printer_conn.size(1, 2);

          printer_conn

            .align("ct")
            .style("r")
            .text("Delivery Address: " + order_data.payment_info.address)
            .marginBottom(20);

          printer_conn.style("r").align("ct");
          if (order_data.payment_info.order_date) {
            printer_conn.text(
              order_data.payment_info.order_date +
                " " +
                order_data.payment_info.order_time
            );
          }

          printer_conn.size(1, 1);
        } else if (order_data.instructions.Type == "Pickup") {
          printer_conn.style("r").align("ct");
          if (order_data.scheduled_time) {
            printer_conn.text(order_data.scheduled_time);
          } else if (order_data.payment_info.order_date) {
            printer_conn

              .style("r")
              .align("ct")

              .text(
                order_data.payment_info.order_date +
                  " " +
                  order_data.payment_info.order_time
              );
          } else {
            printer_conn
              .style("r")
              .align("ct")

              .text(order_data.payment_info.order_time);
          }
        }
      }

      printer_conn.size(1, 1);
      if (order_data.customer_name) {
        printer_conn.text(order_data.customer_name);
      }

      if (order_data.customer_phone) {
        printer_conn.text(order_data.customer_phone);
      }
    }

    if (order_data.reprint != undefined && order_data.reprint == true) {
      printer_conn
        .align("ct")
        .size(2, 2)
        .style("b")
        .text("[DUPLICATE]")
        .text("");

      printer_conn.size(1, 1);
    }

    if (order_data.type != undefined && order_data.type == "void") {
      printer_conn.align("ct").size(2, 2).style("b").text("[VOID]").text("");

      printer_conn.size(1, 1);
    }

    if (
      order_data.business_info &&
      (template_styles[template_style - 1].top_business_name == undefined ||
        template_styles[template_style - 1].top_business_name == false)
    ) {
      printer_conn
        .align("lt")
        // .text(line1)
        .text("")
        .size(1, 1)
        .style("b")
        .text(order_data.business_info.name)
        .size(1, 1)
        .text(order_data.business_info.address)

        .size(1, 1);
    } else {
      printer_conn
        .align("ct")
        // .text(line1)
        .text("");
    }

    if (!order_data.online) {
      printer_conn;
      if (order_data.staff_name) {
        printer_conn.text(
          "Finalized by: " +
            order_data.staff_name +
            " (ID:" +
            order_data.staff_id +
            ")"
        );
      }

      if (
        order_data.hold_staff_id != undefined &&
        order_data.hold_staff_id != ""
      ) {
        printer_conn.text(
          "Open/Held by: " +
            order_data.hold_staff_name +
            " (ID: " +
            order_data.hold_staff_id +
            ")"
        );
      }
    }

    if (
      order_data.pos_station_name != undefined &&
      order_data.pos_station_name != ""
    ) {
      printer_conn.text("Station: " + order_data.pos_station_name);
    }

    printer_conn
      .size(1, 1)
      .text("Print date-time: " + date_time.date + " " + date_time.time);

    if (
      order_data.business_info &&
      template_styles[template_style - 1].bottom_business_name != undefined &&
      template_styles[template_style - 1].bottom_business_name == true
    ) {
      printer_conn
        .align("ct")
        .size(1, 1)
        .style("b")
        .text(order_data.business_info.name)
        .size(1, 1)
        .text(order_data.business_info.address);
    }

    if (order_data.receipt_footer) {
      printer_conn
        .text(line1)
        .align("ct")
        .size(1, 1)
        .text(order_data.receipt_footer);
    }

    printer_conn
      // .text(line1)
      .text("")

      .size(1, 1)

      .align("ct")
      .text("Powered by Pocket Systems, LLC.")
      .text("");

    setTimeout(function () {
      console.log("cutting check");

      printer_conn.cut().close();
    }, qr_print_timeout);
  }, logo_print_timeout);
}

function calculateBusinessDiscount(order_data) {
  var subtotal = 0;
  var BusinessDiscount = 0;
  order_data.order_info.forEach(function (order_info) {
    if (order_info.type != "gift_card") {
      subtotal += order_info.basePrice * order_info.quantity;
    }
  });
  BusinessDiscount = Number(
    (subtotal * Number(order_data.instructions.BusinessDiscount)) / 100
  ).toFixed(2);
  console.log(BusinessDiscount);
  return BusinessDiscount;
}

function printTipTemplate(printer_conn, subtotal = 0) {
  return;
  printer_conn.align("ct").size(1, 1).text("Add Gratuity").size(1, 1);
  if (subtotal != 0) {
    printer_conn
      .align("ct")
      .text(
        "18% (" +
          currency_symbol +
          (Number(subtotal.toFixed(2)) * 0.18).toFixed(2) +
          ")"
      )
      .text(
        "20% (" +
          currency_symbol +
          (Number(subtotal.toFixed(2)) * 0.2).toFixed(2) +
          ")"
      )
      .text(
        "25% (" +
          currency_symbol +
          (Number(subtotal.toFixed(2)) * 0.25).toFixed(2) +
          ")"
      )
      .text("")
      .text("Other:  " + currency_symbol + "____________")
      .text("")
      .text("")
      .text("Total:  " + currency_symbol + "____________")
      .text("")
      .text("")
      .text("Sign:  ____________________")
      .text("");
  }
}
