var line1 = '________________________________________________';
var line2 = '------------------------------------------------';
var line3 = '================================================';
var line4 = '- - - - - - - - - - - - - - - - - - - - - - - -';

const template_styles = require('../../config/template_styles.json');
const { drawer_serial_port } = require('../drawer/drawer_serial_port_template');

module.exports = {
    dayclose_printer_template_1: function(printer_conn, print_data, date_time) {

        try{
       
       
        print_handler(printer_conn, print_data, date_time);

    }
    catch(e){
        setTimeout(function(){
            console.log('Printer is not reachable...', e);
        }, 1);
    }
    }
};


function print_handler(printer_conn, print_data, date_time) {

    
    var show_orders_dayclose = false;
    var show_sold_items_dayclose = false;

    if(template_styles[0].show_orders_dayclose != undefined){
        show_orders_dayclose = template_styles[0].show_orders_dayclose;
    }

    if(template_styles[0].show_sold_items_dayclose != undefined){
        show_sold_items_dayclose = template_styles[0].show_sold_items_dayclose;
    }

    var all_data = print_data.all_data;

    if(all_data.open_drawer != undefined){

        if(all_data.open_drawer == true){
            printer_conn
            .cashdraw()
            console.log('Cashdrawer opened');
            drawer_serial_port(print_data?.k_id,print_data?.printer_meta?.counter_printer_ips)
        }

    }
    else{
        printer_conn
            .cashdraw()
            console.log('Cashdrawer opened');
            drawer_serial_port(print_data?.k_id,print_data?.printer_meta?.counter_printer_ips);
    }




    printer_conn
    .font('a')
    .beep(3, 1)
    .align('ct')

    .size(2, 2)
    
    if (all_data.shift_no != undefined && all_data.shift_no != '') {
        
        printer_conn
            .text('>> POS Report <<')
            .text('\n')

        printer_conn
            .text('Shift # ' + all_data.shift_no)

            if(all_data.all_shifts[0] != undefined){

                printer_conn
                .text(all_data.all_shifts[0].staff_name + ' (ID: '+all_data.all_shifts[0].username+')')
            }

    }

    else{
        printer_conn
            .text('>> Dayclose Report <<')
    }


    printer_conn
        .font('a')
        .size(1, 1)
        .text('\n')
        .align('ct')
        .text('*** Report Start ***')
        .text('\n')
        .size(1, 1)
        .align('lt')


        printer_conn
                .tableCustom(
                    [
                        {text: "FROM: " + all_data.from, align: "LEFT"},
                    ]
                )    
                .tableCustom(
                    [
                        {text: "TO: " + all_data.to, align: "LEFT"},
                    ]
                )
                .table(["------------------------------------------------"])
                .tableCustom(
                    [
                        {text: "GROSS SALE =>", align: "LEFT"},
                        {text: "", align: "LEFT"},
                        {text: all_data.gross_sale, align: "RIGHT"}
                    ]
                )
                .table(["------------------------------------------------"])
                .tableCustom(
                    [
                        {text: "TOTAL TAX =>", align: "LEFT"},
                        {text: "", align: "LEFT"},
                        {text: all_data.total_gross_tax, align: "RIGHT"}
                    ]
                )
                .table(["------------------------------------------------"])
                .tableCustom(
                    [
                        {text: "TOTAL CRD TRANSACTIONS=>", align: "LEFT"},
                        {text: all_data.total_credit_card, align: "RIGHT"}
                    ]
                )
                .tableCustom(
                    [
                        {text: "", align: "LEFT"},
                        {text: "-DualPriceAdj =>", align: "LEFT"},
                        {text: all_data.total_cc_fee, align: "RIGHT"}
                    ]
                )
                .tableCustom(
                    [
                        {text: "", align: "LEFT"},
                        {text: "-REFUND =>", align: "LEFT"},
                        {text: all_data.credit_card_refund, align: "RIGHT"}
                    ]
                )
                .tableCustom(
                    [
                        {text: "=NET DEPOSIT =>", align: "LEFT"},
                        {text: "", align: "LEFT"},
                        {text: all_data.credit_card_net_deposit, align: "RIGHT"}
                    ]
                )
                .table(["------------------------------------------------"]) 
                .tableCustom(
                    [
                        {text: "TOTAL CASH =>", align: "LEFT"},
                        {text: "", align: "LEFT"},
                        {text: all_data.total_cash, align: "RIGHT"}
                    ]
                )
                .tableCustom(
                    [
                        {text: "", align: "LEFT"},
                        {text: "-PAYOUT =>", align: "LEFT"},
                        {text: all_data.payout, align: "RIGHT"}
                    ]
                )
                .tableCustom(
                    [
                        {text: "", align: "LEFT"},
                        {text: "-TIPS =>", align: "LEFT"},
                        {text: all_data.tips, align: "RIGHT"}
                    ]
                )
                .tableCustom(
                    [
                        {text: "", align: "LEFT"},
                        {text: "-REFUNDS =>", align: "LEFT"},
                        {text: all_data.cash_refund, align: "RIGHT"}
                    ]
                )


                if (all_data.shift_no != undefined && all_data.shift_no != '') {

                if(all_data.all_shifts[0] != undefined && all_data.all_shifts[0].cash_drawer_values_start != undefined && all_data.all_shifts[0].cash_drawer_values_start.grand_total != undefined && all_data.all_shifts[0].cash_drawer_values_start.grand_total != null){

                    printer_conn    
                    .tableCustom(
                        [
                            {text: "", align: "LEFT"},
                            {text: "CASH D. OPEN =>", align: "LEFT"},
                            {text: all_data.all_shifts[0].cash_drawer_values_start.grand_total, align: "RIGHT"}
                        ]
                    )
    
                    }


                    

            if(all_data.all_shifts[0] != undefined && all_data.all_shifts[0].cash_drawer_values_end != undefined && all_data.all_shifts[0].cash_drawer_values_end.grand_total != undefined && all_data.all_shifts[0].cash_drawer_values_end.grand_total != null){

                printer_conn    
                .tableCustom(
                    [
                        {text: "", align: "LEFT"},
                        {text: "CASH D. CLOSE =>", align: "LEFT"},
                        {text: all_data.all_shifts[0].cash_drawer_values_end.grand_total, align: "RIGHT"}
                    ]
                )

                }

            }

            printer_conn   
                .tableCustom(
                    [
                        {text: "=NET CASH =>", align: "LEFT"},
                        {text: "", align: "LEFT"},
                        {text: all_data.net_cash, align: "RIGHT"}
                    ]
                )
                .table(["------------------------------------------------"])   
                .tableCustom(
                    [
                        {text: "NET SALE =>", align: "LEFT"},
                        {text: "", align: "LEFT"},
                        {text: all_data.net_sale, align: "RIGHT"}
                    ]
                )
                .table(["------------------------------------------------"])  
                .tableCustom(
                    [
                        {text: "CASH TRANSACTIONS =>", align: "LEFT"},
                        {text: all_data.cash_transaction, align: "RIGHT"}
                    ]
                )
                .tableCustom(
                    [
                        {text: "CRD TRANSACTIONS =>", align: "LEFT"},
                        {text: all_data.credit_card_transaction, align: "RIGHT"}
                    ]
                )

                .table(["------------------------------------------------"])  
                .tableCustom(
                    [
                        {text: "DAY SUMMARY", align: "CENTER"}
                    ]
                )
                .tableCustom(
                    [
                        {text: "TOTAL VOIDS =>", align: "LEFT"},
                        {text: all_data.total_voids, align: "RIGHT"}
                    ]
                )
                
                .tableCustom(
                    [
                        {text: "Total Deleted =>", align: "LEFT"},
                        {text: all_data.total_errors, align: "RIGHT"}
                    ]
                )
                .tableCustom(
                    [
                        {text: "TOTAL REFUNDS =>", align: "LEFT"},
                        {text: all_data.total_refund, align: "RIGHT"}
                    ]
                )
                .tableCustom(
                    [
                        {text: "TOTAL NO SALE =>", align: "LEFT"},
                        {text: all_data.total_no_sale, align: "RIGHT"}
                    ]
                )
                .tableCustom(
                    [
                        {text: "TOTAL TIPS =>", align: "LEFT"},
                        {text: all_data.total_tips_count, align: "RIGHT"}
                    ]
                )
                .tableCustom(
                    [
                        {text: "TOTAL TIPS PAYOUT =>", align: "LEFT"},
                        {text: all_data.tip_payout, align: "RIGHT"}
                    ]
                )
                .tableCustom(
                    [
                        {text: "GIFTCARDS SOLD =>", align: "LEFT"},
                        {text: all_data.giftcard, align: "RIGHT"}
                    ]
                )

                 .tableCustom(
                    [
                        {text: "GIFTCARDS USED =>", align: "LEFT"},
                        {text: all_data.giftcard_used_in_orders, align: "RIGHT"}
                    ]
                )

                .tableCustom(
                    [
                        {text: "Ext. GIFTCARDS REFUND =>", align: "LEFT"},
                        {text: all_data.external_giftcard_refund_in_orders, align: "RIGHT"}
                    ]
                )

                if (all_data.total_service_charge) {
                    printer_conn
                    .tableCustom(
                        [
                            {text: "TOTAL SERVICE CHG. =>", align: "LEFT"},
                            {text: all_data.total_service_charge, align: "RIGHT"}
                        ]
                    )
                }

                if(all_data.cash_discount.length > 0){
                    printer_conn
                    .table(["------------------------------------------------"])
                    .tableCustom(
                        [
                            {text: "CASH DISCOUNTS", align: "CENTER"}
                        ]
                    )
                    .tableCustom(
                        [
                            {text: 'TOTAL CASH DISCOUNT =>', align: "LEFT"},
                            {text: all_data.cash_discount_total + ' (' + all_data.cash_discount_count + ')', align: "RIGHT"}
                        ]
                    )
                    }
    
                    for(var i = 0; i < all_data.cash_discount.length; i++){
                        printer_conn
                        .tableCustom(
                            [   
                                {text: "", align: "LEFT"},
                                {text: all_data.cash_discount[i].discount_name + ' =>', align: "LEFT"},
                                {text: all_data.cash_discount[i].value, align: "RIGHT"}
                            ]
                        )
                    }
                

                if(all_data.discounts.length > 0){
                printer_conn
                .table(["------------------------------------------------"])
                .tableCustom(
                    [
                        {text: "DISCOUNTS", align: "CENTER"}
                    ]
                )
                }

                for(var i = 0; i < all_data.discounts.length; i++){
                    printer_conn
                    .tableCustom(
                        [
                            {text: all_data.discounts[i].discount_name + ' =>', align: "LEFT"},
                            {text: all_data.discounts[i].value, align: "RIGHT"}
                        ]
                    )
                }

                printer_conn    
                .table(["------------------------------------------------"])
                .tableCustom(
                    [
                        {text: "POINTS USED =>", align: "LEFT"},
                        {text: all_data.points_used, align: "RIGHT"}
                    ]
                )
                

                if(all_data.all_shifts.length > 0){

                printer_conn    

                .table(["------------------------------------------------"])
                
                .tableCustom(
                    [
                        {text: "ALL SHIFTS", align: "CENTER"}
                    ]
                )

                }

                var staff_username = '';
                
                for(var i = 0; i < all_data.all_shifts.length; i++){

                    if(all_data.all_shifts[i].username != undefined){
                        staff_username = ' (ID: '+all_data.all_shifts[i].username+')';
                    }
                    else{
                        staff_username = '';
                    }

                    printer_conn
                    .tableCustom(
                        [
                            {text: 'SHIFT# ' + all_data.all_shifts[i].shift_no, align: "LEFT"},
                        ]
                    )
                    .tableCustom(
                        [
                            {text: 'START: ' + all_data.all_shifts[i].start, align: "LEFT"},
                        ]
                    )
                    .tableCustom(
                        [
                            {text: 'END: ' + all_data.all_shifts[i].end, align: "LEFT"},
                        ]
                    )
                    .tableCustom(
                        [
                            {text: 'STAFF: ' + all_data.all_shifts[i].staff_name + staff_username, align: "LEFT"},
                        ]
                    )
                    .tableCustom(
                        [
                            {text: "", align: "LEFT"},
                            {text: "TOTAL CRD =>", align: "LEFT"},
                            {text: all_data.all_shifts[i].total_credit_card, align: "RIGHT"}
                        ]
                    )
                    .tableCustom(
                        [
                            {text: "", align: "LEFT"},
                            {text: "TOTAL CASH =>", align: "LEFT"},
                            {text: all_data.all_shifts[i].total_cash, align: "RIGHT"}
                        ]
                    )
                    .tableCustom(
                        [
                            {text: "", align: "LEFT"},
                            {text: "TOTAL PAYOUT =>", align: "LEFT"},
                            {text: all_data.all_shifts[i].total_payout, align: "RIGHT"}
                        ]
                    )
                    .tableCustom(
                        [
                            {text: "", align: "LEFT"},
                            {text: "TOTAL TIPS =>", align: "LEFT"},
                            {text: all_data.all_shifts[i].tip, align: "RIGHT"}
                        ]
                    )



                        if(all_data.all_shifts[i].cash_drawer_values_start != undefined && all_data.all_shifts[i].cash_drawer_values_start.grand_total != undefined && all_data.all_shifts[i].cash_drawer_values_start.grand_total != null){

                            printer_conn    
            
                            
                            .tableCustom(
                                [
                                    {text: "", align: "LEFT"},
                                    {text: "CASH D. OPEN =>", align: "LEFT"},
                                    {text: all_data.all_shifts[i].cash_drawer_values_start.grand_total, align: "RIGHT"}
                                ]
                            )
            
                            }


                            

                    if(all_data.all_shifts[i].cash_drawer_values_end != undefined && all_data.all_shifts[i].cash_drawer_values_end.grand_total != undefined && all_data.all_shifts[i].cash_drawer_values_end.grand_total != null){

                        printer_conn    
        
                        
                        .tableCustom(
                            [
                                {text: "", align: "LEFT"},
                                {text: "CASH D. CLOSE =>", align: "LEFT"},
                                {text: all_data.all_shifts[i].cash_drawer_values_end.grand_total, align: "RIGHT"}
                            ]
                        )
        
                        }



if(all_data.all_shifts[0] != undefined && all_data.all_shifts[i].cash_drawer_values_end != undefined){

    printer_conn    
    .tableCustom(
        [
            {text: "CASH DRAWER", align: "CENTER"}
        ]
    )   
    .tableCustom(
        [   
            {text: '1c', align: "LEFT"}, 
            {text: all_data.all_shifts[i].cash_drawer_values_end.one_cent, align: "LEFT"},
            {text: '$1', align: "LEFT"},
            {text: all_data.all_shifts[i].cash_drawer_values_end.one_dollar, align: "LEFT"},
        ]
    )

    .tableCustom(
        [   
            {text: '5c', align: "LEFT"}, 
            {text: all_data.all_shifts[i].cash_drawer_values_end.five_cent, align: "LEFT"},
            {text: '$5', align: "LEFT"},
            {text: all_data.all_shifts[i].cash_drawer_values_end.five_dollar, align: "LEFT"},
        ]
    )

    .tableCustom(
        [   
            {text: '10c', align: "LEFT"}, 
            {text: all_data.all_shifts[i].cash_drawer_values_end.ten_cent, align: "LEFT"},
            {text: '$10', align: "LEFT"},
            {text: all_data.all_shifts[i].cash_drawer_values_end.ten_dollar, align: "LEFT"},
        ]
    )

    .tableCustom(
        [   
            {text: '25c', align: "LEFT"}, 
            {text: all_data.all_shifts[i].cash_drawer_values_end.twentyFive_cent, align: "LEFT"},
            {text: '$20', align: "LEFT"},
            {text: all_data.all_shifts[i].cash_drawer_values_end.twenty_dollar, align: "LEFT"},
        ]
    )

    .tableCustom(
        [   
            {text: '50c', align: "LEFT"}, 
            {text: all_data.all_shifts[i].cash_drawer_values_end.fifty_cent, align: "LEFT"},
            {text: '$50', align: "LEFT"},
            {text: all_data.all_shifts[i].cash_drawer_values_end.fifty_dollar, align: "LEFT"},
        ]
    )

    .tableCustom(
        [   
            {text: 'Other', align: "LEFT"}, 
            {text: all_data.all_shifts[i].cash_drawer_values_end.other_amount, align: "LEFT"},
            {text: '$100', align: "LEFT"},
            {text: all_data.all_shifts[i].cash_drawer_values_end.hundred_dollar, align: "LEFT"},
        ]
    )

    .tableCustom(
        [   
            {text: 'TOTAL', align: "LEFT"}, 
            {text: all_data.all_shifts[i].cash_drawer_values_end.grand_total, align: "CENTER"}
        ]
    )

}

                            
                  


                }


                if(all_data.online_orders != undefined){

                    printer_conn    
            .table(["------------------------------------------------"])
            .tableCustom(
                [
                    {text: "ONLINE ORDERS", align: "CENTER"}
                ]
            )   
            .tableCustom(
                [
                    {text: "CRD AMOUNT =>", align: "LEFT"},
                    {text: all_data.online_orders.credit_amount, align: "RIGHT"}
                ]
            )
            .tableCustom(
                [
                    {text: "CASH AMOUNT =>", align: "LEFT"},
                    {text: all_data.online_orders.cash_amount, align: "RIGHT"}
                ]
            )
            .tableCustom(
                [
                    {text: "TIP AMOUNT =>", align: "LEFT"},
                    {text: all_data.online_orders.tip, align: "RIGHT"}
                ]
            )
            .tableCustom(
                [
                    {text: "TOTAL AMOUNT =>", align: "LEFT"},
                    {text: all_data.online_orders.total, align: "RIGHT"}
                ]
            )
    
                    }


                    if (all_data.platform_orders != undefined) {

                        printer_conn
                            .table(["------------------------------------------------"])
                            .tableCustom(
                                [
                                    { text: "PLATFORM ORDERS", align: "CENTER" }
                                ]
                            )
                
                            for (var index = 0; index < all_data.platform_orders.length; index++) {
                
                                printer_conn
                                .tableCustom(
                                    [
                                        { text:all_data.platform_orders[index].platform, align: "LEFT" },
                                        { text: "$"+all_data.platform_orders[index].total+" (#"+all_data.platform_orders[index].orders_count+")", align: "RIGHT" },
                                    ]
                                )
                            }
                
                    }
                


                    if(all_data.commission != undefined){

                        if(all_data.commission.length > 0){

                        printer_conn    
                        .table(["------------------------------------------------"])
                        .tableCustom(
                            [
                                {text: "COMMISSIONS", align: "CENTER"}
                            ]
                        )   
                        .tableCustom(
                            [   
                                {text: 'NAME', align: "LEFT"}, 
                                {text: 'AMOUNT', align: "RIGHT"}
                            ]
                        )

                        }
        
                        
    
                        for(var i = 0; i < all_data.commission.length; i++){
    
                      
                            try{
    
                            printer_conn
                            .tableCustom(
                                [   
                                    {text: all_data.commission[i].stylist_name + ' (ID: '+all_data.commission[i].stylist_id+')', align: "LEFT"}, 
                                    {text: all_data.commission[i].commission, align: "RIGHT"}
                                ]
                        )
                            }
                            catch(e){
                                
                            }
                            
    
    
                        } 

                    }


                    if(show_sold_items_dayclose === true){    

                if(all_data.sold_items.length > 0){

                    

                    printer_conn    
                    .table(["------------------------------------------------"])
                    .tableCustom(
                        [
                            {text: "CATEGORY SALES", align: "CENTER"}
                        ]
                    )   
                    .tableCustom(
                        [   
                            {text: 'NAME', align: "LEFT"}, 
                            {text: 'QTY', align: "RIGHT"},
                            {text: 'AMOUNT', align: "RIGHT"}
                        ]
                    )
    
                    }

                    for(var i = 0; i < all_data.sold_items.length; i++){

                  
                        try{

                        printer_conn
                        .tableCustom(
                            [   
                                {text: all_data.sold_items[i].item_name, align: "LEFT"}, 
                                {text: all_data.sold_items[i].qty, align: "RIGHT"},
                                {text: all_data.sold_items[i].total, align: "RIGHT"}
                            ]
                    )
                        }
                        catch(e){
                            printer_conn
                            .tableCustom(
                                [   
                                    {text: 'UNDEFINED', align: "LEFT"}, 
                                    {text: all_data.sold_items[i].qty, align: "RIGHT"},
                                    {text: all_data.sold_items[i].total, align: "RIGHT"}
                                ]
                        )
                        }
                        


                    } 

                }


                    if(show_orders_dayclose === true){

                    if(all_data.orders.length > 0){


                        printer_conn    
                        .table(["------------------------------------------------"])
                        .tableCustom(
                            [
                                {text: "TRANSACTIONS", align: "CENTER"}
                            ]
                        )   
                        .tableCustom(
                            [   
                                {text: 'ORDER#', align: "LEFT"}, 
                                {text: 'AMOUNT', align: "RIGHT"},
                                {text: 'TABLE', align: "RIGHT"}
                            ]
                        )
        
                        }
    
                        for(var i = 0; i < all_data.orders.length; i++){
    
                      
                            try{

                                if((all_data.orders[i].payment_method) == 'Cash'){
                                    all_data.orders[i].payment_method = 'c';
                                }
                                else{
                                    all_data.orders[i].payment_method = 'crd';
                                }
    
                            printer_conn
                            .tableCustom(
                                [   
                                    {text: all_data.orders[i].order_number, align: "LEFT"}, 
                                    {text: all_data.orders[i].total + ' (' + all_data.orders[i].payment_method + ')', align: "RIGHT"},
                                    {text: all_data.orders[i].table_name, align: "RIGHT"}
                                ]
                        )
                            }
                            catch(e){
                                console.log(e);
                            }
                            
    
    
                        } 

                        printer_conn
                        .text('') 
                        .tableCustom(
                            [
                                {text: "c: cash, crd: card", align: "LEFT"}
                            ]
                        )


                    }

                   

               


        printer_conn
        .text('\n\n')
        .size(1, 1)
        .align('ct')
        .text('*** Report End ***')
        .text(line1)
        .size(2, 2)
        .align('lt') 

        .text(print_data.business_info.name)
        .size(1, 1)
        .text(print_data.business_info.address)
        .size(1, 1)
        .text('Staff ID: ' + print_data.staff_id)

        .size(1, 1)
        .text('Staff Name: ' + print_data.staff_name)
        .size(1, 1)

        .text('Print date-time: ' + date_time.date + ' ' + date_time.time)


        printer_conn
            .text(line1)

            .size(1, 1)

            .align('ct')
            .text('Powered by Pocket Systems, LLC.')
            .text('')

       printer_conn             
        .cut()
        .close()



}