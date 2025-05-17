var line1 = "________________________________________________";
var line2 = "------------------------------------------------";
var line3 = "================================================";
var line4 = "- - - - - - - - - - - - - - - - - - - - - - - -";

const escpos = require("escpos");
const path = require("path");
const template_styles = require("../../config/template_styles.json");
const fs = require('fs')
const { formatDate, formatTime } = require("../../common/dateUtils");
const { generateCanvas, generatePosReceipt } = require("../../common");


module.exports = {
  counter_printer_template_1: function (
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
  var gift_card_amount = 0;

  var price_column_text = "";

  var show_bottom_delivery_info = true;

  var show_paid_status_on_check = true;
  var show_item_instructions_on_check = true;

  var logo_on_top = false;

  var logo_print_timeout = 10;

  var qr_print_timeout = 10;

  var show_split_section = false;

  var hold_id_qr_local = false;

  var show_qr_payment = false;

  var regular_tip_flag = true;

  var separate_tip_receipts = false;


  if (template_styles[template_style - 1].separate_tip_receipts != undefined) {
    separate_tip_receipts = template_styles[template_style - 1].separate_tip_receipts;
  }

  if (template_styles[template_style - 1].show_qr_payment != undefined) {
    show_qr_payment = template_styles[template_style - 1].show_qr_payment;
  }

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

  if (order_data.table_name !== undefined) {
    order_data.table_name = order_data.table_name.trim();
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

  if (order_data.reprint != undefined && order_data.reprint == true && order_data?.finalize !== true) {
    printer_conn.align("ct").size(2, 2).style("b").text("[DUPLICATE]").text("");
  }

  if (order_data?.finalize === true) {
    printer_conn.align("ct").size(2, 2).style("b").text("[FINALIZED]").text("");
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

    logo_print_timeout = 1000;
  }


  generateCanvas(order_data);
  generatePosReceipt(order_data)

  // order_data.business_info.name = 'American Restaurant LLC';

  setTimeout(async function () {




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

    // if (order_data.vendor_name != undefined && order_data.vendor_name != "") {
    //   printer_conn
    //     .align("ct")
    //     .size(2, 2)
    //     .style("b")
    //     .text("")
    //     .text(order_data.vendor_name)
    //     .text("");
    // }

    if (
      order_data.pos_receipt_number != undefined &&
      order_data.pos_receipt_number != ""
    ) {
      const image = await loadImageAsync(path.join(__dirname, "../../common/canvas/labels/pos-receipt-no.png"));
      printer_conn.align('ct').image(image)

      // printer_conn
      //   .align("ct")
      //   .size(2, 2)
      //   .style("b")
      //   .text("Chk " + order_data.pos_receipt_number);
    }

    printer_conn.font("a").align("ct").size(2, 2);

    if (
      order_data.instructions.giftcard &&
      order_data.instructions.giftcard != "undefined" &&
      order_data.instructions.giftcard.length > 0
    ) {
      gift_card_amount = 0;
      order_data.instructions.giftcard.forEach(function (giftcard) {
        gift_card_amount = gift_card_amount + Number(giftcard.amount);
      });
    } else if (
      order_data.instructions.giftcard &&
      order_data.instructions.giftcard != "undefined" &&
      Number(order_data.instructions.giftcard) > 0
    ) {
      var gift_card_amount = order_data.instructions.giftcard;
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


      var payment_method_main = 'cash';
      if (
        (order_data.type == "cash" || order_data.type == "Cash") &&
        order_data.online == true
      ) {
        temp_order_id_split = "NOT PAID";
      } else if (temp_order_id_split.length == 2) {
        if (order_data.type == "credit" && order_data.payment_type != "split") {
          temp_order_id_split = "Paid by Card";
          payment_method_main = 'card';
        } else {
          temp_order_id_split = "Paid by Cash";
        }
      } else {
        temp_order_id_split = "NOT PAID";
      }
      printer_conn.style('NORMAL');
      printer_conn.print('Order: ');

      // Print order ID in bold

      if (order_data.payment_info.order_id) {
        printer_conn.style('B');
        printer_conn.print('#' + order_data.payment_info.order_id);

      }



      // Reset style and print rest of the line
      printer_conn.style('B');
      printer_conn.println(' (' + temp_order_id_split + ')');
    }



    if (show_bottom_delivery_info == false) {
      if (order_data.customer_name) {
        printer_conn.text("Customer Name: " + order_data.customer_name);
      }

      if (order_data.customer_phone) {
        printer_conn.text("Customer Phone: " + order_data.customer_phone);
      }
    }

    if (order_data.payment_info.order_date) {

      printer_conn.style('NORMAL');
      printer_conn.print('Open Ticket Time: ');

      // Print order ID in bold

      printer_conn.style('B');
      printer_conn.print(formatDate(order_data.payment_info.order_date) + " " + formatTime(order_data.payment_info.order_time));
      printer_conn.text("")
    }
    if (gift_card_amount) {
      printer_conn.text("Gift Card: " + gift_card_amount);
    }
    if (order_data.instructions.Points) {
      printer_conn.text("Points Used: " + order_data.instructions.Points);
    }



    if (show_price_column == true) {
      price_column_text = "Price";
    } else {
      price_column_text = "-";
    }


    if (order_data?.instructions?.order_from == 'suite_manager') {
      order_data.instructions.business_pricing_type = 'single';
    }

    if (order_data?.instructions?.order_from == 'table_manager') {
      order_data.instructions.business_pricing_type = 'single';
    }
    // printer_conn.text('')
    printer_conn.text('')
    if (order_data?.order_info?.length) {

      // Print left text with large size
      printer_conn
        .size(2, 2)
        .style("b")
        .align("lt")
        .print(`${order_data?.order_info?.length} items         `)

      printer_conn
        .size(1, 1)
        .style("b")
        .align("lt")
        .println("CASH      CARD")

    }

    var tabs;
    var subtotal = 0;
    var nicotine_tax = 0;
    var discountTitle = "Discount";
    console.log(order_data.instructions.discount_name != undefined ,order_data.instructions.discount_name != "undefined",order_data.instructions.discount_name ,order_data.instructions.discount_name )
    if (
        order_data.instructions.discount_name != undefined &&
        order_data.instructions.discount_name != "undefined"
    ) {
        discountTitle = order_data.instructions.discount_name;
    }

    order_data.order_info.forEach(function (order_info) {
      if (order_info.menuItem != "???PRINT_LINE_1???") {

        if (order_info?.show_on_staff_accumulated_report == '1' && order_info?.performance_fee_enabled == '1') {
          order_data.instructions.order_from = 'suite_manager';
        }


        if (order_data.instructions.order_from == 'suite_manager' && order_info?.card_totalPrice && payment_method_main == 'card') {
          order_info.totalPrice = order_info?.card_totalPrice;
        }


        subtotal = subtotal + Number(order_info.totalPrice);
        if (order_info.additionalTax) {
          nicotine_tax += Number(order_info.additionalTax);
        }

        if (Number(order_info.basePrice) == 0) {
          order_info.basePrice = "--";
        } else {
          order_info.basePrice = "" + Number(order_info.basePrice).toFixed(2);
        }


        if (
          Number(order_info.card_totalPrice) == 0 ||
          order_info.card_totalPrice == undefined ||
          order_info.card_totalPrice == "NaN" ||
          order_info.card_totalPrice == ""
        ) {
          order_info.card_totalPrice = "--";
        } else {
          order_info.card_totalPrice =
            "" + Number(order_info.card_totalPrice).toFixed(2);
        }

        if (
          Number(order_info.totalPrice) == 0 ||
          order_info.totalPrice == undefined ||
          order_info.totalPrice == "NaN" ||
          order_info.totalPrice == ""
        ) {
          order_info.totalPrice = "--";
        } else {
          order_info.totalPrice = "" + Number(order_info.totalPrice).toFixed(2);
        }

        if (show_price_column == true) {
          price_column_text = order_info.basePrice;
        } else {
          price_column_text = "-";
        }

        if (order_data?.instructions?.business_pricing_type === "double") {

          printer_conn
            .style("r")
            .size(1, 1)
            .text(line1)
            .size(1, 2)
            .text("")
            .style("b")
            .tableCustom([
              {
                text: `${order_info?.quantity} X ${(order_info?.menuItem).trim()}`,
                align: "LEFT",
                width: "0.65",
              },
              { text: `${currency_symbol}${order_info?.totalPrice}`, width: 0.15, align: 'LEFT', width: 0.15 },
              {
                text: `${currency_symbol}${order_info?.card_totalPrice}`,
                align: "RIGHT",
                width: 0.15,
              },
            ])

        } else {
          printer_conn
            .size(1, 1)
            .style("r")
            .tableCustom([
              {
                text: (order_info?.menuItem).trim(),
                align: "LEFT",
                width: 0.60,
              },
              { text: order_info?.quantity, align: "CENTER", width: 0.10 },
              { text: order_info?.totalPrice, align: "RIGHT", width: 0.30 },
            ]);
        }

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
            if (order_data.extra_category_title_print) {
              printer_conn.tableCustom([
                {
                  text: "(" + extras.heading.trim() + ")",
                  align: "LEFT",
                  width: "0.40",
                },
                //{ text: "", align: "RIGHT", width: "0.05" },
                //{ text: "", align: "RIGHT", width: "0.25" },
                // { text: "", align: "RIGHT", width: "0.35" },
              ]);
            }

            if (extras.optionNameSelected == undefined) {
              extras.optionNameSelected = extras.options;
            }

            extras.optionNameSelected.forEach(function (options) {
              if (Number(options.total) == 0) {
                // options.total = '';
              } else {
                // total_price= Number(options.total).toFixed(2);
                // options.total = ' (' + Number(options.total).toFixed(2) + ')';
              }

              if (show_price_column == true) {
                price_column_text = options.total;
              } else {
                price_column_text = "-";
              }
              console.log(options.total != "" ,options.total >= 0,options.total,options.card_total)
              if (options.total !== "" && options.total >= 0) {
                options.total =
                  Number(options.total) * Number(order_info.quantity);
                options.total = "(" + handleUndefined(options.total) + " incl)";
              } else {
                options.total = 0;
              }

              if (
                options?.card_total !== "" &&
                options?.card_total >= 0 &&
                options?.card_total != undefined
              ) {
                options.card_total =
                  Number(options?.card_total) * Number(order_info?.quantity);
                options.card_total =
                  "(" + handleUndefined(options?.card_total) + " incl)";
              } else {
                options.card_total = 0;
              }

              if (
                order_data?.instructions?.business_pricing_type === "double"
              ) {


                printer_conn
                  .style("r")
                  .size(1, 1)
                  .tableCustom([
                    {
                      text: ` =>${order_info.quantity} X ${options.name.trim()}`,
                      align: "LEFT",
                      width: 0.48,
                    },
                    {text: options.total, align: "RIGHT", width: 0.25},
                    {text: options.card_total, align: "RIGHT", width: 0.25},

                  ]);
              } else {
                printer_conn
                  .style("r")
                  .size(1, 1)
                  .tableCustom([
                    {
                      text: ">" + options.name.trim(),
                      align: "LEFT",
                      width: 0.60,
                    },
                    { text: options?.quantity, align: "CENTER", width: 0.10 },
                    // { text: options?.total, align: "LEFT", width: 0.30 },
                    // { text: options?.card_total, align: "LEFT", width: 0.20 },
                  ]);
              }
            });
          });
        }
        if (
          order_info.itemInstructions != undefined &&
          order_info.itemInstructions != "" &&
          show_item_instructions_on_check == true
        ) {
          printer_conn
            .style("b")
            .text("Instructions " + order_info.itemInstructions);
        }
      } else {
        printer_conn.style("r").text(line2);
      }



      if (
        (Number(order_info?.inStockDiscount) > 0 ||
          Number(order_info?.card_inStockDiscount) > 0) &&
        order_data?.instructions?.business_pricing_type === "double"
      ) {

                printer_conn
          .size(1, 1)
          .tableCustom([
            { text:" "+discountTitle, align: "LEFT", width: 0.65 },
            { text: `${currency_symbol}${handleUndefined(
                order_info?.inStockDiscount
              )}`, width: 0.15 },
            {
              text: `${currency_symbol}${handleUndefined(order_info?.card_inStockDiscount)}`,
              align: "RIGHT",
              width: 0.15,

            },
          ]);
       } else if (Number(order_info?.card_inStockDiscount) > 0) {
        printer_conn
          .style("b")
          .size(1, 1)
          .tableCustom([
            { text: " Discount", align: "LEFT", width: 0.6 },
            { text: "", align: "RIGHT", width: 0.15 },
            // {text: '', align: "RIGHT", width: "0.25"},
            {
              text: handleUndefined(order_info?.card_inStockDiscount),
              align: "RIGHT",
              width: 0.2,
            },
          ]);
      }

      if (
        (Number(order_info?.calculated_discount) > 0 ||
          Number(order_info?.card_CalculatedDiscount) > 0) &&
        order_data?.instructions?.business_pricing_type === "double"
      ) {

              printer_conn
        .size(1, 1)
        .style("r")
        .tableCustom([
          { text: " Discount", align: "LEFT", width: 0.65 },
          { text: `${currency_symbol}${handleUndefined(
                order_info?.calculated_discount ||
                order_info?.CalculatedDiscount
              )}`, align: 'LEFT', width: 0.15 },
          {
            text: `${currency_symbol}${handleUndefined(order_info?.card_CalculatedDiscount)}`,
            align: "RIGHT",
            width: 0.15
          }
        ]);

      } else if (Number(order_info?.card_CalculatedDiscount) > 0) {
        printer_conn
          .style("b")
          .size(1, 1)
          .tableCustom([
            { text: " Discount", align: "LEFT", width: 0.30 },
            {
              text: handleUndefined(order_info?.card_CalculatedDiscount),
              align: "LEFT",
              width: 0.2,
            },
          ]);
      }

      if (
        (Number(order_info?.additionalTax) > 0 ||
          Number(order_info?.card_additionalTax) > 0) &&
        order_data?.instructions?.business_pricing_type === "double"
      ) {
        printer_conn
          .style("b")
          .size(1, 1)
          .tableCustom([
            {
              text: ` ${order_info?.additional_tax[0]?.tax_title != undefined
                ? order_info?.additional_tax[0]?.tax_title
                : "Other Tax"
                }`,
              align: "LEFT",
              width: "0.45",
            },
            /* {
               text: "",
               align: "LEFT",
               width: "0.10",
             },*/
            {
              text: `${handleUndefined(
                order_info?.additionalTax
              )} | ${handleUndefined(order_info?.card_additionalTax)}`,
              align: "CENTER",
              width: "0.55",
            },
          ]);
        // printer_conn
        // .text(line2)
      } else if (
        Number(order_info?.additionalTax) > 0 ||
        Number(order_info?.card_additionalTax) > 0
      ) {
        printer_conn
          .style("b")
          .size(1, 1)
          .tableCustom([
            {
              text: `  ${order_info?.additional_tax[0]?.tax_title != undefined
                ? order_info?.additional_tax[0]?.tax_title
                : "Other Tax"
                }`,
              align: "LEFT",
              width: 0.6,
            },
            { text: "", align: "RIGHT", width: 0.15 },
            {
              text: handleUndefined(order_info?.card_additionalTax),
              align: "RIGHT",
              width: 0.2,
            },
          ]);
      }
    });

    printer_conn
      .size(1, 1)
      .text(line1)

    if (order_data?.instructions?.business_pricing_type === "double") {
      printer_conn
        .size(1, 1)
        .text("")
        .style("b")
        .tableCustom([
          { text: "Subtotal    ", align: "RIGHT", width: 0.65 },
          { text: `${currency_symbol}${handleUndefined(order_data?.instructions?.subTotal)}`, align: 'LEFT', width: 0.15 },
          {
            text: `${currency_symbol}${handleUndefined(order_data?.instructions?.card_subTotal)}`,
            align: "RIGHT",
            width: 0.15
          }
        ]);
    } else {

      if (order_data.instructions.order_from == 'suite_manager' && order_data?.instructions?.card_subTotal && payment_method_main == 'card') {
        order_data.instructions.subTotal = order_data?.instructions?.card_subTotal;
      }

      printer_conn
        .size(1, 1)
        .style("r")
        .text("")
        .style("b")
        .tableCustom([
          { text: "Sub Total", align: "LEFT", width: 0.6 },
          { text: "", align: "RIGHT", width: 0.15 },
          {
            text: handleUndefined(order_data?.instructions?.subTotal),
            align: "RIGHT",
            width: 0.2,
          },
        ]);
    }

    // printer_conn
    //     .text('')
    //     .align('rt')
    //     .text('Sub Total: ' + Number(subtotal).toFixed(2))
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
      Number(order_data.payment_info.discount) > 0 &&
      order_data?.instructions?.business_pricing_type === "double"
    ) {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Discount:", align: "LEFT", width: "0.40" },
          {
            text: '   ',
            align: "CENTER",
            width: "0.10",
          },
          {
            text: handleUndefined(order_data.payment_info.discount) + ' | ' + handleUndefined(order_data.payment_info.discount),
            align: "CENTER",
            width: "0.50",
          },
        ]);
    } else if (
      order_data.payment_info.discount != "" &&
      order_data.payment_info.discount != undefined &&
      Number(order_data.payment_info.discount) > 0
    ) {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Discount:", align: "LEFT", width: 0.6 },
          { text: "", align: "RIGHT", width: 0.15 },
          {
            text: handleUndefined(order_data.payment_info.discount),
            align: "RIGHT",
            width: 0.2,
          },
        ]);
    }

    if (
      order_data.instructions.global_discount &&
      order_data.instructions.global_discount != "0.00" &&
      order_data.instructions.global_discount != "0"
    ) {
    
      
      if (order_data?.instructions?.business_pricing_type === "double") {
        printer_conn
          .size(1, 1)
          .style("r")
          .style("b")
          .tableCustom([
            { text: discountTitle+"    ", align: "RIGHT", width: 0.65 },
            {  
              text: `-${currency_symbol}${handleUndefined(order_data?.instructions?.global_discount)}`,
              align: "LEFT",
              width: 0.15,
            },

            {
              text:`-${currency_symbol}${handleUndefined(order_data?.instructions?.card_global_discount)}`,
              align: "RIGHT",
              width: 0.15,
            },
          ]);
      } else {
        printer_conn
          .size(1, 1)
          .style("r")
          .style("b")
          .tableCustom([
            { text: discountTitle + ":", align: "LEFT", width: 0.6 },
            { text: "", align: "RIGHT", width: 0.15 },
            {
              text:
                "-" +
                handleUndefined(order_data?.instructions?.card_global_discount),
              align: "RIGHT",
              width: 0.2,
            },
          ]);
      }
    }

    if (
      (parseFloat(order_data.instructions.item_discount) > 0 ||
        parseFloat(order_data.instructions.card_item_discount) > 0) &&
      order_data?.instructions?.business_pricing_type === "double"
    ) {
      printer_conn
        .size(1, 1)
        .style("b")
        .tableCustom([
          { text: "Item Discount    ", align: "RIGHT", width: 0.65 },
          { text: `-${currency_symbol}${handleUndefined(order_data?.instructions?.item_discount || order_data?.instructions?.calculatedDiscount)}`, align: 'LEFT', width: 0.15 },
          {
            text: `-${currency_symbol}${handleUndefined(order_data?.instructions?.card_item_discount)}`,
            align: "RIGHT",
            width: 0.15
          }
        ]);

    } else if (parseFloat(order_data.instructions.card_item_discount) > 0) {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Item Discount:", align: "LEFT", width: 0.6 },
          { text: "", align: "RIGHT", width: 0.15 },
          {
            text:
              "-" +
              handleUndefined(order_data?.instructions?.card_item_discount),
            align: "RIGHT",
            width: 0.2,
          },
        ]);
    }

    // if (
    //   order_data.instructions.calculatedDiscount &&
    //   order_data.instructions.calculatedDiscount != "" &&
    //   order_data.instructions.calculatedDiscount != "0.00" &&
    //   order_data.instructions.calculatedDiscount != 0 &&
    //   order_data.instructions.calculatedDiscount != "0" &&
    //   order_data?.instructions?.business_pricing_type === "double"
    // ) {
    //   printer_conn
    //     .size(1, 1)
    //     .style("b")
    //     .tableCustom([
    //       { text: "Cart Discount    ", align: "RIGHT", width: 0.65 },
    //       {
    //         text: `-${currency_symbol}${handleUndefined(order_data?.instructions?.calculatedDiscount)}`,
    //         align: "LEFT",
    //         width: 0.15,
    //       },
    //       {
    //         text:  `-${currency_symbol}${handleUndefined(order_data?.instructions?.card_calculatedDiscount)}`,
    //         align: "RIGHT",
    //         width: 0.15,
    //       },
    //     ]);
    // } else if (
    //   order_data.instructions.calculatedDiscount &&
    //   order_data.instructions.calculatedDiscount != "" &&
    //   order_data.instructions.calculatedDiscount != "0.00" &&
    //   order_data.instructions.calculatedDiscount != 0 &&
    //   order_data.instructions.calculatedDiscount != "0"
    // ) {
    //   printer_conn
    //     .size(1, 1)
    //     .style("r")
    //     .style("b")
    //     .tableCustom([
    //       { text: "Cart Discount:", align: "LEFT", width: 0.6 },
    //       { text: "", align: "RIGHT", width: 0.15 },
    //       {
    //         text:
    //           "-" +
    //           handleUndefined(
    //             order_data?.instructions?.card_calculatedDiscount
    //           ),
    //         align: "RIGHT",
    //         width: 0.2,
    //       },
    //     ]);
    // }

    if (
      order_data.instructions.Type == "Delivery" &&
      order_data.instructions.delivery_fee &&
      order_data?.instructions?.business_pricing_type === "double"
    ) {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Delivery Fee:", align: "LEFT", width: "0.40" },
          // { text: "", align: "RIGHT", width: "0.05" },
          // {text: "", align: "RIGHT", width: "0.25"},
          /*  {
              text: "" + handleUndefined(order_data.instructions.delivery_fee),
              align: "RIGHT",
              width: "0.25",
            },*/
          {
            text: '   ',
            align: "CENTER",
            width: "0.10",
          },
          {
            text: handleUndefined(order_data.instructions.delivery_fee) + ' | ' +
              + handleUndefined(order_data.instructions.card_delivery_fee),
            align: "CENTER",
            width: "0.50",
          },
        ]);
    } else if (
      order_data.instructions.Type == "Delivery" &&
      order_data.instructions.delivery_fee
    ) {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Delivery Fee:", align: "LEFT", width: 0.6 },
          { text: "", align: "RIGHT", width: 0.15 },
          {
            text:
              " " + handleUndefined(order_data.instructions.card_delivery_fee),
            align: "RIGHT",
            width: 0.2,
          },
        ]);
    }

    if (order_data?.instructions?.venue_fee) {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Venue Fee", align: "LEFT", width: 0.6 },
          { text: "", align: "RIGHT", width: 0.15 },
          {
            text: handleUndefined(order_data.instructions.venue_fee),
            align: "RIGHT",
            width: 0.2,
          },
        ]);
    }

    if (
      (Number(order_data?.instructions?.serviceCharge) > 0 ||
        Number(order_data?.instructions?.card_serviceCharge) > 0) &&
      order_data?.instructions?.business_pricing_type === "double" && (!order_data.instructions?.order_from && order_data.instructions?.order_from != 'suite_manager')
    ) {



      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Service Charge: ", align: "LEFT", width: "0.40" },
          //  { text: "", align: "RIGHT", width: "0.05" },
          /*{
            text: handleUndefined(order_data.instructions.serviceCharge),
            align: "RIGHT",
            width: "0.25",
          },*/
          {
            text: '   ',
            align: "CENTER",
            width: "0.10",
          },
          {
            text: handleUndefined(order_data.instructions.serviceCharge) + ' | ' + handleUndefined(order_data?.instructions?.card_serviceCharge),
            align: "CENTER",
            width: "0.50",
          },
        ]);

      // printer_conn
      //     .text('Service Chg: ' + Number(order_data.instructions.serviceCharge).toFixed(2))
    } else if (
      Number(order_data?.instructions?.serviceCharge) > 0 ||
      Number(order_data?.instructions?.card_serviceCharge) > 0 && (!order_data.instructions?.order_from && order_data.instructions?.order_from != 'suite_manager')
    ) {

      if (order_data.instructions.order_from == 'suite_manager' && order_data?.instructions?.card_serviceCharge && payment_method_main == 'card') {
        order_data.instructions.serviceCharge = order_data?.instructions?.card_serviceCharge;
      }

      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Service Charge", align: "LEFT", width: 0.6 },
          { text: "", align: "RIGHT", width: 0.15 },
          {
            text: handleUndefined(order_data?.instructions?.serviceCharge),
            align: "RIGHT",
            width: 0.2,
          },
        ]);
    }


    if (
      Number(nicotine_tax) > 0 &&
      order_data?.instructions?.business_pricing_type === "double"
    ) {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Other Tax:", align: "LEFT", width: "0.40" },
          //  { text: "", align: "RIGHT", width: "0.05" },
          // {text: "", align: "RIGHT", width: "0.25"},
          /* {
             text: handleUndefined(nicotine_tax),
             align: "RIGHT",
             width: "0.25",
           },*/
          {
            text: '   ',
            align: "CENTER",
            width: "0.10",
          },
          {
            text: handleUndefined(nicotine_tax) + ' | ' + handleUndefined(order_data.instructions.card_additionalTax),
            align: "CENTER",
            width: "0.50",
          },
        ]);
    } else if (Number(nicotine_tax) > 0) {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Other Tax:", align: "LEFT", width: 0.6 },
          { text: "", align: "RIGHT", width: 0.15 },
          {
            text: handleUndefined(order_data.instructions.card_additionalTax),
            align: "RIGHT",
            width: 0.2,
          },
        ]);
    }

    if (order_data.instructions.discount_value_customized) {
      printer_conn.text(
        order_data.instructions.discount_value_customized_text +
        ": " +
        Number(order_data.instructions.discount_value_customized).toFixed(2)
      );
    }

    if (order_data.payment_info.tax == undefined) {
      if (order_data?.instructions?.business_pricing_type === "double") {
        printer_conn
          .size(1, 1)
          .style("r")
          .style("b")
          .tableCustom([
            { text: "Sales Tax:", align: "LEFT", width: "0.40" },
            //  { text: "", align: "RIGHT", width: "0.05" },
            // {text: "", align: "RIGHT", width: "0.25"},
            /* {
               text: handleUndefined(nicotine_tax),
               align: "RIGHT",
               width: "0.25",
             },*/
            {
              text: '   ',
              align: "CENTER",
              width: "0.10",
            },
            {
              text: handleUndefined(order_data.instructions.tax) + ' | ' + handleUndefined(order_data.instructions.card_tax),
              align: "CENTER",
              width: "0.50",
            },
          ]);

      } else {
        printer_conn
          .size(1, 1)
          .style("r")
          .style("b")
          .tableCustom([
            { text: "Sales Tax", align: "LEFT", width: 0.6 },
            { text: "", align: "RIGHT", width: 0.15 },
            { text: handleUndefined(order_data?.instructions?.tax), align: "RIGHT", width: 0.2 },
          ]);
      }
    } else {
      if (order_data?.instructions?.business_pricing_type === "double") {
        printer_conn
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "Tax    ", align: "RIGHT", width: 0.65 },
            { text: `${currency_symbol}${handleUndefined(order_data.instructions.tax)}`, width: 0.15 },
            {
              text: `${currency_symbol}${handleUndefined(order_data.instructions.card_tax)}`,
              align: "RIGHT",
              width: 0.15,

            },
          ]);
      } else {
        printer_conn
          .size(1, 1)
          .style("r")
          .style("b")
          .tableCustom([
            { text: "Sales Tax", align: "LEFT", width: 0.6 },
            { text: "", align: "RIGHT", width: 0.15 },
            {
              text: handleUndefined(order_data.instructions.tax),
              align: "RIGHT",
              width: 0.2,
            },
          ]);
      }
    }

    if (
      gift_card_amount &&
      order_data?.instructions?.business_pricing_type === "double"
    ) {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Giftcard: ", align: "LEFT", width: "0.40" },
          // { text: "", align: "RIGHT", width: "0.05" },
          // {text: "", align: "RIGHT", width: "0.05"},
          /*  {
              text: "-" + handleUndefined(gift_card_amount),
              align: "RIGHT",
              width: "0.25",
            },*/
          {
            text: '   ',
            align: "CENTER",
            width: "0.10",
          },
          {
            text: "-" + handleUndefined(gift_card_amount) + ' | ' + "-" + handleUndefined(gift_card_amount),
            align: "CENTER",
            width: "0.50",
          },
        ]);
    } else if (gift_card_amount) {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Giftcard: ", align: "LEFT", width: 0.6 },
          { text: "", align: "RIGHT", width: 0.15 },
          {
            text: "-" + handleUndefined(gift_card_amount),
            align: "RIGHT",
            width: 0.2,
          },
        ]);
    }




    if (
      (order_data.instructions?.auto_gratuity_amount) &&
      order_data?.instructions?.business_pricing_type === "double" && order_data?.instructions?.auto_gratuity_amount
    ) {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Service Fee:", align: "LEFT", width: "0.40" },
          //  { text: "", align: "RIGHT", width: "0.05" },
          // {text: "", align: "RIGHT", width: "0.05"},
          /* {
             text: handleUndefined(order_data.instructions.Tip),
             align: "RIGHT",
             width: "0.25",
           },*/
          {
            text: '   ',
            align: "CENTER",
            width: "0.10",
          },
          {
            text: '0.00 | ' + handleUndefined(order_data.instructions.auto_gratuity_amount),
            align: "CENTER",
            width: "0.50",
          },
        ]);

      // printer_conn
      //     .text('Gratuity: ' + Number(order_data.instructions.Tip).toFixed(2))
    }
    else if (order_data?.instructions?.auto_gratuity_amount) {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Service Fee", align: "LEFT", width: 0.6 },
          { text: "", align: "RIGHT", width: 0.15 },
          {
            text: handleUndefined(order_data.instructions.auto_gratuity_amount),
            align: "RIGHT",
            width: 0.2,
          },
        ]);
    }


    if (
      (order_data.instructions.Tip || order_data.instructions.card_Tip) &&
      order_data?.instructions?.business_pricing_type === "double"
    ) {

      if (
        (order_data.instructions?.technology_refund_amount && order_data.instructions?.card_Tip)
      ) {

        order_data.instructions.card_Tip = Number(order_data.instructions.card_Tip) + Number(order_data.instructions?.technology_refund_amount);

      }
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Gratuity:", align: "LEFT", width: "0.40" },
          //  { text: "", align: "RIGHT", width: "0.05" },
          // {text: "", align: "RIGHT", width: "0.05"},
          /* {
             text: handleUndefined(order_data.instructions.Tip),
             align: "RIGHT",
             width: "0.25",
           },*/
          {
            text: '   ',
            align: "CENTER",
            width: "0.10",
          },
          {
            text: handleUndefined(order_data.instructions.Tip) + ' | ' + handleUndefined(order_data.instructions.card_Tip),
            align: "CENTER",
            width: "0.50",
          },
        ]);

      // printer_conn
      //     .text('Gratuity: ' + Number(order_data.instructions.Tip).toFixed(2))
    } else if (
      order_data.instructions.Tip
    ) {

      let addL_text = '';

      if (order_data?.instructions?.order_from == 'table_manager') {
        addL_text = 'Additional ';
      }

      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: addL_text + "Gratuity", align: "LEFT", width: 0.6 },
          { text: "", align: "RIGHT", width: 0.15 },
          {
            text: handleUndefined(order_data.instructions.Tip),
            align: "RIGHT",
            width: 0.2,
          },
        ]);
    }


    if (
      (order_data.instructions.technology_liability) &&
      order_data?.instructions?.business_pricing_type === "double"
    ) {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Tech. Liability", align: "LEFT", width: "0.40" },
          //  { text: "", align: "RIGHT", width: "0.05" },
          // {text: "", align: "RIGHT", width: "0.05"},
          /* {
             text: handleUndefined(order_data.instructions.Tip),
             align: "RIGHT",
             width: "0.25",
           },*/
          {
            text: '   ',
            align: "CENTER",
            width: "0.10",
          },
          {
            text: handleUndefined(0) + ' | ' + handleUndefined(order_data.instructions.technology_liability),
            align: "CENTER",
            width: "0.50",
          },
        ]);

      // printer_conn
      //     .text('Gratuity: ' + Number(order_data.instructions.Tip).toFixed(2))
    }

    // if (
    //   (order_data.instructions.technology_refund_amount) &&
    //   order_data?.instructions?.business_pricing_type === "double"
    // ) {
    //   printer_conn
    //     .size(1, 1)
    //     .style("r")
    //     .style("b")
    //     .tableCustom([
    //       { text: "Tech. Refund:", align: "LEFT", width: "0.40" },

    //       {
    //         text: '   ',
    //         align: "CENTER",
    //         width: "0.10",
    //       },
    //       {
    //         text: handleUndefined(0) +' | '+ handleUndefined(order_data.instructions.technology_refund_amount),
    //         align: "CENTER",
    //         width: "0.50",
    //       },
    //     ]);

    // }

    if (order_data.instructions.platformFeeAmount) {
      printer_conn.tableCustom([
        { text: "Platform Fee: ", align: "LEFT", width: 0.6 },
        { text: "", align: "RIGHT", width: 0.15 },
        {
          text: handleUndefined(order_data.instructions.platformFeeAmount),
          align: "RIGHT",
          width: 0.2,
        },
      ]);
    }

    // if (order_data.instructions.cash_discount) {
    //     printer_conn

    //         .text('DualPriceAdj: ' + Number(order_data.instructions.cash_discount).toFixed(2))
    // }



    printer_conn.size(1, 1).text(line1);

    if (order_data.refund) {
      if (order_data?.instructions?.business_pricing_type === "double") {
        printer_conn
          .size(1, 1)
          .style("r")
          .style("b")
          .tableCustom([
            { text: "Total:", align: "LEFT", width: "0.45" },
            //{ text: "", align: "RIGHT", width: "0.05" },
            /* {
               text: "-" + currency_symbol + handleUndefined(order_data.total),
               align: "RIGHT",
               width: "0.25",
             },*/
            { text: "", align: "RIGHT", width: "0.25" },
          ]);
      } else {
        printer_conn
          .size(1, 1)
          .style("r")
          .style("b")
          .tableCustom([
            { text: "Total: ", align: "LEFT", width: 0.6 },
            { text: "", align: "RIGHT", width: 0.15 },
            {
              text: "-" + currency_symbol + handleUndefined(order_data.total),
              align: "RIGHT",
              width: 0.2,
            },
          ]);
      }

      // printer_conn
      //     .text( + )
    } else {
      if (order_data?.instructions?.business_pricing_type === "double") {
        printer_conn.adapter.write(Buffer.from([0x1B, 0x45, 0x01]));

        printer_conn
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "Total    ", align: "RIGHT", width: "0.65", style: null },
            {
              text: currency_symbol +
                handleUndefined(order_data.instructions.cash_Total), align: 'LEFT', width: 0.15, style: "B"
            },
            {
              text: currency_symbol + handleUndefined(order_data.instructions.card_Total),
              align: "RIGHT",
              width: 0.15,
              style: "B"
            },
          ]);
      } else {
        printer_conn
          .size(1, 1)
          .style("r")
          .style("b")
          .tableCustom([
            { text: "Total", align: "LEFT", width: 0.6 },
            { text: "", align: "RIGHT", width: 0.15 },
            {
              text:
                currency_symbol +
                handleUndefined(order_data.total),
              align: "RIGHT",
              width: 0.2,
            },
          ]);
      }
    }

    //console.log("cutting check");

    // printer_conn.cut().close();

    // return;

    printer_conn.size(1, 1);

    // if (order_data.given_value) {

    //     printer_conn
    //     .size(1, 1)
    //     .style('r')
    //     .style('b')
    //     .tableCustom(
    //         [
    //             {text: 'Amount Given: ', align: "LEFT", width: "0.40"},
    //             {text: "", align: "RIGHT", width: "0.05"},
    //             {text: "", align: "RIGHT", width: "0.05"},
    //             {text: currency_symbol + Number(order_data.given_value).toFixed(2), align: "RIGHT", width: "0.25"},
    //             {text: "", align: "RIGHT", width: "0.15"}
    //         ]
    //     )
    //     // printer_conn
    //     //     .size(1, 1)
    //     //     .text('Amount Given: ' + )

    // }

    if (
      order_data.balance &&
      order_data.type == "cash" &&
      order_data?.instructions?.business_pricing_type === "double"
    ) {
      printer_conn
        .style("b")
        .tableCustom([
          { text: "Change Due    ", align: "RIGHT", width: "0.65" },
          {
            text: currency_symbol + handleUndefined(order_data.balance),
            align: "LEFT",
            width: "0.30",
          },
        ]);

    } else if (order_data.balance && order_data.type == "cash") {
      printer_conn
        .size(1, 1)
        .style("r")
        .style("b")
        .tableCustom([
          { text: "Change Due: ", align: "LEFT", width: 0.6 },
          { text: "", align: "RIGHT", width: 0.15 },
          {
            text: currency_symbol + handleUndefined(order_data.balance),
            align: "RIGHT",
            width: 0.2,
          },
        ]);
    }

    var paid_status_and_type = "";

    if (
      (order_data.type == "credit" && order_data.payment_type != "split") ||
      order_data.payment_type == "cash"
    ) {

      paid_status_and_type += temp_order_id_split;
    } else {
      paid_status_and_type += `${temp_order_id_split}`;
    }

    if (order_data.type == "credit" && order_data.payment_type != "split") {
      paid_status_and_type = "Original Amount Paid by Card";
    }

    printer_conn.align("CT").style("b").text("").text(paid_status_and_type);

    if (order_data.given_value) {
      printer_conn
        .text(currency_symbol + handleUndefined(order_data.given_value))
        .text("");
    }

    if (
      order_data.cc_amounts != undefined &&
      (order_data.receipt == "check" || order_data.receipt == "check_no_tip") &&
      show_cash_cc_amounts
    ) {
      // printer_conn
      // // .text(line2)
      // .text('')
      // .size(1, 1)
      //                 .style('b')
      //                     .tableCustom(
      //                         [
      //                             {text: 'Cash Amount', align: "CENTER", width: "0.50"},
      //                             {text: 'PAY BY CARD', align: "CENTER", width: "0.50"}
      //                         ]
      //                     )

      //     printer_conn
      // .size(1, 1)
      // .style('b')
      //     .tableCustom(
      //         [
      //             {text: currency_symbol + Number(order_data.total).toFixed(2), align: "CENTER", width: "0.50"},
      //             {text: currency_symbol + Number(order_data.cc_amounts.total).toFixed(2), align: "CENTER", width: "0.50"}
      //         ]
      //     )

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

      printer_conn.align("ct").size(1, 1).text(order_data.cc_amounts.message);
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
        .align("CT")

        // .text(line2)
        .text("")
        .text("For split payment");

      printer_conn
        .align("CT")
        .size(1, 1)
        .text(
          "Paid by Cash: " + handleUndefined(order_data.cc_amounts.cash_amount)
        );

      printer_conn
        .align("CT")
        .text(
          "Paid by Card: " +
          handleUndefined(order_data.cc_amounts.credit_amount)
        )
        .text("s");

      // if (order_data.instructions.cash_discount) {
      //     printer_conn
      //         .text('DualPriceAdj: ' + Number(order_data.instructions.cash_discount).toFixed(2))
      // }
    }

    if (show_split_section === true) {
      var total_for_split = handleUndefined(order_data.total);

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

    if (show_qr_payment === true) {
      if (
        order_data.instructions.qr !== undefined &&
        order_data.instructions.qr != ""
      ) {
        qr_print_timeout = 10;
        printer_conn.qrimage(order_data.instructions.qr, function (err) {
          console.log("QR Payment URL:", order_data.instructions.qr, err);
          printer_conn.text("\n");
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
      order_data.receipt != "check_no_tip" && regular_tip_flag === true && order_data?.finalize !== true
    ) {
      if (separate_tip_receipts === false) {


        printTipTemplate(
          printer_conn,
          Number(subtotal),
          order_data.instructions.tipPercentageBtn,
          order_data?.instructions.tipCashBtn
        );
      }
    }

    if (order_data.giftcard !== undefined && order_data.giftcard.length > 0) {
      giftCardTemplate(printer_conn, order_data);
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
        .text(fire_line + "" + order_data.table_name);
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
        template_styles[template_style - 1].payment_express_tip == true && order_data?.finalize !== true
      ) {

        if (separate_tip_receipts === false) {


          printTipTemplate(printer_conn, Number(subtotal));

        }
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

      const image = await loadImageAsync(path.join(__dirname, "../../common/canvas/labels/orderTypes-canvas.png"));
      printer_conn.align('ct').image(image)

      // if (order_data.instructions.orderTypeLabel) {
      //   // printer_conn
      //   //   .size(2, 2)
      //   //   .text(order_data.instructions.orderTypeLabel.toUpperCase())
      //   //   .marginBottom(2)
      //   //   .size(1, 1);
      // } else {
      //     const image = await loadImageAsync(path.join(__dirname, "../../common/canvas/labels/orderTypes-design.png"));
      //     printer_conn.align('ct').image(image)
      //   // printer_conn
      //   //   .size(2, 2)
      //   //   .text(order_data.instructions.Type)
      //   //   .marginBottom(2)
      //   //   .size(1, 1);
      // }

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

        if (order_data.instructions.date_of_event) {
          printer_conn
            .size(1, 2)
            .style("b")
            .align("ct")
            .text(order_data.instructions.date_of_event);
        }
      }

      printer_conn.size(1, 1);
      // if (order_data.customer_name) {
      //   printer_conn.text(order_data.customer_name);
      // }

      if (order_data.customer_phone) {
        printer_conn.text(order_data.customer_phone);
      }
    }

    if (order_data.reprint != undefined && order_data.reprint == true && order_data?.finalize !== true) {
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

      // if (order_data.staff_name) {
      //   printer_conn.text(
      //     "Assigned to: " +
      //     order_data.staff_name +
      //     " (ID:" +
      //     order_data.staff_id +
      //     ")"
      //   );
      //   printer_conn
      //     .size(1, 1)
      //     .text(date_time.date + " " + date_time.time);
      // }

      // if (order_data.staff_name) {
      //   printer_conn.text(
      //     "Printed by: " +
      //     order_data.staff_name +
      //     " (ID:" +
      //     order_data.staff_id +
      //     ")"
      //   );
      //   printer_conn
      //     .size(1, 1)
      //     .text(date_time.date + " " + date_time.time);
      // }

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
      .text("Ticket Closed date-time: " + date_time.date + " " + date_time.time);

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




    if (separate_tip_receipts === true && order_data.receipt != "check_no_tip" && regular_tip_flag === true && order_data?.finalize !== true) {

      printer_conn.cut();

      printTipTemplateMerchantCustomer(printer_conn,
        Number(subtotal),
        order_data.instructions.tipPercentageBtn,
        order_data?.instructions.tipCashBtn,
        order_data
      );



    }

    setTimeout(function () {
      console.log("cutting check");

      if (separate_tip_receipts === true && order_data.receipt != "check_no_tip" && regular_tip_flag === true && order_data?.finalize !== true) {
        // nothing to go here...
      } else {
        printer_conn.cut();
      }

      printer_conn.close();
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
  return BusinessDiscount;
}

function printTipTemplate(printer_conn, subtotal = 0, tipPercentage, tipCash) {
  printer_conn.align("ct").size(1, 1).text("Add Gratuity").size(1, 1);
  if (subtotal != 0) {
    printer_conn.align("ct");

    if (tipPercentage?.length > 0 && tipCash?.length > 0) {
      tipPercentage.forEach((percentage, index) => {
        printer_conn.text(
          `${percentage}% (` +
          currency_symbol +
          (Number(subtotal.toFixed(2)) * (percentage / 100)).toFixed(2) +
          ")"
        );
      });
    } else {
      printer_conn
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
        );
    }

    printer_conn
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

function giftCardTemplate(printer_conn, order_data) {
  printer_conn
    .size(1, 1)
    .style("b")
    .align("ct")
    // .text("Mikronexus Sandbox Demo")
    // .text("8 frankie lane north bablyon NE, USA")
    // .text("Phone: 6316124834")

    .text("GIFTCARD STATS");

  // printer_conn.font('a')
  // .align('ct')
  // .style('bu')
  // .size(1, 1)
  // .text('Giftcard Code: ' + order_data.giftcard.giftCardQr)

  // .tableCustom(
  //   [
  //     { text: "Code", align:"LEFT", width:0.45,},
  //     { text: print_data.cardData.giftCardQr, align:"RIGHT", width:0.45 }
  //   ],
  // )

  // .tableCustom(
  //     [
  //       { text: "Balance", align:"LEFT", width:0.45,},
  //       { text: print_data.cardData.remaing_amount, align:"RIGHT", width:0.45 }
  //     ],
  //   )

  //   .text('')
  //   .text('History')
  printer_conn
    .size(1, 1)
    .table(["------------------------------------------------"])
    .style("b")
    .tableCustom([
      { text: "Giftcard", align: "LEFT", width: 0.45 },
      { text: "Amount", align: "RIGHT", width: 0.45 },

      // { text: "image", align:"RIGHT", width:0.20 },
    ]);
  printer_conn.size(1, 1);

  for (var i = 0; i < order_data.giftcard.length; i++) {
    printer_conn.tableCustom([
      {
        text:
          order_data.giftcard[i].category_name !== null
            ? order_data.giftcard[i].category_name
            : order_data.giftcard[i].giftcard_qr,
        align: "LEFT",
        width: 0.45,
      },
      { text: order_data.giftcard[i].amount, align: "RIGHT", width: 0.45 },
      // { text: '', align:"RIGHT", width:0.20 }
    ]);
  }
}

function handleUndefined(value) {
  if (value == undefined || value == NaN || value === "" || value == "NaN") {
    return "--";
  } else {
    // const formatted = Number(value).toFixed(2);

    if (value.length == 1) {
      return ` ${Number(value).toFixed(2)}`; // Add a single space for single-digit values
    }
    return Number(value).toFixed(2);
  }
}

function generateSpace() { }


function printTipTemplateMerchantCustomer(printer_conn, subtotal = 0, tipPercentage, tipCash, order_data) {

  var receipt_type = ["MERCHANT COPY", "CUSTOMER COPY"];

  receipt_type.forEach(function (rcpt_type) {

    printer_conn.text("");
    if (order_data.reprint != undefined && order_data.reprint == true && order_data?.finalize !== true) {
      printer_conn.align("ct").size(1, 1).text("[DUPLICATE]").text("");
    }
    printer_conn.align("ct").size(1, 1).text(rcpt_type).size(1, 1);
    printer_conn.text("");

    printer_conn.align("ct").size(2, 2).text('Chk ' + order_data.pos_receipt_number).text("");



    printer_conn
      .size(1, 1)
      .tableCustom([
        { text: "Order ID", align: "RIGHT", width: "0.40" },
        { text: '', align: "CENTER", width: "0.20" },
        { text: order_data.payment_info.order_id, align: "LEFT", width: "0.40" },
      ])

      .tableCustom([
        { text: "Amount", align: "RIGHT", width: "0.40" },
        { text: '', align: "CENTER", width: "0.20" },
        { text: '$' + handleUndefined(order_data.total), align: "LEFT", width: "0.40" },
      ])


    printer_conn.text("");

    printer_conn.align("ct");

    if (order_data?.instructions?.order_from == 'suite_manager') {
      printer_conn.text("Gratuity");
    }
    else {
      printer_conn.text("Gratuity");
    }


    printer_conn.text("");


    if (subtotal != 0) {
      printer_conn.align("ct");

      // if (tipPercentage?.length > 0 && tipCash?.length > 0 && order_data?.instructions?.order_from != 'suite_manager') {
      //   tipPercentage.forEach((percentage, index) => {

      //     if(percentage != '' && percentage > 0){
      //     printer_conn.text(
      //       `${percentage}% (` +
      //         currency_symbol +
      //         (Number(subtotal.toFixed(2)) * (percentage / 100)).toFixed(2) +
      //         ")"
      //     );
      //   }
      //   });
      // } else {


      console.log('order_data?.instructions?.order_from', order_data?.instructions?.order_from);

      if (order_data?.instructions?.order_from != 'table_manager') {
        printer_conn
          .text(
            "15% (" +
            currency_symbol +
            (Number(subtotal.toFixed(2)) * 0.15).toFixed(2) +
            ")"
          )
          .text(
            "20% (" +
            currency_symbol +
            (Number(subtotal.toFixed(2)) * 0.20).toFixed(2) +
            ")"
          )
          .text(
            "25% (" +
            currency_symbol +
            (Number(subtotal.toFixed(2)) * 0.25).toFixed(2) +
            ")"
          )
          .text(
            "30% (" +
            currency_symbol +
            (Number(subtotal.toFixed(2)) * 0.30).toFixed(2) +
            ")"
          );
      }
      else {
        printer_conn
          .text(
            "5% (" +
            currency_symbol +
            (Number(subtotal.toFixed(2)) * 0.05).toFixed(2) +
            ")"
          )
          .text(
            "8% (" +
            currency_symbol +
            (Number(subtotal.toFixed(2)) * 0.08).toFixed(2) +
            ")"
          )
          .text(
            "10% (" +
            currency_symbol +
            (Number(subtotal.toFixed(2)) * 0.10).toFixed(2) +
            ")"
          );



      }

      // }
    }

    printer_conn
      .text("")

    if (order_data?.instructions?.order_from != 'table_manager') {
      printer_conn.text("Gratuity:  " + currency_symbol + "____________")
    }
    else {
      printer_conn.text("Additional Gratuity:  " + currency_symbol + "____________")
    }



    printer_conn
      .text("")
      .text("")
      .text("Total:  " + currency_symbol + "____________")
      .text("")
      .text("")
      .text("Signature:  ____________________")
      .text("")
      .text("")

    printer_conn.cut();



  });


}


function loadImageAsync(path) {
  return new Promise((resolve, reject) => {
    escpos.Image.load(path, (image) => {
      if (!image) {
        return reject(new Error("Image not loaded"));
      }
      resolve(image);
    });
  });
}
