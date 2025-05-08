var line1 = '________________________________________________';
var line2 = '------------------------------------------------';
var line3 = '================================================';

var line_temp = '';

const escpos = require('escpos');

const path = require('path');

const template_styles = require('../../config/template_styles.json');

module.exports = {
    appointment_printer_template_1: function(printer_conn, print_data, date_time) {
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

    var all_data = print_data;    


  
        
        escpos.Image.load(path.join(__dirname, '../../config/', '', 'logo.png'), (image) => {
            console.log("PRINTING IMAGE");
            printer_conn
                .align('ct')
                .image(image)
        });
    
    

        setTimeout(function(){
        

    

    printer_conn
        .size(2, 2)
        .align('ct')
        .text('Booking Receipt')
        .text('\n')

        printer_conn
        
        .size(1, 1)
        .text(line3)
        .style('b')
        .tableCustom(
            [   
                {text: 'Booking ID', align: "LEFT"}, 
                {text: all_data.txnref, align: "RIGHT"}
            ])
            .tableCustom(
                [   
                    {text: 'Status', align: "LEFT"}, 
                    {text: all_data.status, align: "RIGHT"}
                ])
        .tableCustom(
            [   
                {text: 'Customer Name', align: "LEFT"}, 
                {text: all_data.name, align: "RIGHT"}
            ])
            .tableCustom(
            [   
                {text: 'Customer ID', align: "LEFT"}, 
                {text: all_data.udid, align: "RIGHT"}
            ])
            .tableCustom(  
                    [   
                        {text: 'Customer Phone', align: "LEFT"}, 
                        {text: all_data.phone, align: "RIGHT"}
                    ])
                    .tableCustom(
                    [   
                        {text: 'Service', align: "LEFT"}, 
                        {text: all_data.service_name, align: "RIGHT"}
                    ])
                    .tableCustom(
                    [   
                        {text: 'Stylist Name', align: "LEFT"}, 
                        {text: all_data.stylist_name, align: "RIGHT"}
                    ])
                    .tableCustom(
                        [   
                            {text: 'Booking Date', align: "LEFT"}, 
                            {text: all_data.date, align: "RIGHT"}
                        ])
                    .tableCustom(
                    [   
                        {text: 'Booking Time', align: "LEFT"}, 
                        {text: all_data.time_slot, align: "RIGHT"}
                    ])
                    .tableCustom(
                    [   
                        {text: 'Booking Notes', align: "LEFT"}, 
                        {text: all_data.notes, align: "RIGHT"}
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

}, 1000);


}


