var line1 = '________________________________________________';
var line2 = '------------------------------------------------';

var line3 = '* * * * * * * * * * * *';

var payment_type_display = '';




const template_styles = require('../../config/template_styles.json');

var line4 = '';

var line_temp = '';

module.exports = {
    kitchen_printer_attribute_template_1: function (printer_conn, print_data, order_data, attributes, date_time, template_style, print_data_other) {

        try {

            print_handler(printer_conn, print_data, order_data, attributes, date_time, template_style, print_data_other);

        }
        catch (e) {
            setTimeout(function () {
                console.log('Printer is not reachable...', e);
            }, 1);
        }

    }
};


function print_handler(printer_conn, print_data, order_data, attributes, date_time, template_style, print_data_other) {

    var fire_line = '';
    var receipt_top_gap = '';

    var cut_attribute = true;

    var show_bottom_delivery_info = true;
    var show_other_stations = true;


    var show_separator_line = true;

    var show_attribute_text_kitchen = true;

    var show_customer_info_kitchen = true;

   
    var kitchen_red_font = 'B';

    if(template_styles[template_style-1].size_5 != undefined){
        size_5 = template_styles[template_style-1].size_5;
        size_6 = template_styles[template_style-1].size_6;
    }

    if(template_styles[template_style-1].show_other_stations != undefined){
        show_other_stations = template_styles[template_style-1].show_other_stations;
    }

    if(template_styles[template_style-1].show_separator_line != undefined){
        show_separator_line = template_styles[template_style-1].show_separator_line;
    }

    if(template_styles[template_style-1].receipt_top_gap != undefined){
        receipt_top_gap = template_styles[template_style-1].receipt_top_gap;
    }


    if(template_styles[template_style-1].kitchen_red_font != undefined){
        kitchen_red_font = template_styles[template_style-1].kitchen_red_font;
    }

    if (template_styles[template_style - 1].cut_attribute != undefined) {
        cut_attribute = template_styles[template_style - 1].cut_attribute;
    }


    if (template_styles[template_style - 1].show_bottom_delivery_info != undefined) {
        show_bottom_delivery_info = template_styles[template_style - 1].show_bottom_delivery_info;
    }

    if (template_styles[template_style - 1].show_attribute_text_kitchen != undefined) {
        show_attribute_text_kitchen = template_styles[template_style - 1].show_attribute_text_kitchen;
    }

    if (template_styles[template_style - 1].show_customer_info_kitchen != undefined) {
        show_customer_info_kitchen = template_styles[template_style - 1].show_customer_info_kitchen;
    }


    if (cut_attribute === false) {
        console.log('Cut attr false');
    }
    else{
        console.log('Cut attr true');
    }

    if (cut_attribute === false) {

        


        printer_conn
            .font('a')
            .beep(3, 1)
            .align('ct')
            .size(2, 2)
            .text(receipt_top_gap)

            if (order_data.reprint != undefined && order_data.reprint == true) {
                printer_conn
                    .align('ct')
                    .size(2, 2)
                    .style('b')
                    .text('[DUPLICATE]')
            }

            if (order_data.type != undefined && order_data.type == 'void') {
                printer_conn
                    .align('ct')
                    .size(2, 2)
                    .style('b')
                    .text('[VOID]')
                    .text('')
            }

            if (order_data.pos_receipt_number != undefined && order_data.pos_receipt_number != '') {
                printer_conn
                    .align('ct')
                    .size(2, 2)
                    .style('b')
                    .text('')
                    .text('Chk ' + order_data.pos_receipt_number)
            }

            if(show_customer_info_kitchen === true){

            printer_conn
                    .size(1, 1)
                    .text('\n')
                    .text('Customer Info:')
                    .size(2, 2)
                if (order_data.customer_name) {
                    printer_conn
                        .text(order_data.customer_name)

                }

            }
             

                if (order_data.table_name && order_data.table_name != '') {

                    if (order_data.fireLine != undefined && order_data.fireLine == true) {
                        fire_line = 'FIRE -> ';
                    }
                    else {
                        fire_line = '';
                    }

                    printer_conn
                        .align('ct')
                        .text(fire_line + 'Table: ' + order_data.table_name)
                }


        printer_conn
            .size(1, 1)
            .text(line1)


        printer_conn
            .align('lt')




        printer_conn
            .size(1, 1)
            .text('Date-time: ' + date_time.date + ' ' + date_time.time)

    }


    line4 = template_styles[template_style - 1].item_separator;

    var attr_count = 0;

    attributes.forEach(function (attribute) {

        attr_count = 0;

        print_data.forEach(function (order_info) {


            if ((attribute.id == order_info.attribute_id)) {
                attr_count = 1;
            }

        });

        if (attr_count) {


            if (cut_attribute === true) {
                printer_conn
                    .font('a')
                    .beep(3, 1)
                    .align('ct')
                    .size(2, 2)
                    .text(receipt_top_gap)

              

                    if (order_data.reprint != undefined && order_data.reprint == true) {
                        printer_conn
                            .align('ct')
                            .size(2, 2)
                            .style('b')
                            .text('[DUPLICATE]')
                    }

                    if (order_data.type != undefined && order_data.type == 'void') {
                        printer_conn
                            .align('ct')
                            .size(2, 2)
                            .style('b')
                            .text('[VOID]')
                            .text('')
                    }
        
                    if (order_data.pos_receipt_number != undefined && order_data.pos_receipt_number != '') {
                        printer_conn
                            .align('ct')
                            .size(2, 2)
                            .style('b')
                            .text('')
                            .text('Chk ' + order_data.pos_receipt_number)
                    }
        

                    if(show_customer_info_kitchen === true){
        
                    printer_conn
                            .size(1, 1)
                            .text('\n')
                            .text('Customer Info:')
                            .size(2, 2)
                        if (order_data.customer_name) {
                            printer_conn
                                .text(order_data.customer_name)
        
                        }

                    }
        
                     
        
                        if (order_data.table_name && order_data.table_name != '') {
        
                            if (order_data.fireLine != undefined && order_data.fireLine == true) {
                                fire_line = 'FIRE -> ';
                            }
                            else {
                                fire_line = '';
                            }
        
                            printer_conn
                                .align('ct')
                                .text(fire_line + 'Table: ' + order_data.table_name)
                        }

                


                printer_conn
                    .size(1, 1)
                    .text(line1)


                printer_conn
                    .align('lt')




                printer_conn
                    .size(1, 1)
                    .text('Date-time: ' + date_time.date + ' ' + date_time.time)

            }

            if (order_data.fireLine == undefined || order_data.fireLine == false) {


                if(show_attribute_text_kitchen === true){
            printer_conn
                .size(2, 2)
                .align('ct')
                .text(attribute.attribute_text)
                .size(1, 1)

                }
            }

            printer_conn
                .align('lt')



                if (order_data.fireLine == undefined || order_data.fireLine == false) {
            //item loop
            print_data.forEach(function (order_info) {

                if (attribute.id == order_info.attribute_id) {

                    printer_conn
                        .font('A')


                    if (order_info.menuItem == '???PRINT_LINE_1???') {
                        line_temp = line2;

                        printer_conn
                            .text('\n')
                            .text(line_temp)
                            .text('\n')

                    } else {
                        line_temp = line1;

                        printer_conn

                            .size(template_styles[template_style - 1].size_1, template_styles[template_style - 1].size_2)

                            .text(template_styles[template_style - 1].tab_qty + order_info.quantity + template_styles[template_style - 1].item_new_line + template_styles[template_style - 1].tab_item + order_info.menuItem + template_styles[template_style - 1].tab_item_2)

                    }

                    if (order_info.menuExtrasSelected != undefined && order_info.menuExtrasSelected.length > 0) {
                        printer_conn
                            .font(kitchen_red_font)
                            .size(template_styles[template_style - 1].size_3, template_styles[template_style - 1].size_4)
                    }

                    if (order_info.menuExtrasSelected) {
                        order_info.menuExtrasSelected.forEach(function (extras) {

                            if (order_data.extra_category_title_print) {
                                printer_conn
                                    .text(template_styles[template_style - 1].tab_extras + '(' + extras.heading + ')')


                            }

                            extras.optionNameSelected.forEach(function (options) {
                                

                                printer_conn
                                    .text(template_styles[template_style - 1].tab_extras + '> ' + options.name)

                            });
                        });
                    }


                    printer_conn
                        .font(kitchen_red_font)

                    if (order_info.itemInstructions != undefined && order_info.itemInstructions != '') {
                        printer_conn
                            .size(template_styles[template_style - 1].size_7, template_styles[template_style - 1].size_8)
                            .align('lt')
                            .text('Note: ' + order_info.itemInstructions)
                    }

                   if(show_separator_line == true){

                    printer_conn
                        .font('A')
                        .size(2, 2)
                        .text(line4)
                        .size(1, 1)

                    }


                }


            });

        }





            //item loop



            if (show_other_stations === true) {

                if (order_data.fireLine == undefined || order_data.fireLine == false) {

                if (print_data_other.length > 0) {



                    printer_conn
                        .text('\n')
                        .size(1, 1)
                        .align('lt')
                        .text('============================')
                        .text('BEING MADE ON OTHER STATIONS')
                        .text('============================')

                    print_data_other.forEach(function (order_info_other) {


                        if (attribute.id != order_info_other.attribute_id && order_info_other.menuItem != '???PRINT_LINE_1???') {

                            printer_conn

                                .size(template_styles[template_style - 1].size_5, template_styles[template_style - 1].size_6)

                                .text(order_info_other.quantity + ' ' + order_info_other.menuItem)


                        }



                    });


                    printer_conn
                        .text('\n')

                }

            }

            }


            if (cut_attribute === true) {


                if (order_data.instructions.cart_instruction != undefined && order_data.instructions.cart_instruction != '') {
                    printer_conn
                        .font(kitchen_red_font)
                    printer_conn
                        .size(template_styles[template_style - 1].size_7, template_styles[template_style - 1].size_8)
                        .style('i')
                        .align('lt')
                        .text(line1)
                        .text("\nOrder Instructions: " + order_data.instructions.cart_instruction)
                        .style('NORMAL')
                }


                printer_conn
                    .font('A')
                    .size(1, 1)
                    .align('ct')

                    if(show_separator_line == true){


                printer_conn
                    .text(line1)

                    }


                    if(show_bottom_delivery_info == true){

                if (!order_data.refund && !order_data.table_name) {



                    if (order_data.instructions.Type == 'Delivery') {
                        printer_conn
                            .size(1, 1)
                            .align('ct')
                            .style('b')
                            .text('Delivery Address:' + order_data.payment_info.address).marginBottom(20)

                        printer_conn
                            .size(2, 2)
                            .style('b')
                            .align('ct')

                        if (order_data.scheduled_time) {
                            printer_conn
                                .text('Delivery by:\n' + order_data.scheduled_time);
                        }

                        else if (order_data.payment_info.order_date) {
                            printer_conn
                                .text('Delivery by:\n' + order_data.payment_info.order_date + ' ' + order_data.payment_info.order_time)

                        }
                        else {
                            printer_conn
                                .size(2, 2)
                                .style('b')
                                .align('ct')

                                if(order_data.instructions.orderTypeLabel){
            
                                    printer_conn
                                    .text((order_data.instructions.orderTypeLabel).toUpperCase())
                                }   
                                else{
                                    printer_conn
                                    .text(order_data.instructions.Type)
                                }
                        }

                    }
                    else if (order_data.instructions.Type == 'Pickup') {


                        if (order_data.scheduled_time) {
                            printer_conn
                                .size(2, 2)
                                .style('b')
                                .align('ct')
                                .text('')

                                .text('Pickup\n' + order_data.scheduled_time)
                        }

                        else if (order_data.payment_info.order_date) {
                            printer_conn
                                .size(2, 2)
                                .style('b')
                                .align('ct')
                                .text('')

                                .text('Pickup\n' + order_data.payment_info.order_date + ' ' + order_data.payment_info.order_time)

                        }
                        else {
                            printer_conn
                                .size(2, 2)
                                .style('b')
                                .align('ct')

                                if(order_data.instructions.orderTypeLabel){
            
                                    printer_conn
                                    .text((order_data.instructions.orderTypeLabel).toUpperCase())
                                }   
                                else{
                                    printer_conn
                                    .text(order_data.instructions.Type)
                                }
                        }



                    } else {
                        printer_conn
                            .size(2, 2)
                            .style('b')
                            .align('ct')

                            if(order_data.instructions.orderTypeLabel){
            
                                printer_conn
                                .text((order_data.instructions.orderTypeLabel).toUpperCase())
                            }   
                            else{
                                printer_conn
                                .text(order_data.instructions.Type)
                            }
                    }

                }

                if (order_data.table_name) {
                    printer_conn
                        .size(2, 2)
                        .style('b')
                        .align('ct')
                        .text('')
                        if(order_data.instructions.orderTypeLabel){
            
                            printer_conn
                            .text((order_data.instructions.orderTypeLabel).toUpperCase())
                        }   
                        else{
                            printer_conn
                            .text(order_data.instructions.Type)
                        }

                }


                if(show_customer_info_kitchen === true){

                printer_conn
                    .size(1, 1)
                    .text('\n')
                    .text('Customer Info:')
                    .size(2, 2)
                if (order_data.customer_name) {
                    printer_conn
                        .text(order_data.customer_name)

                }

                if (order_data.customer_phone) {
                    printer_conn
                        .text(order_data.customer_phone)

                }

            }

                if (order_data.table_name && order_data.table_name != '') {

                    if (order_data.fireLine != undefined && order_data.fireLine == true) {
                        fire_line = 'FIRE -> ';
                    }
                    else {
                        fire_line = '';
                    }

                    printer_conn
                        .align('ct')
                        .text(fire_line + 'Table: ' + order_data.table_name)
                }

            }



                printer_conn
                    .size(1, 1)
                    .text(line1)
                    .align('lt')

                if (order_data.instructions.Notes) {
                    printer_conn
                        .size(1, 1)
                        .control('lf')
                        .text('Note: ' + order_data.instructions.Notes)
                        .text(line1)
                }


                if (order_data.payment_info.order_id != '' && order_data.payment_info.order_id != undefined) {

                    printer_conn
                        .font('a')
                        .align('ct')
                        .size(template_styles[template_style - 1].size_1, template_styles[template_style - 1].size_2)
                        .text('Order-ID: ' + order_data.payment_info.order_id)
                        .size(1, 1)
                        .align('lt')

                }


                if (!order_data.online) {
                    printer_conn
                    if (order_data.staff_name) {
                        printer_conn
                            .text('Staff: ' + order_data.staff_name + ' (ID:' + order_data.staff_id + ')')


                    }


                    if (order_data.hold_staff_id != undefined && order_data.hold_staff_id != '') {
                        printer_conn
                            .text('Held by: ' + order_data.hold_staff_name + ' (ID:' + order_data.hold_staff_id + ')')

                    }
                }


                if (order_data.pos_station_name != undefined && order_data.pos_station_name != '') {
                    printer_conn

                        .text('Station: ' + order_data.pos_station_name)

                }

                printer_conn
                    .size(1, 1)
                    .text('Date-time: ' + date_time.date + ' ' + date_time.time)
                    .text(line1)
                    .cut()


            }

        }

    });


    if (cut_attribute === false) {


        if (order_data.instructions.cart_instruction != undefined && order_data.instructions.cart_instruction != '') {
            printer_conn
                .font(kitchen_red_font)
            printer_conn
                .size(1, 1)
                .style('i')
                .align('lt')
                .text(line1)
                .text("\nOrder Instructions: " + order_data.instructions.cart_instruction)
                .style('NORMAL')
        }

        printer_conn
            .font('A')

        printer_conn
            .size(1, 1)
            .text(line1)
            .align('ct')


            if(show_bottom_delivery_info == true){

        if (!order_data.refund && !order_data.table_name) {



            if (order_data.instructions.Type == 'Delivery') {
                printer_conn
                    .size(1, 1)
                    .align('ct')
                    .style('b')
                    .text('Delivery Address:' + order_data.payment_info.address).marginBottom(20)

                printer_conn
                    .size(2, 2)
                    .style('b')
                    .align('ct')

                if (order_data.scheduled_time) {
                    printer_conn
                        .text('Delivery by:\n' + order_data.scheduled_time);
                }

                else if (order_data.payment_info.order_date) {
                    printer_conn
                        .text('Delivery by:\n' + order_data.payment_info.order_date + ' ' + order_data.payment_info.order_time)

                }
                else {
                    printer_conn
                        .size(2, 2)
                        .style('b')
                        .align('ct')

                        if(order_data.instructions.orderTypeLabel){
            
                            printer_conn
                            .text((order_data.instructions.orderTypeLabel).toUpperCase())
                        }   
                        else{
                            printer_conn
                            .text(order_data.instructions.Type)
                        }
                }

            }
            else if (order_data.instructions.Type == 'Pickup') {


                if (order_data.scheduled_time) {
                    printer_conn
                        .size(2, 2)
                        .style('b')
                        .align('ct')
                        .text('')

                        .text('Pickup\n' + order_data.scheduled_time)
                }

                else if (order_data.payment_info.order_date) {
                    printer_conn
                        .size(2, 2)
                        .style('b')
                        .align('ct')
                        .text('')

                        .text('Pickup\n' + order_data.payment_info.order_date + ' ' + order_data.payment_info.order_time)

                }
                else {
                    printer_conn
                        .size(2, 2)
                        .style('b')
                        .align('ct')

                        if(order_data.instructions.orderTypeLabel){
            
                            printer_conn
                            .text((order_data.instructions.orderTypeLabel).toUpperCase())
                        }   
                        else{
                            printer_conn
                            .text(order_data.instructions.Type)
                        }
                }



            } else {
                printer_conn
                    .size(2, 2)
                    .style('b')
                    .align('ct')

                    if(order_data.instructions.orderTypeLabel){
            
                        printer_conn
                        .text((order_data.instructions.orderTypeLabel).toUpperCase())
                    }   
                    else{
                        printer_conn
                        .text(order_data.instructions.Type)
                    }
            }

        }

        if (order_data.table_name) {
            printer_conn
                .size(2, 2)
                .style('b')
                .align('ct')
                .text('')
                if(order_data.instructions.orderTypeLabel){
            
                    printer_conn
                    .text((order_data.instructions.orderTypeLabel).toUpperCase())
                }   
                else{
                    printer_conn
                    .text(order_data.instructions.Type)
                }

        }


        if(show_customer_info_kitchen === true){

        printer_conn
            .size(1, 1)
            .text('\n')
            .text('Customer Info:')
            .size(2, 2)
        if (order_data.customer_name) {
            printer_conn
                .text(order_data.customer_name)

        }

        if (order_data.customer_phone) {
            printer_conn
                .text(order_data.customer_phone)

        }

    }


        if (order_data.table_name && order_data.table_name != '') {

            if (order_data.fireLine != undefined && order_data.fireLine == true) {
                fire_line = 'FIRE -> ';
            }
            else {
                fire_line = '';
            }

            printer_conn
                .align('ct')
                .text(fire_line + 'Table: ' + order_data.table_name)
        }

    }



        printer_conn
            .size(1, 1)
            .text(line1)
            .align('lt')

        if (order_data.instructions.Notes) {
            printer_conn
                .size(1, 1)
                .control('lf')
                .text('Note: ' + order_data.instructions.Notes)
                .text(line1)
        }


        if (order_data.payment_info.order_id != '' && order_data.payment_info.order_id != undefined) {

            printer_conn
                .font('a')
                .align('ct')
                .size(template_styles[template_style - 1].size_1, template_styles[template_style - 1].size_2)
                .text('Order-ID: ' + order_data.payment_info.order_id)
                .size(1, 1)
                .align('lt')

        }


        if (!order_data.online) {
            printer_conn
            if (order_data.staff_name) {
                printer_conn
                    .text('Staff: ' + order_data.staff_name + ' (ID:' + order_data.staff_id + ')')


            }


            if (order_data.hold_staff_id != undefined && order_data.hold_staff_id != '') {
                printer_conn
                    .text('Held by: ' + order_data.hold_staff_name + ' (ID:' + order_data.hold_staff_id + ')')

            }
        }


        if (order_data.pos_station_name != undefined && order_data.pos_station_name != '') {
            printer_conn

                .text('Station: ' + order_data.pos_station_name)

        }

        printer_conn
            .size(1, 1)
            .text('Print date-time: ' + date_time.date + ' ' + date_time.time)
            .text(line1)
            .cut()


    }



printer_conn
    .close()


    }
