var line1 = "________________________________________________";
var line2 = "------------------------------------------------";
var line3 = "================================================";
var line4 = "- - - - - - - - - - - - - - - - - - - - - - - -";

const nodeHtmlToImage = require("node-html-to-image");
const path = require("path");
const template_styles = require("../../config/template_styles.json");
const { drawer_serial_port } = require("../drawer/drawer_serial_port_template");
const escpos = require("escpos");

const receip_html = ``;

function receip_handler(
  total_receipts,
  sold_items_total,
  net_credit_cash,
  discounts_total
) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <section style="display: flex; flex-direction: column; width: 70%;">
        <div style="width: 100%; display: flex;">
            <div style="width: 50%;border: 5px solid black; margin: 1px; padding: 2rem; display: flex; flex-direction: column; justify-content: center;align-items: center;">
                <div style="text-align: center;">
                    <h1 style="font-size: 1.5rem;margin: 0px;padding: 0px;">TOTAL RECEIPTS</h1>
                    <h1 style="margin: 0px;padding: 0px; font-size: 2rem;">${formatValue(
                      total_receipts
                    )}</h1>
                    <p style="margin: 0px;">In Store</p>
                </div>
            </div>
            <div
                style="width: 50%;border: 5px solid black; margin: 1px; padding: 2rem; display: flex; flex-direction: column; justify-content: center;align-items: center;">
                <div style="text-align: center;">
                    <h1 style="font-size: 1.5rem;margin: 0px;padding: 0px;">TOTAL SALES*</h1>
                    <h1 style="margin: 0px;padding: 0px; font-size: 2rem;">${formatValue(
                      sold_items_total
                    )}</h1>
                    <p style="margin: 0px;">In Store</p>

                </div>
            </div>
        </div>
        <div style="width: 100%; display: flex;">
            <div
                style="width: 50%;border: 5px solid black; margin: 1px; padding: 2rem; display: flex; flex-direction: column; justify-content: center;align-items: center;">
                <div style="text-align: center;">
                    <h1 style="font-size: 1.5rem;margin: 0px;padding: 0px;">TOTAL NET CARD + NET CASH</h1>
                    <h1 style="margin: 0px;padding: 0px; font-size: 2rem;">${formatValue(
                      net_credit_cash
                    )}</h1>
                    <p style="margin: 0px;">In Store(Net of Sales Tax)</p>

                </div>
            </div>
            <div
                style=" width: 50%;border: 5px solid black; margin: 1px; padding: 2rem; display: flex; flex-direction: column; justify-content: center;align-items: center;">
                <div style="text-align: center;">
                    <h1 style="font-size: 1.5rem;margin: 0px;padding: 0px;">TOTAL DISCOUNTS</h1>
                    <h1 style="margin: 0px;padding: 0px; font-size: 2rem;">${formatValue(
                      discounts_total
                    )}</h1>
                    <p style="margin: 0px;">In Store</p>

                </div>
            </div>
        </div>
    </section>
</body>

</html>`;
}
module.exports = {
  dayclose_printer_template_2: function (printer_conn, print_data, date_time) {
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
  try {
    var show_orders_dayclose = false;
    var show_sold_items_dayclose = false;
    var print_timeout=100;
    if (template_styles[0].show_orders_dayclose != undefined) {
      show_orders_dayclose = template_styles[0].show_orders_dayclose;
    }

    if (template_styles[0].show_sold_items_dayclose != undefined) {
      show_sold_items_dayclose = template_styles[0].show_sold_items_dayclose;
    }

    setTimeout(() => {
      
    var all_data = print_data.all_data;

    if (all_data.open_drawer != undefined) {
      if (all_data.open_drawer == true) {
        printer_conn.cashdraw();
        console.log("Cashdrawer opened");
        drawer_serial_port(
          print_data?.k_id,
          print_data?.printer_meta?.counter_printer_ips
        );
      }
    } else {
      printer_conn.cashdraw();
      console.log("Cashdrawer opened");
      drawer_serial_port(
        print_data?.k_id,
        print_data?.printer_meta?.counter_printer_ips
      );
    }

    //     printer_conn
    //     .font('a')
    //     .beep(3, 1)
    //     .align('ct')

    //     .size(2, 2)

    if (all_data.shift_no != undefined && all_data.shift_no != "") {
      printer_conn.text(">> POS Report <<").text("\n");

      printer_conn.text("Shift # " + all_data.shift_no);

      if (all_data.all_shifts[0] != undefined) {
        printer_conn.text(
          all_data.all_shifts[0].staff_name +
            " (ID: " +
            all_data.all_shifts[0].username +
            ")"
        );
      }
    } else {
      printer_conn
        .align("ct")
        .size(2, 2)
        .style("b")
        .text(" Dayclose Report ")
        .text("");
    }

    printer_conn.size(1, 1);

    // printer_conn
    //     .font('a')
    //     .size(1, 1)
    //     .text('\n')
    //     .align('ct')
    //     .text('*** Report Start ***')
    //     .text('\n')
    //     .size(1, 1)
    //     .align('lt')

    printer_conn
      .tableCustom([{ text: "FROM: " + all_data.from, align: "LEFT" }])
      .tableCustom([{ text: "TO: " + all_data.to, align: "LEFT" }]);

    // nodeHtmlToImage({
    //     output: path.join(__dirname, './dayclose_images/', '', 'image.png'),
    //     html: receip_handler(all_data?.total_receipts, all_data?.sold_items_total, all_data?.net_credit_cash, all_data?.discounts_total)
    // })
    //     .then(() => {

    printer_conn
      .text("")
      .size(1, 1)
      .style("b")
      .tableCustom([
        { text: "TOTAL RECEIPTS", align: "LEFT", width: 0.60 },
        { text: "TOTAL SALES*", align: "LEFT", width: 0.38 },
      ]);

    printer_conn
       .style("b")
      .size(1, 2)
      .tableCustom([
        { text: formatValue(all_data?.total_receipts), align: "LEFT", width: 0.60 },
        { text: formatValue(all_data?.sold_items_total), align: "LEFT", width: 0.38 },
      ]);

    printer_conn
      .text("")
      .size(1, 1)
      .style("b")
      .tableCustom([
        { text: "TOTAL NET CARD + NET CASH", align: "LEFT", width: 0.60},
        { text: "TOTAL DISCOUNTS", align: "LEFT", width: 0.38 },
      ]);

    printer_conn
      .size(1, 2)
      .style("b")
      .tableCustom([
        { text: formatValue(all_data?.net_credit_cash), align: "LEFT", width: 0.60},
        { text: formatValue(all_data?.discounts_total), align: "LEFT", width: 0.38 },
      ]);

        printer_conn
          .text("")
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "In Store Receipt Type", align: "LEFT", width: "0.45" },
            { text: "Quantity", align: "LEFT", width: "0.18" },
            { text: "Amount", align: "LEFT", width: "0.15" },
            { text: "Average", align: "RIGHT", width: "0.15" },
          ]);

        printer_conn.size(1, 1).tableCustom([
          { text: "Card Transactions", align: "LEFT", width: "0.45" },
          {
            text: all_data?.credit_card_transaction,
            align: "LEFT",
            width: "0.18",
          },
          {
            text: formatValue(all_data?.total_credit_card),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(
              all_data?.total_credit_card,
              all_data?.credit_card_transaction
            ),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Cash Transactions", align: "LEFT", width: "0.45" },
          { text: all_data?.cash_transaction, align: "LEFT", width: "0.18" },
          {
            text: formatValue(all_data?.total_cash),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(all_data?.total_cash, all_data?.cash_transaction),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Payout from Cash", align: "LEFT", width: "0.45" },
          { text: all_data?.payout_count, align: "LEFT", width: "0.18" },
          {
            text: formatValue(all_data?.payout),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(all_data?.payout, all_data?.payout_count),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Card Refunds", align: "LEFT", width: "0.45" },
          {
            text: all_data?.credit_card_refund_count,
            align: "LEFT",
            width: "0.18",
          },
          {
            text: formatValue(all_data?.credit_card_refund),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(
              all_data?.credit_card_refund,
              all_data?.credit_card_refund_count
            ),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Cash Refunds", align: "LEFT", width: "0.45" },
          { text: all_data?.cash_refund_count, align: "LEFT", width: "0.18" },
          {
            text: formatValue(all_data?.cash_refund),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(all_data?.cash_refund, all_data?.cash_refund_count),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Gift Cards Redeemed", align: "LEFT", width: "0.45" },
          {
            text: all_data?.giftcard_used_in_orders_count,
            align: "LEFT",
            width: "0.18",
          },
          {
            text: formatValue(all_data?.giftcard_used_in_orders),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(
              all_data?.giftcard_used_in_orders,
              all_data?.giftcard_used_in_orders_count
            ),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Ext. Gift Cards Redeemed", align: "LEFT", width: "0.45" },
          {
            text: all_data?.external_giftcard_used_in_orders_count,
            align: "LEFT",
            width: "0.18",
          },
          {
            text: formatValue(all_data?.external_giftcard_used_in_orders),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(
              all_data?.external_giftcard_used_in_orders,
              all_data?.external_giftcard_used_in_orders_count
            ),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Points Redeemed", align: "LEFT", width: "0.45" },
          { text: all_data?.points_used_count, align: "LEFT", width: "0.18" },
          {
            text: formatValue(all_data?.points_used),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(all_data?.points_used, all_data?.points_used_count),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.text(line1);

        printer_conn.tableCustom([
          { text: "Total Receipts", align: "LEFT", width: "0.45" },
          {
            text: all_data?.total_receipts_count,
            align: "LEFT",
            width: "0.18",
          },
          {
            text: formatValue(all_data?.total_receipts),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(
              all_data?.total_receipts,
              all_data?.total_receipts_count
            ),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.text("").text("");

        printer_conn
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "In Store Category", align: "LEFT", width: "0.45" },
            { text: "Quantity", align: "LEFT", width: "0.18" },
            { text: "Amount", align: "LEFT", width: "0.15" },
            { text: "Average", align: "RIGHT", width: "0.15" },
          ]);

        printer_conn.size(1, 1).style("r");

        all_data?.sold_items.forEach((item) => {
          printer_conn.tableCustom([
            { text: item?.item_name, align: "LEFT", width: "0.45" },
            { text: item?.qty, align: "LEFT", width: "0.18" },
            { text: formatValue(item?.total), align: "LEFT", width: "0.15" },
            {
              text: Average(item?.total, item?.qty),
              align: "RIGHT",
              width: "0.15",
            },
          ]);
        });

        printer_conn.tableCustom([
          { text: "Tips", align: "LEFT", width: "0.45" },
          { text: all_data?.tips_count, align: "LEFT", width: "0.18" },
          { text: formatValue(all_data?.tips), align: "LEFT", width: "0.15" },
          {
            text: Average(all_data?.tips, all_data?.tips_count),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Delivery Fee", align: "LEFT", width: "0.45" },
          { text: all_data?.delivery_count, align: "LEFT", width: "0.18" },
          {
            text: formatValue(all_data?.delivery_fee),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(all_data?.delivery_fee, all_data?.delivery_count),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Gift Cards Sold", align: "LEFT", width: "0.45" },
          {
            text: all_data?.giftcard_sold_count,
            align: "LEFT",
            width: "0.18",
          },
          {
            text: formatValue(all_data?.giftcard_sold),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(
              all_data?.giftcard_sold,
              all_data?.giftcard_sold_count
            ),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Technology Liability Fee (i)", align: "LEFT", width: "0.45" },
          {
            text: all_data?.total_cc_fee_count,
            align: "LEFT",
            width: "0.18",
          },
          {
            text: formatValue(all_data?.total_cc_fee),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(all_data?.total_cc_fee, all_data?.total_cc_fee_count),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Sales Tax", align: "LEFT", width: "0.45" },
          { text: "", align: "LEFT", width: "0.18" },
          {
            text: formatValue(all_data?.total_gross_tax),
            align: "LEFT",
            width: "0.15",
          },
          { text: "", align: "RIGHT", width: "0.15" },
        ]);

        all_data?.additionalTaxData.forEach((data) => {
          printer_conn.tableCustom([
            { text: data?.tax_title, align: "LEFT", width: "0.45" },
            { text: "", align: "LEFT", width: "0.18" },
            { text: formatValue(data?.tax), align: "LEFT", width: "0.15" },
            { text: "", align: "RIGHT", width: "0.15" },
          ]);
        });

        printer_conn.tableCustom([
          { text: "Service Charge", align: "LEFT", width: "0.45" },
          { text: "", align: "LEFT", width: "0.18" },
          {
            text: formatValue(all_data?.total_service_charge),
            align: "LEFT",
            width: "0.15",
          },
          { text: "", align: "RIGHT", width: "0.15" },
        ]);

        printer_conn.text(line1).tableCustom([
          { text: "In Store Category Total", align: "LEFT", width: "0.63" },
          {
            text: formatValue(all_data?.sold_items_total),
            align: "LEFT",
            width: "0.15",
          },
          { text: "", align: "RIGHT", width: "0.15" },
        ]);

        printer_conn.text(line1).tableCustom([
          { text: "(-) In Store Discounts", align: "LEFT", width: "0.63" },
          {
            text: formatValue(all_data?.discounts_total),
            align: "LEFT",
            width: "0.15",
          },
          { text: "", align: "RIGHT", width: "0.15" },
        ]);

        printer_conn.text(line1).tableCustom([
          {
            text: "Net In Store Category Total ",
            align: "LEFT",
            width: "0.63",
          },
          {
            text: formatValue(all_data?.net_instore_total),
            align: "LEFT",
            width: "0.15",
          },
          { text: "", align: "RIGHT", width: "0.15" },
        ]);

        printer_conn
          .text("")
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "In Store Category", align: "LEFT", width: "0.45" },
            { text: "Card", align: "LEFT", width: "0.18" },
            { text: "Cash", align: "LEFT", width: "0.15" },
            { text: "Total", align: "RIGHT", width: "0.15" },
          ]);

        printer_conn.size(1, 1).style("r");

        all_data?.sold_items.forEach((item) => {
          printer_conn.tableCustom([
            { text: item?.item_name, align: "LEFT", width: "0.45" },
            {
              text: formatValue(item?.card_total),
              align: "LEFT",
              width: "0.18",
            },
            {
              text: formatValue(item?.cash_total),
              align: "LEFT",
              width: "0.15",
            },
            { text: formatValue(item?.total), align: "RIGHT", width: "0.15" },
          ]);
        });

        printer_conn.tableCustom([
          { text: "Tips", align: "LEFT", width: "0.45" },
          { text: all_data?.tips_count, align: "LEFT", width: "0.18" },
          { text: formatValue(all_data?.tips), align: "LEFT", width: "0.15" },
          {
            text: Average(all_data?.tips, all_data?.tips_count),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Delivery Fee", align: "LEFT", width: "0.45" },
          { text: all_data?.delivery_count, align: "LEFT", width: "0.18" },
          {
            text: formatValue(all_data?.delivery_fee),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(all_data?.delivery_fee, all_data?.delivery_count),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Gift Cards Sold", align: "LEFT", width: "0.45" },
          {
            text: all_data?.giftcard_sold_count,
            align: "LEFT",
            width: "0.18",
          },
          {
            text: formatValue(all_data?.giftcard_sold),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(
              all_data?.giftcard_sold,
              all_data?.giftcard_sold_count
            ),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Technology Liability Fee (i)", align: "LEFT", width: "0.45" },
          {
            text: all_data?.total_cc_fee_count,
            align: "LEFT",
            width: "0.18",
          },
          {
            text: formatValue(all_data?.total_cc_fee),
            align: "LEFT",
            width: "0.15",
          },
          {
            text: Average(all_data?.total_cc_fee, all_data?.total_cc_fee_count),
            align: "RIGHT",
            width: "0.15",
          },
        ]);

        printer_conn.tableCustom([
          { text: "Sales Tax", align: "LEFT", width: "0.45" },
          { text: "", align: "LEFT", width: "0.18" },
          {
            text: formatValue(all_data?.total_gross_tax),
            align: "LEFT",
            width: "0.15",
          },
          { text: "", align: "RIGHT", width: "0.15" },
        ]);

        all_data?.additionalTaxData.forEach((data) => {
          printer_conn.tableCustom([
            { text: data?.tax_title, align: "LEFT", width: "0.45" },
            { text: "", align: "LEFT", width: "0.18" },
            { text: formatValue(data?.tax), align: "LEFT", width: "0.15" },
            { text: "", align: "RIGHT", width: "0.15" },
          ]);
        });

        printer_conn.tableCustom([
          { text: "Service Charge", align: "LEFT", width: "0.45" },
          { text: "", align: "LEFT", width: "0.18" },
          {
            text: formatValue(all_data?.total_service_charge),
            align: "LEFT",
            width: "0.15",
          },
          { text: "", align: "RIGHT", width: "0.15" },
        ]);

        printer_conn.text(line1).tableCustom([
          { text: "In Store Category Total", align: "LEFT", width: "0.63" },
          {
            text: formatValue(all_data?.sold_items_total),
            align: "LEFT",
            width: "0.15",
          },
          { text: "", align: "RIGHT", width: "0.15" },
        ]);

        printer_conn.text(line1).tableCustom([
          { text: "(-) In Store Discounts", align: "LEFT", width: "0.63" },
          {
            text: formatValue(all_data?.discounts_total),
            align: "LEFT",
            width: "0.15",
          },
          { text: "", align: "RIGHT", width: "0.15" },
        ]);

        printer_conn.text(line1).tableCustom([
          {
            text: "Net In Store Category Total ",
            align: "LEFT",
            width: "0.63",
          },
          {
            text: formatValue(all_data?.net_instore_total),
            align: "LEFT",
            width: "0.15",
          },
          { text: "", align: "RIGHT", width: "0.15" },
        ]);

        printer_conn
          .text("")
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "Quantity Type", align: "LEFT", width: "0.35" },
            { text: "Card Qty", align: "LEFT", width: "0.18" },
            { text: "Cash Qty", align: "LEFT", width: "0.17" },
            { text: "Total Qty", align: "RIGHT", width: "0.25" },
          ]);

        all_data?.sold_items.forEach((item) => {
          printer_conn
            .size(1, 1)
            .style("r")
            .tableCustom([
              { text: item?.item_name ?? 0, align: "LEFT", width: "0.35" },
              {
                text: item?.card_quantity ?? 0,
                align: "LEFT",
                width: "0.18",
              },
              {
                text: item?.cash_quantity ?? 0,
                align: "LEFT",
                width: "0.17",
              },
              { text: item?.qty, align: "RIGHT", width: "0.22" },
            ]);
        });

        printer_conn.text("");

        printer_conn
          .text("")
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "Discount Type", align: "LEFT", width: "0.45" },
            { text: "Qty", align: "LEFT", width: "0.15" },
            { text: "Amount", align: "LEFT", width: "0.15" },
            { text: "Average", align: "RIGHT", width: "0.20" },
          ]);
        let discountTotal = 0;
        let dicountQty = 0;

        all_data?.discounts.forEach((item) => {
          discountTotal = discountTotal + parseFloat(item.sum);
          dicountQty = dicountQty + item.count;

          printer_conn.size(1, 1).tableCustom([
            { text: item?.discount_name, align: "LEFT", width: "0.45" },
            { text: item?.count, align: "LEFT", width: "0.15" },
            { text: formatValue(item?.sum), align: "LEFT", width: "0.15" },
            {
              text: Average(item?.sum, item?.count),
              align: "RIGHT",
              width: "0.20",
            },
          ]);
        });

        printer_conn.text(line1);

        printer_conn
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "Discounts Total", align: "LEFT", width: "0.45" },
            { text: dicountQty, align: "LEFT", width: "0.15" },
            {
              text: formatValue(discountTotal),
              align: "LEFT",
              width: "0.15",
            },
            {
              text: Average(discountTotal, dicountQty),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn.text("");

        printer_conn
          .text("")
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "Other In Store", align: "LEFT", width: "0.60" },
            { text: "", align: "CENTER", width: "0.10" },
            { text: "", align: "CENTER", width: "0.10" },
            { text: "", align: "RIGHT", width: "0.10" },
          ]);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            { text: "Voids", align: "LEFT", width: "0.45" },
            {
              text: all_data?.total_voids_count,
              align: "LEFT",
              width: "0.15",
            },
            {
              text: formatValue(all_data?.total_voids_sum),
              align: "LEFT",
              width: "0.15",
            },
            {
              text: Average(
                all_data?.total_voids_sum,
                all_data?.total_voids_count
              ),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            { text: "Deleted Items", align: "LEFT", width: "0.45" },
            {
              text: all_data?.total_errors_count,
              align: "LEFT",
              width: "0.15",
            },
            {
              text: formatValue(all_data?.total_errors_sum),
              align: "LEFT",
              width: "0.15",
            },
            {
              text: Average(
                all_data?.total_errors_sum,
                all_data?.total_errors_count
              ),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            { text: "No Sales", align: "LEFT", width: "0.45" },
            { text: all_data?.total_no_sale, align: "LEFT", width: "0.15" },
            {
              text: formatValue(all_data?.total_no_sale_sum),
              align: "LEFT",
              width: "0.15",
            },
            {
              text: Average(
                all_data?.total_no_sale_sum,
                all_data?.total_no_sale
              ),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        // ---------------------activity card---------------------------

        printer_conn
          .text("")
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "Activity by Card", align: "LEFT", width: "0.60" },
            { text: "Quantity", align: "LEFT", width: "0.18" },
            { text: "Amount", align: "RIGHT", width: "0.20" },
          ]);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            { text: "Card Transactions", align: "LEFT", width: "0.60" },
            {
              text: all_data?.credit_card_transaction,
              align: "LEFT",
              width: "0.18",
            },
            {
              text: formatValue(all_data?.total_credit_card),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            {
              text: "(-)Technology Liability Fee (i)",
              align: "LEFT",
              width: "0.60",
            },
            {
              text: all_data?.total_cc_fee_count,
              align: "LEFT",
              width: "0.18",
            },
            {
              text: formatValue(all_data?.total_cc_fee),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            { text: "Card Refunds", align: "LEFT", width: "0.60" },
            {
              text: all_data?.credit_card_refund_count,
              align: "LEFT",
              width: "0.18",
            },
            {
              text: formatValue(all_data?.credit_card_refund),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn.text(line1);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            { text: "Net Card Amount Total ", align: "LEFT", width: "0.68" },
            { text: "", align: "LEFT", width: "0.08" },
            {
              text: formatValue(all_data?.net_credit),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        // // ---------------------------activity cash-------------------------------
        printer_conn
          .text("")
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "Activity by Cash", align: "LEFT", width: "0.60" },
            { text: "Quantity", align: "LEFT", width: "0.18" },
            { text: "Amount", align: "RIGHT", width: "0.20" },
          ]);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            { text: "Cash Transaction", align: "LEFT", width: "0.60" },
            {
              text: all_data?.cash_transaction,
              align: "LEFT",
              width: "0.18",
            },
            {
              text: formatValue(all_data?.total_cash),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            { text: "Tip Payouts", align: "LEFT", width: "0.60" },
            {
              text: all_data?.tip_payout_count,
              align: "LEFT",
              width: "0.18",
            },
            {
              text: formatValue(all_data?.tip_payout),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            { text: "Payouts from Cash", align: "LEFT", width: "0.60" },
            { text: all_data?.payout_count, align: "LEFT", width: "0.18" },
            {
              text: formatValue(all_data?.payout),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            { text: "Cash Refunds", align: "LEFT", width: "0.60" },
            {
              text: all_data?.cash_refund_count,
              align: "LEFT",
              width: "0.18",
            },
            {
              text: formatValue(all_data?.cash_refund),
              align: "RIGHT",
              width: "0.20",
            },
          ]);
        printer_conn.text(line1);

        printer_conn
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "Net Cash Amount Total", align: "LEFT", width: "0.68" },
            { text: "", align: "LEFT", width: "0.08" },
            {
              text: formatValue(all_data?.net_cash_amount),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn
          .size(1, 1)
          .text("")
          .text("")
          .style("b")
          .tableCustom([
            {
              text: "Net Card Amount (Incl. Sales Tax)",
              align: "LEFT",
              width: "0.68",
            },
            { text: "", align: "LEFT", width: "0.08" },
            {
              text: formatValue(all_data?.net_credit),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn
          .size(1, 1)
          .style("b")
          .tableCustom([
            {
              text: "Net Cash Amount (Incl. Sales Tax)",
              align: "LEFT",
              width: "0.68",
            },
            { text: "", align: "LEFT", width: "0.08" },
            {
              text: formatValue(all_data?.net_cash_amount),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn.text(line1);

        printer_conn
          .size(1, 1)
          .style("b")
          .tableCustom([
            {
              text: "Net Card + Cash Total  (Incl. Sales Tax)",
              align: "LEFT",
              width: "0.75",
            },
            { text: "", align: "LEFT", width: "0.02" },
            {
              text: formatValue(all_data?.net_cash_credit),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn.text(line1);

        printer_conn
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "(-) Sales Tax", align: "LEFT", width: "0.68" },
            { text: "", align: "LEFT", width: "0.08" },
            {
              text: formatValue(all_data?.total_gross_tax),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        if (all_data?.additionalTaxData.length > 0) {
          printer_conn.text(line1);

          all_data?.additionalTaxData.forEach((data) => {
            printer_conn
              .size(1, 1)
              .style("b")
              .tableCustom([
                { text: data?.tax_title, align: "LEFT", width: "0.68" },
                { text: "", align: "LEFT", width: "0.08" },
                {
                  text: formatValue(data?.tax),
                  align: "LEFT",
                  width: "0.20",
                },
              ]);
          });
        }

        printer_conn.text(line1);

        printer_conn
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "Net of Taxes Listed", align: "LEFT", width: "0.68" },
            { text: "", align: "LEFT", width: "0.08" },
            {
              text: formatValue(all_data?.net_sales_tax),
              align: "RIGHT",
              width: "0.20",
            },
          ]);

        printer_conn.text("").text("");

        // ----------------------tax type----------------------------
        printer_conn
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "Tax Type", align: "LEFT", width: "0.35" },
            { text: "Qty", align: "CENTER", width: "0.15" },
            { text: "Amt", align: "CENTER", width: "0.15" },
            { text: "S Tax", align: "CENTER", width: "0.13" },
            { text: "O Tax", align: "RIGHT", width: "0.15" },
          ]);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            { text: "Taxable Sales", align: "LEFT", width: "0.35" },
            {
              text: all_data?.taxable_sales?.qty,
              align: "CENTER",
              width: "0.15",
            },
            {
              text: formatValue(all_data?.taxable_sales?.amount),
              align: "CENTER",
              width: "0.15",
            },
            {
              text: formatValue(all_data?.taxable_sales?.tax_calculated),
              align: "CENTER",
              width: "0.13",
            },
            {
              text: formatValue(all_data?.category_summary?.additionalTax),
              align: "RIGHT",
              width: "0.15",
            },
          ]);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            { text: "Non-Taxable Sales", align: "LEFT", width: "0.35" },
            {
              text: all_data?.non_taxable_sales?.qty,
              align: "CENTER",
              width: "0.15",
            },
            {
              text: formatValue(all_data?.non_taxable_sales?.amount),
              align: "CENTER",
              width: "0.15",
            },
            {
              text: formatValue(all_data?.non_taxable_sales?.calculated_tax),
              align: "CENTER",
              width: "0.13",
            },
            { text: "$0.00", align: "RIGHT", width: "0.15" },
          ]);

        // ----------------online orders---------------------------
        printer_conn
          .text("")
          .size(1, 1)
          .style("b")
          .tableCustom([
            { text: "Online Orders", align: "LEFT", width: "0.45" },
            { text: "Quantity", align: "LEFT", width: "0.20" },
            { text: "Amount", align: "LEFT", width: "0.15" },
            { text: "Average", align: "RIGHT", width: "0.15" },
          ]);

        printer_conn
          .size(1, 1)
          .style("r")
          .tableCustom([
            { text: "Online Orders Totals", align: "LEFT", width: "0.45" },
            {
              text: all_data?.online_orders?.qty,
              align: "CENTER",
              width: "0.20",
            },
            {
              text: formatValue(all_data?.online_orders?.total),
              align: "CENTER",
              width: "0.15",
            },
            {
              text: Average(
                all_data?.online_orders?.total,
                all_data?.online_orders?.qty
              ),
              align: "RIGHT",
              width: "0.15",
            },
          ]);

        printer_conn
          .text("\n\n")
          .size(1, 1)
          .align("ct")
          .text("*** Report End ***")
          .text(line1)
          .size(2, 2)
          .align("lt")

          .text(print_data.business_info.name)
          .size(1, 1)
          .text(print_data.business_info.address)
          .size(1, 1)
          .text("Staff ID: " + print_data.staff_id)

          .size(1, 1)
          .text("Staff Name: " + print_data.staff_name)
          .size(1, 1)

          .text("Print date-time: " + date_time.date + " " + date_time.time);

        printer_conn
          .text(line1)

          .size(1, 1)

          .align("ct")
          .text("Powered by Pocket Systems, LLC.")
          .text("");

           printer_conn.cut().close();
  }, print_timeout);

    // }, 500);
    //   }
    // );

    // })
  } catch (error) {}
}

function Average(value, count) {
  let numericValue;

  // Check if the value is already a number or a string
  if (typeof value === "number") {
    numericValue = value; // If it's a number, use it directly
  } else if (typeof value === "string") {
    // If it's a string, remove $ and commas, then convert to number
    numericValue = parseFloat(value.replace(/[$,]/g, ""));
  }

  // If numericValue is not a valid number, return null or handle the error
  if (isNaN(numericValue)) {
    return "$" + Number(0).toFixed(2);
  }

  // Calculate the average
  let average = numericValue / count;

  if (isNaN(average)) {
    return "$" + Number(0).toFixed(2);
  } else {
    average = "$" + average.toFixed(2);
  }

  return average;
}

function formatValue(value) {
  if (typeof value === "string" && value.includes("$")) {
    // Value is already formatted
    return value;
  } else {
    // Format the number
    return Number(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  }
}
