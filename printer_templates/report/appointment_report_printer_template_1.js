var line1 = '________________________________________________';
var line2 = '------------------------------------------------';
var line3 = '================================================';

var line_temp = '';

module.exports = {
    appointment_report_printer_template_1: function(printer_conn, print_data, date_time) {
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

    var all_data = print_data.all_data;    

  

    printer_conn
        .size(2, 2)
        .align('ct')
        .text('>>>> RIDER REPORT <<<<')
        .text('\n')
        .text('Name: ' + all_data.rider_name + '('+all_data.rider_id+')')
        .text('\n')

        printer_conn
        
        .size(1, 1)
        .text(line3)
        .style('b')
        .tableCustom(
            [   
                {text: 'START DATE-TIME =>', align: "LEFT"}, 
                {text: all_data.start, align: "RIGHT"}
            ])
            .tableCustom(
            [   
                {text: 'END DATE-TIME =>', align: "LEFT"}, 
                {text: all_data.end, align: "RIGHT"}
            ])
            .tableCustom(  
                    [   
                        {text: 'TOTAL DELIVERIES =>', align: "LEFT"}, 
                        {text: all_data.deliveries, align: "RIGHT"}
                    ])
                    .tableCustom(
                    [   
                        {text: 'CASH AMOUNT =>', align: "LEFT"}, 
                        {text: all_data.cash_amount, align: "RIGHT"}
                    ])
                    .tableCustom(
                    [   
                        {text: 'CC AMOUNT =>', align: "LEFT"}, 
                        {text: all_data.cc_amount, align: "RIGHT"}
                    ])
                    .tableCustom(
                        [   
                            {text: 'DELIVERY AMOUNT =>', align: "LEFT"}, 
                            {text: all_data.delivery_amount, align: "RIGHT"}
                        ])
                    .tableCustom(
                    [   
                        {text: 'CC TIP =>', align: "LEFT"}, 
                        {text: all_data.cc_tip, align: "RIGHT"}
                    ])
                    .tableCustom(
                    [   
                        {text: 'AMOUNT DUE =>', align: "LEFT"}, 
                        {text: all_data.due_amount, align: "RIGHT"}
                    ])
                




      
        
        printer_conn
            .align('lt')
            .text(line1)
            .size(1, 1)
            .style('b')
            .text(print_data.business_info.name)
            .size(1, 1)
            .text(print_data.business_info.address)


        printer_conn
            .text('Staff ID: ' + print_data.staff_id)

            printer_conn
                .text('Staff name: ' + print_data.staff_name)

                printer_conn
                .size(1, 1)
                .text('Print date-time: ' + date_time.date + ' ' + date_time.time)
      
        

        printer_conn
        .text(line1)

        .size(1, 1)

        .align('ct')
        .text('Powered by Mikronexus, inc.')
        .text('')


printer_conn
    .cut()
    .close()

}


