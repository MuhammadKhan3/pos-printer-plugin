var line1 = "________________________________________________";
var line2 = "------------------------------------------------";
var line3 = "================================================";
var line4 = "- - - - - - - - - - - - - - - - - - - - - - - -";

const nodeHtmlToImage = require("node-html-to-image");

const escpos = require("escpos");

const path = require("path");

const template_styles = require("../../config/template_styles.json");
// const { drawer_serial_port } = require("../drawer/drawer_serial_port_template");

module.exports = {
  counter_printer_template_2: function (
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
      // drawer_serial_port(order_data?.k_id,order_data?.printer_meta?.counter_printer_ips)
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

  printer_conn.font("a").beep(3, 1);

  if (order_data.reprint != undefined && order_data.reprint == true) {
    printer_conn.align("ct").size(2, 2).style("b").text("[DUPLICATE]").text("");
  }

  if (order_data.type != undefined && order_data.type == "void") {
    printer_conn.align("ct").size(2, 2).style("b").text("[VOID]").text("");
  }

  var rcpt_html =
    '<!DOCTYPE html><html lang="en"><head> <meta charset="UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Document</title> <style>*{font-family: sans-serif; margin: 0px; box-sizing: border-box;}h2{margin: 8px 0px;}p{margin: 5px 0px; padding: 0px 2px;}.reciept{ width: 550px; border: 1px solid rgb(64, 64, 64); margin: 20px; padding: 16px;}.items{border-bottom: 1px solid black; padding-bottom: 1vh;}.item{display: flex; align-items: center; justify-content: space-between; margin-top: 5px;}.label{width: 70%; margin: 2px 0px;}.label_right{text-align: right; width: 30%; margin: 2px 0px;}.order_type{text-align: center; border-top: 1px solid black; border-bottom: 1px solid black; padding: 10px; margin: 14px 0px; font-weight: bold;}.warranty, .refund{margin-top: 20px; text-align: center; line-height: 1.3;}.powered-by{margin-top: 10px; text-align: center; line-height: 1.3; font-size: 12px;}.bold{font-weight: bold;}.small{font-size: 20px;}</style></head><body><div class="reciept">';

  if (
    order_data.business_info &&
    template_styles[template_style - 1].top_business_name != undefined &&
    template_styles[template_style - 1].top_business_name == true
  ) {
    rcpt_html +=
      '<h2 class="heading">' + order_data.business_info.name + "</h2>";
    rcpt_html +=
      '<div class="item"> <p class="label">' +
      order_data.business_info.address +
      '</p><p class="label_right">' +
      order_data.payment_info.order_date +
      "<br>" +
      order_data.payment_info.order_time +
      "</p></div>";
  }

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

    rcpt_html +=
      "<p>Receipt <span>" +
      order_data.payment_info.order_id +
      temp_order_id_split +
      "</span></p>";
  }

  rcpt_html +=
    '<p class="order_type">' + order_data.instructions.orderTypeLabel + "</p>";

  if (show_price_column == true) {
    price_column_text = "Price";
  } else {
    price_column_text = "-";
  }

  rcpt_html += '<div class="items">';

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

      rcpt_html +=
        '<div class="item"> <p class="label"><span>' +
        order_info.menuItem +
        "</span> x <span>" +
        order_info.quantity +
        '</span> </p><p class="label_right">$' +
        order_info.totalPrice +
        "</p></div>";
    }
  });

  rcpt_html += "</div><br>";

  rcpt_html +=
    '<div class="item"> <p class="label">Subtotal </p><p class="label_right">$' +
    Number(subtotal).toFixed(2) +
    "</p></div>";

  if (
    order_data.instructions.BusinessDiscount &&
    calculateBusinessDiscount(order_data) > 0
  ) {
    rcpt_html +=
      '<div class="item"> <p class="label">Business Discount </p><p class="label_right">-$' +
      calculateBusinessDiscount(order_data) +
      "</p></div>";
  }
  if (
    order_data.payment_info.discount != "" &&
    order_data.payment_info.discount != undefined &&
    Number(order_data.payment_info.discount) > 0
  ) {
    rcpt_html +=
      '<div class="item"> <p class="label">Discount </p><p class="label_right">-$' +
      Number(order_data.payment_info.discount).toFixed(2) +
      "</p></div>";
  }

  if (order_data.instructions.global_discount) {
    var discountTitle = "Discount";
    if (
      order_data.instructions.discount_name != undefined &&
      order_data.instructions.discount_name != "undefined"
    ) {
      discountTitle = order_data.instructions.discount_name;
    }

    rcpt_html +=
      '<div class="item"> <p class="label">' +
      discountTitle +
      ' </p><p class="label_right">-$' +
      Number(order_data.instructions.global_discount).toFixed(2) +
      "</p></div>";
  }

  if (
    order_data.instructions.calculatedDiscount &&
    order_data.instructions.calculatedDiscount != "" &&
    order_data.instructions.calculatedDiscount != "0.00" &&
    order_data.instructions.calculatedDiscount != 0 &&
    order_data.instructions.calculatedDiscount != "0"
  ) {
    rcpt_html +=
      '<div class="item"> <p class="label">POS Discount </p><p class="label_right">-$' +
      Number(order_data.instructions.calculatedDiscount).toFixed(2) +
      "</p></div>";
  }

  if (order_data.instructions.Type == "Delivery") {
    rcpt_html +=
      '<div class="item"> <p class="label">Delivery fee </p><p class="label_right">$' +
      Number(order_data.payment_info.deliveryCharges).toFixed(2) +
      "</p></div>";
  }

  if (order_data.instructions.discount_value_customized) {
    rcpt_html +=
      '<div class="item"> <p class="label">' +
      order_data.instructions.discount_value_customized_text +
      ' </p><p class="label_right">$' +
      Number(order_data.instructions.discount_value_customized).toFixed(2) +
      "</p></div>";
  }

  if (order_data.payment_info.tax == undefined) {
    rcpt_html +=
      '<div class="item"> <p class="label">Tax </p><p class="label_right">$0.00</p></div>';
  } else {
    rcpt_html +=
      '<div class="item"> <p class="label">Tax </p><p class="label_right">$' +
      Number(order_data.payment_info.tax).toFixed(2) +
      "</p></div>";
  }

  if (gift_card_amount) {
    rcpt_html +=
      '<div class="item"> <p class="label">Giftcard </p><p class="label_right">-$' +
      Number(gift_card_amount).toFixed(2) +
      "</p></div>";
  }
  if (order_data.instructions.Tip) {
    rcpt_html +=
      '<div class="item"> <p class="label">Gratuity </p><p class="label_right">$' +
      Number(order_data.instructions.Tip).toFixed(2) +
      "</p></div>";
  }

  if (order_data.instructions.cash_discount) {
    rcpt_html +=
      '<div class="item"> <p class="label">DualPriceAdj </p><p class="label_right">$' +
      Number(order_data.instructions.cash_discount).toFixed(2) +
      "</p></div>";
  }

  if (order_data.refund) {
    rcpt_html +=
      '<div class="item"> <p class="label">Total</p><p class="label_right">-$' +
      Number(order_data.total).toFixed(2) +
      "</p></div>";
  } else {
    rcpt_html +=
      '<div class="item"> <p class="label">Total</p><p class="label_right">$' +
      Number(order_data.total).toFixed(2) +
      "</p></div>";
  }

  if (order_data.given_value) {
    rcpt_html +=
      '<div class="item"> <p class="label">Amount Given</p><p class="label_right">$' +
      Number(order_data.given_value).toFixed(2) +
      "</p></div>";
  }

  if (order_data.balance && order_data.type == "cash") {
    rcpt_html +=
      '<div class="item"> <p class="label">Change Due</p><p class="label_right">$' +
      Number(order_data.balance).toFixed(2) +
      "</p></div>";
  }

  // if(order_data.rawText != undefined && order_data.rawText != '' && (template_styles[template_style-1].payment_express_receipt == undefined || template_styles[template_style-1].payment_express_receipt === true)){

  //     printer_conn
  //     .size(1, 1)
  //     .text('')
  //     .align('ct')
  //     .text(order_data.rawText)

  // }

  if (order_data.receipt_footer) {
    rcpt_html += ' <p class="warranty">' + order_data.receipt_footer + "</p>";
  }

  rcpt_html += ' <p class="powered-by">Powered by Pocket Systems, LLC.</p>';

  rcpt_html += "</div></body></html>";

  // console.log(rcpt_html);

  if (order_data.payment_info.order_id == "") {
    order_data.payment_info.order_id = getRanHex(6);
  }

  nodeHtmlToImage({
    output: path.join(
      __dirname,
      "./counter_images/",
      "",
      order_data.payment_info.order_id + ".png"
    ),
    html: rcpt_html,
  }).then(() => {
    setTimeout(function () {
      console.log("IMAGE RCPT CREATED");
      escpos.Image.load(
        path.join(
          __dirname,
          "./counter_images/",
          "",
          order_data.payment_info.order_id + ".png"
        ),
        (image) => {
          console.log("PRINTING RCPT");
          printer_conn.image(image);

          setTimeout(function () {
            printer_conn.text("");

            printer_conn.cut().close();

            console.log("CUTTING");
          }, 50);
        }
      );
    }, 50);
  });
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

const getRanHex = (size) => {
  let result = [];
  let hexRef = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
  ];

  for (let n = 0; n < size; n++) {
    result.push(hexRef[Math.floor(Math.random() * 16)]);
  }
  return result.join("");
};
