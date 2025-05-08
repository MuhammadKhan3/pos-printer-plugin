var line1 = '________________________________________________';
var line2 = '------------------------------------------------';
var line3 = '================================================';
var line4 = '- - - - - - - - - - - - - - - - - - - - - - - -';

const escpos = require('escpos');

const path = require('path');

const template_styles = require('../../config/template_styles.json');
const staff_config=require('../../config/staff_config.json')
module.exports = {
    staff_counter_printer_template_clock_out: function (printer_conn, order_data, date_time, template_style) {

        try {
            print_handler(printer_conn, order_data, date_time, template_style);

        }
        catch (e) {
            setTimeout(function () {
                console.log('Printer is not reachable...', e);
            }, 1);
        }

    }
}


function print_handler(printer_conn, order_data, date_time, template_style) {
    
    console.log("----------------------Staff Counter Clock Out------------------------");
    
    
    if (order_data.business_info && (template_styles[template_style-1].top_business_name != undefined && template_styles[template_style-1].top_business_name == true)) {
        printer_conn
            .align('ct')
            .size(1, 1)
            .style('b')
            .text(order_data.business_info.name)
            .text(order_data.business_info.address)
    }

        printer_conn
        .align('ct')
        .size(1, 1)
        .style('b')
        .text(`${order_data?.accumulated_data.staff_access_level} Clock Out Receipt`)

        if(order_data?.accumulated_data.staff_nickname!=null){

            printer_conn
            .align('ct')
            .size(1, 1)
            .style('b')    
            .text(order_data?.accumulated_data?.staff_nickname)
        }

        
        printer_conn
        .size(1,1)
        .text("")
        .align("lt")
        .text('Name')
        .text(order_data?.accumulated_data?.staff_name)
        .text("")

        printer_conn
        .size(1,1)   
            .align("lt")
            .text('Date')
            .text(order_data?.accumulated_data?.date)   
            .text("")

        printer_conn
            .size(1,1)
            .align("lt")
            .text('Time In')
            .text(order_data?.accumulated_data?.clockin_time)   
            .text("")

            .text('Time Out')
            .text(order_data?.accumulated_data?.clockout_time)   
            // .text("")

 

        var staff_clockout_amount=Number(order_data?.accumulated_data?.staff_clockout_amount).toFixed(2);

        var amount_owed_to_staff=Number(order_data?.accumulated_data?.amount_owed_to_staff).toFixed(2);
        var amount_owed_to_business=Number(order_data?.accumulated_data?.amount_owed_to_business).toFixed(2);

        printer_conn
        .text('')
        .text('')
        .text(`Reported ${staff_config?.report_label} $${staff_clockout_amount}`)
        .text(line1)


        var filteredItems = getItemsByReportValue(1, order_data?.accumulated_data?.items);

       

        if(filteredItems !== undefined && filteredItems !== 'undefined'){

        printer_conn
        .style('b')
        .tableCustom(
                [   
                    {text: `${filteredItems?.item_name} (Qty ${filteredItems?.quantity})`, align: "LEFT", width: 0.70},
                    {text: `$${filteredItems?.staff_share}`, align: "RIGHT", width: 0.20},
                ]
        )

        if(filteredItems?.item_list_display && filteredItems?.item_list_display.length > 0){

            filteredItems?.item_list_display.forEach(function (ild) {
            printer_conn
            .style('b')
            .tableCustom(
                    [   
                        {text: `${ild?.instructions} ${ild?.name} $${handleUndefined(ild?.amount)}`, align: "LEFT", width: 1.0},
                    ]
            )

        });

        }

        printer_conn
        .text("")

    }


        filteredItems = getItemsByReportValue(2, order_data?.accumulated_data?.items);

        if(filteredItems !== undefined && filteredItems !== 'undefined'){

        printer_conn
        .style('b')
        .tableCustom(
                [   
                    {text: `${filteredItems?.item_name} (Qty ${filteredItems?.quantity})`, align: "LEFT", width: 0.70},
                    {text: `-$${filteredItems?.business_share}`, align: "RIGHT", width: 0.20},
                ]
        )

        if(filteredItems?.item_list_display && filteredItems?.item_list_display.length > 0){

            filteredItems?.item_list_display.forEach(function (ild) {
            printer_conn
            .style('b')
            .tableCustom(
                    [   
                        {text: `${ild?.instructions} ${ild?.name} $${handleUndefined(ild?.amount)}`, align: "LEFT", width: 1.0},
                    ]
            )

        });

        }

        printer_conn
        .text("")

    }

        


        printer_conn
        .size(1, 1)
        .style('r')
        .style('b')
        .tableCustom(
                [   
                    {text: 'Locker Fees', align: "LEFT", width: 0.70},
                    {text: '', align: "RIGHT", width: 0.20},
                ]
        )
        
       

        filteredItems = getItemsByReportValue(3, order_data?.accumulated_data?.items);

        if(filteredItems !== undefined && filteredItems !== 'undefined'){

        printer_conn
        .size(1, 1)
        .style('r')
        .style('b')
        .tableCustom(
                [   
                    {text: `${filteredItems?.item_name} (Qty ${filteredItems?.quantity})`, align: "LEFT", width: 0.70},
                    {text: `-$${filteredItems?.business_share}`, align: "RIGHT", width: 0.20},
                ]
        )

    }

        filteredItems = getItemsByReportValue(4, order_data?.accumulated_data?.items);


        if(filteredItems !== undefined && filteredItems !== 'undefined'){

        printer_conn
        .size(1, 1)
        .style('r')
        .style('b')
        .tableCustom(
                [   
                    {text: `${filteredItems?.item_name} (Qty ${filteredItems?.quantity})`, align: "LEFT", width: 0.70},
                    {text: `-$${filteredItems?.business_share}`, align: "RIGHT", width: 0.20},
                ]
        )

    }

        filteredItems = getItemsByReportValue(5, order_data?.accumulated_data?.items);

        if(filteredItems !== undefined && filteredItems !== 'undefined'){

        printer_conn
        .size(1, 1)
        .style('r')
        .style('b')
        .tableCustom(
                [   
                    {text: `${filteredItems?.item_name} (Qty ${filteredItems?.quantity})`, align: "LEFT", width: 0.70},
                    {text: `$${filteredItems?.business_share}`, align: "RIGHT", width: 0.20},
                ],
                
        )

    }

        printer_conn
        .text(line1)

        if(amount_owed_to_staff == 0){
            printer_conn
        .style('b')
        .tableCustom(
                [   
                    {text: `Amount Owed to ${staff_config?.business_label}`, align: "LEFT", width: 0.70},
                    {text: `$${amount_owed_to_business}`, align: "RIGHT", width: 0.20},
                ]
        )
        }
        else{
            printer_conn
        .style('b')
        .tableCustom(
                [   
                    {text: `Amount Owed to ${order_data?.accumulated_data.staff_access_level}`, align: "LEFT", width: 0.70},
                    {text: `$${amount_owed_to_staff}`, align: "RIGHT", width: 0.20},
                ]
        )
        }
        



        // var staff_share=Number(order_data?.accumulated_data?.sold_items[1]?.staff_share).toFixed(2);
        // var business_share=Number(order_data?.accumulated_data?.sold_items[0]?.business_share).toFixed(2);
        // printer_conn
        // .style("b")
        // .text(order_data?.accumulated_data?.sold_items[1]?.item_name + ` (x${order_data?.accumulated_data?.sold_items[1]?.quantity})` +  " - "  + order_data?.accumulated_data?.sold_items[0]?.item_name + ` (x${order_data?.accumulated_data?.sold_items[0]?.quantity})`)
        // .text("$"+staff_share+generateSpaces(21,staff_share?.toString()?.length,6)+"$"+business_share)
        // .text("")

        // // .tableCustom(
        // //         [   
        // //             {text: , align: "Left", width: "0."},
        // //             // {text: , align: "Center", width: "0.10"},
        // //             // {text: , align: "Left", width: "0.50"} 
        // //         ]
        // // )

        // var amount_owed_to_staff=Number(order_data?.accumulated_data?.amount_owed_to_staff).toFixed(2);
        // var amount_owed_to_business=Number(order_data?.accumulated_data?.amount_owed_to_business).toFixed(2);
        
        // // printer_conn
        // // .style("b")
        // // .tableCustom(
        // //         [   
        // //             {text: , align: "Left", width: "0.40"},
        // //             {text: "", align: "Center", width: "0.10"},
        // //             {text: , align: "Left", width: "0.50"}
        // //         ]
        // // )
        


        // printer_conn
        // .text(`Amount Owned to Staff: $${amount_owed_to_staff}`)

        // printer_conn
        // .text(`Amount Owned to Bussiness: $${amount_owed_to_business}`)

        // printer_conn
        // .text("")
        // .style("b")
        // .text("Hours    x    Hourly Rate")
        // .text(`${hours}${generateSpaces(9,hours?.toString()?.length,1)}x         $${hourly_rate} =>    $${order_data?.accumulated_data?.staff_clockout_amount.toFixed(2)}`)

        // .tableCustom(
        //         [   
        //             {text: , align: "Left", width: "0.20"},
        //             {text: "", align: "Center", width: "0.10"},
        //             {text: "", align: "RIGHT", width: "0.30"},
        //             {text: "", align: "RIGHT", width: "0.40"},
        //         ]
        // )
        // .tableCustom(
        //         [   
        //             {text:, align: "Left", width: "0.20"},
        //             {text: "", align: "Center", width: "0.10"},
        //             {text: , align: "RIGHT", width: "0.20"},
        //             {text:` `,width:"0.40",align:"LEFT"}
        //         ]
        // )

        
        printer_conn
        .text("")
        .text("")

        printer_conn
        .size(1,1)

            .align("lt")
            .text('Signature:')
            .text("")
            .text("________________________________")
            .text("")
 
            printer_conn
            .size(1,1)
                .align("lt")
                .text(order_data?.accumulated_data?.staff_name)
                .text("")
                .text("")

    
    printer_conn
        .cut()
        .close()

}


function generateSpaces(totalSpace,amountSpace,acceptSpace=6) {
    if(amountSpace>=acceptSpace){
        totalSpace=totalSpace-amountSpace;
        return " ".repeat(totalSpace);
    }else if(amountSpace<acceptSpace){
        amountSpace=acceptSpace-amountSpace;
        totalSpace=totalSpace-acceptSpace+amountSpace;
        return " ".repeat(totalSpace);
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


function getItemsByReportValue(value, items) {
    let [filterItems]= items.filter(item => item.show_on_staff_accumulated_report == value);

  
    return filterItems;
}

