var line1 = '________________________________________________';
var line2 = '------------------------------------------------';
var line3 = '================================================';
var line4 = '- - - - - - - - - - - - - - - - - - - - - - - -';


const escpos = require('escpos');

const path = require('path');


const templateStylesPath = path.join(__dirname, '../../config/template_styles.json');
const staffConfigPath = path.join(__dirname, '../../config/staff_config.json');

const template_styles = require(templateStylesPath);
const staff_config = require(staffConfigPath);

module.exports = {
    staff_counter_printer_template_clock: function (printer_conn, order_data, date_time, template_style,title) {

        try {
            print_handler(printer_conn, order_data, date_time, template_style,title);

        }
        catch (e) {
            setTimeout(function () {
                console.log('Printer is not reachable...', e);
            }, 1);
        }

    }
}


function print_handler(printer_conn, order_data, date_time, template_style,title) {
    
    console.log("----------------------clock------------------------");
    
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
        .text(`${staff_config.staff} ${title} Receipt`)
        if(order_data?.clock_in_out_staff_data?.clock_out_staff_nickname!=null){

            printer_conn
            .align('ct')
            .size(1, 1)
            .style('b')    
            .text(order_data?.clock_in_out_staff_data?.clock_out_staff_nickname)
        }



            printer_conn
            .text('')
            .size(1,1)
            .align("lt")
            .text('Name')
            .text(order_data?.clock_in_out_staff_data?.clock_out_staff_name)
            .text("")   
        

        printer_conn
        .size(1,1)   
        .align("lt")
        .text('Date')
        .text(order_data?.clock_in_out_staff_data?.clock_in_date)   
        .text("")   

        printer_conn
        .size(1,1)
        .align("lt")
        .text('Time In')
        .text(order_data?.clock_in_out_staff_data?.clock_in_time)   
        .text("")   

        if(order_data?.clock_in_out_staff_data?.clock_out_time){

            printer_conn
            .size(1,1)
            .align("lt")
            .text('Time Out')
            .text(order_data?.clock_in_out_staff_data?.clock_out_time)   
            .text("")   

        }

        printer_conn
        .align("Rt")
        .text("")
        .text('*****************') // Print the top line of the box
        .text(`*         ${staff_config.count} *`) // Your content here
        .text('*               *') // Print the sides of the box
        .text('*               *') // Print the sides of the box
        .text('*               *') // Print the sides of the box
        .text('*               *') // Print the sides of the box
        .text('*****************') // Print t
        .text('') // Print t



        printer_conn
        .align("Lt")
        .text('*****************              *****************') // Print the top line of the box
        .text(`*     ${staff_config.incentive} *              *          ${staff_config.Rent} *`) // Your content here
        .text('*               *              *               *') // Print the sides of the box
        .text('*               *              *               *') // Print the sides of the box
        .text('*               *              *               *') // Print the sides of the box
        .text('*               *              *               *') // Print the sides of the box
        .text('*****************              *****************') // Print t
        

        printer_conn
        .text("")
        .text("")
        .text("")


        printer_conn
        .size(1,1)

            .align("lt")
            .text('Manager________________________________')
           .text("")
           .text("")
           .text("")

 

    
    printer_conn
        .cut()
        .close()

}