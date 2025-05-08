var line1 = '________________________________________________';
var line2 = '------------------------------------------------';


var line3 = '* * * * * * * * * * * *';

const template_styles = require('../../config/template_styles.json');

var line4 = '';

var payment_type_display = '';

var line_temp = '';

module.exports = {
    kitchen_printer_template_1: function(printer_conn, print_data, order_data, date_time, template_style, print_data_other, attr_id_main = [], attr_arr = [], runner_flag = false) {
       
       try{
           
        print_handler(printer_conn, print_data, order_data, date_time, template_style, print_data_other, attr_id_main, attr_arr, runner_flag);

    }
    catch(e){
        setTimeout(function(){
            console.log('Printer is not reachable...', e);
        }, 1);
    }

    }
};


function print_handler(printer_conn, print_data, order_data, date_time, template_style, print_data_other, attr_id_main, attr_arr, runner_flag) {


    var fire_line = '';
    var receipt_top_gap = '';
    var kitchen_red_font = 'B';

    var show_bottom_delivery_info = true;

    var show_other_stations = true;


    var show_separator_line = true;

    var item_extras_attr_list = [];

    var print_item_flag = false;

    var kitchen_red_font = 'B';

    var show_attribute_text_kitchen = true;

    var show_customer_info_kitchen = true;


    
    if (template_styles[template_style - 1].show_attribute_text_kitchen != undefined) {
        show_attribute_text_kitchen = template_styles[template_style - 1].show_attribute_text_kitchen;
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

    if (template_styles[template_style - 1].show_bottom_delivery_info != undefined) {
        show_bottom_delivery_info = template_styles[template_style - 1].show_bottom_delivery_info;
    }


    if (template_styles[template_style - 1].show_customer_info_kitchen != undefined) {
        show_customer_info_kitchen = template_styles[template_style - 1].show_customer_info_kitchen;
    }



    line4 = template_styles[template_style-1].item_separator;


        
        
       
        if (order_data.fireLine == undefined || order_data.fireLine == false) {



            if(runner_flag === true){
                printer_conn
                .size(template_styles[template_style-1].size_1, template_styles[template_style-1].size_2)
                .align('ct')
                .text('--RUNNER--')
                .align('lt')
            }

    var print_attr_name_flag = true; 
    var previous_attr_id = 0;
    var any_item_flag = false;

    var printed_items_list = [];

    print_data.push({attribute_id: 'last'});
    //item loop
    print_data.forEach(function(order_info) {



        console.log('any_item_flag', any_item_flag, previous_attr_id, order_info.attribute_id);

        if(any_item_flag === true && show_attribute_text_kitchen === true && attr_arr.length > 0 && print_attr_name_flag === true && previous_attr_id !== order_info.attribute_id){

            any_item_flag = false;

            if (order_data.instructions.cart_instruction != undefined && order_data.instructions.cart_instruction != '') {

                printer_conn
                .font(kitchen_red_font)
                printer_conn
                    .size(1, 1)
                    .style('i')
                    .align('lt')
                    .text(line1)
                    .text("Order Instructions: " + order_data.instructions.cart_instruction)
                    .style('NORMAL')
            }
        
        
            printer_conn
            .font('A')
        
            printer_conn
                //Instructions
                .size(1, 1)
                .text(line1)
                .align('ct')
        
                if(show_bottom_delivery_info === true){
        
                if (!order_data.refund && !order_data.table_name) {
                    if (order_data.instructions.Type == 'Delivery') {
                        printer_conn
                            .size(1, 1)
                            .align('ct')
                            .style('b')
                            .text('Delivery Address:' + order_data.payment_info.address).marginBottom(20)
        
                        printer_conn
                            .size(1, 2)
                            .style('b')
                            .align('ct')
        
                            if (order_data.scheduled_time) {
                                printer_conn
                                .text('Delivery by:')
                                .text(order_data.scheduled_time);
                            }
        
                        else if (order_data.payment_info.order_date) {
                            printer_conn
                                .text('Delivery by:')
                                .text(order_data.payment_info.order_date + ' ' + order_data.payment_info.order_time)
        
                        }
                        else {
                            printer_conn
                                .size(1, 2)
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
                            .size(1, 2)
                            .style('b')
                            .align('ct')
                            .text('Pickup')
                            .text(order_data.scheduled_time)
                        }
        
                    else if (order_data.payment_info.order_date) {
                        printer_conn
                            .size(1, 2)
                            .style('b')
                            .align('ct')
                            .text('Pickup')
                            .text(order_data.payment_info.order_date + ' ' + order_data.payment_info.order_time)
        
                    }
        
                    else {
                        printer_conn
                            .size(1, 2)
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
                            .size(1, 2)
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
                        .size(1, 2)
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
        
        
                if(show_customer_info_kitchen === true){
        
                printer_conn
                .size(1, 1) 
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
        
                if(order_data.fireLine != undefined && order_data.fireLine == true){
                    fire_line = 'FIRE -> ';
                }
                else{
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


                        if (order_info_other.menuItem != '???PRINT_LINE_1???' && printed_items_list.indexOf(order_info_other.uniqueId) == -1) {

                            printer_conn

                                .size(template_styles[template_style - 1].size_5, template_styles[template_style - 1].size_6)

                                .text(order_info_other.quantity + ' ' + order_info_other.menuItem)


                        }



                    });


                    printed_items_list = [];


                    printer_conn
                        .text('\n')

                }

            }

            }
        
        
            if(order_data.payment_info.order_id != '' && order_data.payment_info.order_id != undefined){
        
                printer_conn
                .font('a')
                .align('ct')
                .size(template_styles[template_style-1].size_1, template_styles[template_style-1].size_2)
                .text('Order-ID: ' + order_data.payment_info.order_id)
                .size(1, 1)
                .align('lt')
        
            }
        
        
        
        
            if (!order_data.online) {
                printer_conn
                if (order_data.staff_name) {
                    printer_conn
                        .text('Staff: ' + order_data.staff_name + ' (ID:'+order_data.staff_id+')')
        
                        
                }
        
        
                if (order_data.hold_staff_id != undefined && order_data.hold_staff_id != '') {
                    printer_conn
                        .text('Held by: ' + order_data.hold_staff_name + ' (ID:'+order_data.hold_staff_id+')')
        
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
                .text('')
                .text('')
                .cut()

        }






      

        if ((isItemIdInArray(attr_id_main, order_info.attribute_id) === true) || attr_id_main.length == 0 || order_info.menuItem == '???PRINT_LINE_1???') {
            print_item_flag = true;
        }
        else{

            item_extras_attr_list = [];

            if(order_info.menuExtrasSelected != undefined && order_info.menuExtrasSelected.length > 0){

            order_info.menuExtrasSelected.forEach((ord_ext_item) => {

               

                if ((isItemIdInArray(attr_id_main, ord_ext_item.attribute_id) === true)){

                
                        item_extras_attr_list.push(ord_ext_item);
                }

            });

        }

            if(item_extras_attr_list.length > 0){
                order_info.menuExtrasSelected = item_extras_attr_list;
                print_item_flag = true;
            }
            else{
                print_item_flag = false;
            }
            

        }

        if((print_item_flag === true) || (runner_flag === true)){


            if(order_info.attribute_id !== 'last' && any_item_flag === false && show_attribute_text_kitchen === true && attr_arr.length > 0 && print_attr_name_flag === true && previous_attr_id !== order_info.attribute_id){


                printer_conn
                .font('A')
                .beep(3, 1)
                .align('ct')
                .size(1, 1)
                .text(receipt_top_gap)
            
            
                if (order_data.reprint != undefined && order_data.reprint == true) {
                    printer_conn
                        .align('ct')
                        .size(1, 2)
                        .style('b')
                        .text('[DUPLICATE]')
                }
            
                if (order_data.type != undefined && order_data.type == 'void') {
                    printer_conn
                        .align('ct')
                        .size(1, 2)
                        .style('b')
                        .text('[VOID]')
                }
            
            
                if (order_data.pos_receipt_number != undefined && order_data.pos_receipt_number != '') {
                    printer_conn
                        .align('ct')
                        .size(1, 2)
                        .style('b')
                        .text('Chk ' + order_data.pos_receipt_number)
                        
                }
            
            
               if(show_customer_info_kitchen === true){ 
            
                printer_conn
                .size(1, 1)
             .text('Customer Info:')   
            .size(2, 2)
            if (order_data.customer_name) {
                printer_conn
                    .text(order_data.customer_name)
            
            }
            
            }
               
            
            if (order_data.table_name && order_data.table_name != '') {
            
                if(order_data.fireLine != undefined && order_data.fireLine == true){
                    fire_line = 'FIRE -> ';
                }
                else{
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
                .text('Print date-time: ' + date_time.date + ' ' + date_time.time)
            
                
                printer_conn
                .size(1, 1)
            
                        }




            let attribute_name = '';
         
            if(show_attribute_text_kitchen === true && attr_arr.length > 0 && print_attr_name_flag === true && previous_attr_id !== order_info.attribute_id){

                any_item_flag = true;

                attribute_name = get_attribute_name(attr_arr, order_info.attribute_id);

                
                 
                if(attribute_name !== false && runner_flag === false){
                    
                 previous_attr_id = order_info.attribute_id;
                         printer_conn
                             .size(template_styles[template_style-1].size_1, template_styles[template_style-1].size_2)
                             .align('ct')
                             .text('--'+attribute_name+'--')
                             .align('lt')
                }
     
             }

        printer_conn
        .font('A')
    
        if (order_info.menuItem == '???PRINT_LINE_1???') {
            line_temp = line2;

            printer_conn
                
                .size(1, 2)
                .text(line_temp)
                
                
        } else {

            printed_items_list.push(order_info.uniqueId);

            line_temp = line1;


                printer_conn
                
                .size(template_styles[template_style-1].size_1, template_styles[template_style-1].size_2)
                
                .text(template_styles[template_style-1].tab_qty+order_info.quantity+template_styles[template_style-1].item_new_line+template_styles[template_style-1].tab_item+ order_info.menuItem+template_styles[template_style-1].tab_item_2)

        }

        if(order_info.menuExtrasSelected != undefined && order_info.menuExtrasSelected.length > 0){
            printer_conn
            .font(kitchen_red_font)
            .size(template_styles[template_style-1].size_3, template_styles[template_style-1].size_4)
        }


        if (order_info.menuExtrasSelected !== undefined && order_info.menuExtrasSelected.length > 0) {
            
            order_info.menuExtrasSelected.forEach(function(extras) {

                if (order_data.extra_category_title_print) {
                       


                    printer_conn
                    .text(template_styles[template_style-1].tab_extras+'(' + extras.heading + ')')
                  
                    
            }

                if(extras.optionNameSelected == undefined){
               
                    extras.optionNameSelected = extras.options;

                }


            extras.optionNameSelected.forEach(function(options) {
                    

                printer_conn
                .text(template_styles[template_style-1].tab_extras+'> ' + options.name)
               

            });



            });
        }


        if (order_info.itemInstructions != undefined && order_info.itemInstructions != '') {

            printer_conn
        .font(kitchen_red_font)
            printer_conn
                .size(template_styles[template_style-1].size_1, template_styles[template_style-1].size_1)
                .align('lt')
                .text('Note: ' + order_info.itemInstructions)
        }
       
           if(show_separator_line == true){

                    printer_conn
                        .font('A')
                        .size(1, 2)
                        .text(line4)
                        .size(1, 1)

                    }

                }






                

    });

}


        

        printer_conn

        .close()



}



function delay_red_print(num = 1){
    
    num = num * 10000;
    var  calc = 0;

    for(var i = 0; i < num; i++){
        calc += (calc*num)/1000 - (num + calc)*50;
    }

}


function isItemIdInArray(array, item) {

    for (var i = 0; i < array.length; i++) {
        if (array[i] == item) {
            return true;
        }
    }
    return false;
}


function get_attribute_name(attributes, attribute_id){

    for (var i = 0; i < attributes.length; i++) {
        for (var j = 0; j < attributes[i].attributes.length; j++) {
       
            if (attributes[i].attributes[j].id == attribute_id) {
                return attributes[i].attributes[j].attribute_text;
            }
        }
    }
    return false;

}