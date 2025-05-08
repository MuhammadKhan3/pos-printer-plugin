var line1 = '________________________________________________';
var line2 = '------------------------------------------------';
var line3 = '================================================';
var line4 = '- - - - - - - - - - - - - - - - - - - - - - - -';

const template_styles = require('../../config/template_styles.json');
const staff_config=require('../../config/staff_config.json')

var line_temp = '';

module.exports = {
    shift_report_template_1: function(printer_conn, print_data, date_time) {
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

var currency_symbol = '$';

function print_handler(printer_conn, print_data, date_time) {

  // console.log("-------------------shif_report_close-------------------------",print_data);
    
  let data=print_data;
  console.log("-------------------shif_report_close-------------------------",Object.values(data).length);

  const {date,time}=getTime(data?.from);
  // console.log(datei);

    if(template_styles[0].currency_symbol != undefined){
        currency_symbol = template_styles[0].currency_symbol;
    }

      printer_conn
          .align('ct')
          .size(1, 1)
          .style('b')
          .text(print_data.business_info.name)
          .text(print_data.business_info.address)
          .text("")

  


    printer_conn
        .size(1, 1)
        .align('ct')
        .text(' * * * * Checkout * * * *')
        
        
    printer_conn   
        .text('')
        .size(1, 1)        
        .tableCustom(                    [   
            {text: 'Unit #    1', align: "LEFT", width: 0.75},
            {text: date, align: "RIGHT", width: 0.25}, 
          ]
        )


      printer_conn   
        .text('')
        .size(1, 1)        
        .tableCustom(                    [   
            {text:data?.staff_name + '(ID: '+data?.staff_id+')', align: "LEFT", width: 0.75},
            {text:time, align: "RIGHT", width: 0.25}, 
          ]
        )

    printer_conn   
        .size(1, 1)
        .align('LT')
        .text(`SHIFT: ${data?.all_shifts?.length}`)

        // .style('b')


    printer_conn   
        .size(1, 1)
        .text("REV: "+data?.rev)
        // .style('b')


    printer_conn   
        .size(1, 1)
        .text(`JOBCODE: ${data?.access_level_name}`)
        // .style('b')
 
    printer_conn
        .text('')
        .size(1, 1)
        .align('ct')
        .text(' *** RECEIPTS *** ')
    
    printer_conn  
        .size(1, 1)
        // .style('b')

        data?.sold_items?.forEach((item)=>{
            printer_conn
            .tableCustom(                    [   
                {text: item?.item_name+" ("+item?.qty+"):", align: "LEFT", width: 0.65},
                {text: removeDollarAndFormat(item?.total) +"(+)", align: "RIGHT", width: 0.30}, 
              ]
            )    
        
        })

        printer_conn
        .text('')

        .tableCustom(                    [   
            {text: "Subtotal: ", align: "LEFT", width:0.65},
            {text: removeDollarAndFormat(data?.sold_items_total), align: "RIGHT",  width:0.30}, 

          ]
        ) 
        
        // printer_conn
        // .text('')

        // .tableCustom(                    [   
        //     {text: "Auto Gratuity: ", align: "LEFT", width:0.65},
        //     {text: removeDollarAndFormat(data?.auto_gratuity_amount), align: "RIGHT",  width:0.30}, 

        //   ]
        // ) 


        // printer_conn
        // .text('')

        // .tableCustom(                    [   
        //     {text: "TOTAL TIPS: ", align: "LEFT", width:0.65},
        //     {text: removeDollarAndFormat(data?.tips), align: "RIGHT",  width:0.30}, 

        //   ]
        // ) 


        // printer_conn
        // .text('')

        // .tableCustom(                    [   
        //     {text: "Technology Liability: ", align: "LEFT", width:0.65},
        //     {text: removeDollarAndFormat(data?.total_cc_fee), align: "RIGHT",  width:0.30}, 

        //   ]
        // ) 


        // printer_conn
        // .text('')

        // .tableCustom(                    [   
        //     {text: "Technology Refund: ", align: "LEFT", width:0.65},
        //     {text: removeDollarAndFormat(data?.technology_refund_amount), align: "RIGHT",  width:0.30}, 

        //   ]
        // ) 

        // printer_conn
        // .text('')
        // .tableCustom(                    [   
        //     {text: "GROSS RECEIPTS: ", align: "LEFT", width: 0.65},
        //     {text: removeDollarAndFormat(data?.gross_sale)+"(=)", align: "RIGHT", width:  0.30}, 

        //   ]
        // )
        
        printer_conn
        .text('')



        printer_conn
        .size(1, 1)
        .align('ct')
        .text(' *** TAXES *** ')
        
        printer_conn
        .tableCustom(                    [   
            {text: "INCLUSIVE: ", align: "LEFT", width: 0.65},
            {text: "", align: "LEFT", width: 0.30},

          ]
        )


        printer_conn
        .text('')

        printer_conn
        .tableCustom(                    [   
            {text: "Sales Tax INC: ", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.total_gross_tax) +"(+)", align: "RIGHT", width:  0.30}, 

          ]
        )

        Object.entries(data?.additionalTaxData).forEach(([id, item]) => {

          printer_conn
          .tableCustom([   
              {text: `${item?.tax_title}: `, align: "LEFT", width: 0.65},
              {text: removeDollarAndFormat(item?.tax) +"(+)", align: "RIGHT", width:  0.30}, 
            ]
          )

        })

        printer_conn
        .text('')

        printer_conn
        .tableCustom(                    [   
            {text: "Total Tax:", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.total_tax) +"(+)", align: "RIGHT", width:  0.30}, 
          ]
        )

        
        printer_conn
        .text('')







        printer_conn
        .size(1, 1)
        .align('ct')
        .text(' *** COMPS *** ')

        Object.entries(data?.comp_data).forEach(([id, item]) => {
          printer_conn
          .tableCustom([   
              {text: `${item.qty} ${item?.item_name}:`, align: "LEFT", width: 0.65},
              {text: removeDollarAndFormat(item?.total), align: "RIGHT", width: 0.30},
            ]
          )
        });

        printer_conn
        .tableCustom(                    [   
            {text: "TOTAL COMPS:", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.total_comp) +"(+)", align: "RIGHT", width: 0.30},
          ]
        )



        printer_conn
        .text('')


        printer_conn
        .size(1, 1)
        .align('ct')
        .text(' *** VOIDS *** ')
        let total_voids=data?.total_voids;
        let regex = /\$\d+(\.\d+)?/;
        // total_voids=total_voids.match(regex)[0];

        printer_conn
        .tableCustom(                    [   
            {text: `VOIDS (${data?.total_voids_count}): `, align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(total_voids) +"(+)", align: "RIGHT", width: 0.30},

          ]
        )

        printer_conn
        .text("")

        printer_conn
        .tableCustom(                    [   
            {text: "GROSS RECEIPTS: ", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.gross_sale) +"(=)", align: "RIGHT", width: 0.30},
          ]
        )

        printer_conn
        .text("")

        printer_conn
        .size(1, 1)
        .align('ct')
        .text(' *** PAYMENTS *** ')
        printer_conn
        .tableCustom(                    [   
            {text: `Gross CASH (${parseInt(data?.cash_transaction)})`, align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.total_cash) , align: "RIGHT", width: 0.30},
          ]
        )



        printer_conn
        .tableCustom([   
            {text: `Gross Card (${parseInt(data?.credit_card_transaction)})`, align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.total_credit_card) +"", align: "RIGHT", width: 0.30},

          ]
        )



        printer_conn
        .tableCustom([   
            {text: "TOTAL PAYMENTS ", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.gross_sale) , align: "RIGHT", width: 0.30},

          ]
        )

        printer_conn
        .text('')

        // -----------------cash tips--------------------------------------
        printer_conn
        .size(1, 1)
        .align('ct')
        .text(' *** TIPS *** ')


        printer_conn
        .tableCustom([   
            {text: "CASH TIPS", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.cash_tips) , align: "RIGHT", width: 0.30},
          ]
        )

        printer_conn
        .tableCustom([   
            {text: "Card TIPS", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.credit_tips) , align: "RIGHT", width: 0.30},
          ]
        )
        printer_conn
        .text("")

        printer_conn
        .tableCustom([   
            {text: "TOTAL TIPS:", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.tips), align: "RIGHT", width: 0.30},
          ]
        )

        printer_conn
        .text("")
        
        printer_conn
        .text("")
        

        printer_conn
        .tableCustom([   
            {text: "TOTAL COMPS:", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.total_comp)+"(-)", align: "RIGHT", width: 0.30},
          ]
        )

        printer_conn
        .text("")


        printer_conn
        .tableCustom([   
            {text: "TIP REFUND:", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.technology_refund_amount)+"(+)", align: "RIGHT", width: 0.30},
          ]
        )
        
        

        printer_conn
        .text("")

        if(data.net_cash !== undefined){
          data.net_cash = removeDollarAndFormat(data?.net_cash);

        }
       
        let net_cash_msg = data?.net_cash < 0 ? 'CASH OWED TO STAFF:' : 'CASH OWED TO '+staff_config?.business_label+':';
        let net_cash_value = data?.net_cash < 0 ? data?.net_cash*-1 : data?.net_cash;

        printer_conn
        .style('b')
        .tableCustom([   
            {text: net_cash_msg, align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(net_cash_value)+"(=)", align: "RIGHT", width: 0.30},
          ]
        )


        printer_conn
        .text("")
        .size(1, 1)
        .align('ct')
        .text(`*** Cumulative Tips ***`)
 


        printer_conn
        .tableCustom([   
            {text: "Ticket #", align: "CENTER", width: 0.25},
            {text: "Type", align: "CENTER", width: 0.25},
            {text: "Time", align: "CENTER", width: 0.25},
            {text: "Amount", align: "CENTER", width: 0.25},
           

          ]
        )

        Object.entries(data?.tickets).forEach(([id, item]) => {
          printer_conn
          .tableCustom([   
              {text: item.ticket_no, align: "CENTER", width: 0.25},
              {text: 'Tip', align: "CENTER", width: 0.25},
              {text: item.time, align: "CENTER", width: 0.25},
              {text: removeDollarAndFormat(item.amount), align: "CENTER", width: 0.25},
          
  
            ]
          )
        });

        Object.entries(data?.auto_gratuity_amount_list).forEach(([id, item]) => {
          printer_conn
          .tableCustom([   
              {text: item.ticket_no, align: "CENTER", width: 0.25},
              {text: 'Auto Gratuity', align: "CENTER", width: 0.25},
              {text: item.time, align: "CENTER", width: 0.25},
              {text: removeDollarAndFormat(item.amount), align: "CENTER", width: 0.25},
          
  
            ]
          )
        });

        printer_conn.text(line1);
       
        printer_conn
        .tableCustom([   
            {text: '', align: "CENTER", width: 0.25},
            {text: 'TOTAL', align: "CENTER", width: 0.25},
            {text: '', align: "CENTER", width: 0.25},
            {text: removeDollarAndFormat(data?.tips), align: "CENTER", width: 0.25},
        

          ]
        );
    
        printer_conn.text(line1);


        printer_conn
        .text("")
        .size(1, 1)
        .align('ct')
        .text(`*** INTERNAL ***`)
 


        printer_conn
        .tableCustom([   
            {text: `${data?.staff_name}`, align: "LEFT", width: 0.65},
            {text: date, align: "RIGHT", width: 0.30},

          ]
        )

       

        printer_conn
        .tableCustom([   
            {text: "Gross Sales", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.sold_items_total), align: "RIGHT", width: 0.30},
          ]
        )


        printer_conn
        .tableCustom([   
            {text: "Total Taxes", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.total_tax), align: "RIGHT", width: 0.30},
          ]
        )

        // let grossSaleValue = data?.gross_sale.replace(/[\$,]/g, '');
        // printer_conn
        // .tableCustom([   
        //     {text: "Gross Minus Taxes:", align: "LEFT", width: 0.65},
        //     {text: removeDollarAndFormat(data?.gross_sale_without_tax), align: "RIGHT", width: 0.30},
        //   ]
        // )
        printer_conn
        .tableCustom([   
            {text: "Comp", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.total_comp), align: "RIGHT", width: 0.30},
          ]
        )



        printer_conn
        .tableCustom([   
            {text: "Tips", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.tips), align: "RIGHT", width: 0.30},
          ]
        )


        // printer_conn
        // .tableCustom(                    [   
        //     {text: "Auto Gratuity", align: "LEFT", width:0.65},
        //     {text: removeDollarAndFormat(data?.auto_gratuity_amount), align: "RIGHT",  width:0.30}, 

        //   ]
        // ) 

        // printer_conn
        // .tableCustom(                    [   
        //     {text: "Technology Liability", align: "LEFT", width:0.65},
        //     {text: removeDollarAndFormat(data?.total_cc_fee), align: "RIGHT",  width:0.30}, 

        //   ]
        // ) 

        printer_conn
        .tableCustom(                    [   
            {text: "Tip Refund", align: "LEFT", width:0.65},
            {text: removeDollarAndFormat(data?.technology_refund_amount), align: "RIGHT",  width:0.30}, 

          ]
        ) 

        printer_conn
        .text(line1)

        printer_conn
        .tableCustom([   
            {text: "Gross Receipts", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.gross_sale), align: "RIGHT", width: 0.30},
          ]
        )
        printer_conn
        .text("")
        .text("")
        printer_conn
        .tableCustom([   
            {text: "Net to Business", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.net_sale), align: "RIGHT", width: 0.30},
          ]
        )

        printer_conn
        .text("")
        .text("")
        .text("")

        printer_conn
        .align("LT")
        .text(" Staff ___________________________")
        .text("       Signed by "+data?.staff_name)
        .text("")
        .text("")
        .text("")
      
        printer_conn
        .tableCustom([   
            {text: "Manager Name ______________", align: "LEFT", width: 0.60},
            {text: "Initials ____", align: "LEFT", width: 0.30},
          ]
        )

        printer_conn
        .text("")
        .text("")




        printer_conn
        .align("ct")
        .size(1,1)
        .text("*** AUDIT ***")

        printer_conn
        .tableCustom([   
            {text: `VOIDS (${data?.total_voids_count}):`, align: "LEFT", width: 0.65},
            {text: data?.total_voids, align: "RIGHT", width: 0.30},
          ]
        )

        printer_conn
        .text("")
        
        printer_conn
        .tableCustom([   
            {text: `TICKETS (${data?.orders?.length})`, align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.gross_sale), align: "RIGHT", width: 0.30},
          ]
        )

      

        printer_conn
        .text("")


        
        printer_conn
        .align("ct")
        .size(1,1)
        .text("*** Total COMP SALES ***")

        Object.entries(data?.comp_data).forEach(([id, item]) => {
          printer_conn
          .tableCustom([   
              {text: `${item.qty} ${item?.item_name}:`, align: "LEFT", width: 0.65},
              {text: removeDollarAndFormat(item?.total), align: "RIGHT", width: 0.30},
            ]
          )
        });




        printer_conn
        .tableCustom([   
            {text: "Total COMPS:", align: "LEFT", width: 0.65},
            {text: removeDollarAndFormat(data?.total_comp), align: "RIGHT", width: 0.30},
          ]
        )

        printer_conn
        .text("")
        .text("")

        printer_conn
        .align("ct")
        .size(1,1)
        .text("CASH RECONCILIATION REPORT")

   
          printer_conn
          .tableCustom([   
              {text: `Open`, align: "LEFT", width: 0.65},
              {text: removeDollarAndFormat(data?.cash_drawer_start?.grand_total), align: "RIGHT", width: 0.30}
          ]
            
          )

          printer_conn
          .tableCustom(
            [   
              {text: `Close`, align: "LEFT", width: 0.65},
              {text: removeDollarAndFormat(data?.cash_drawer_end?.grand_total), align: "RIGHT", width: 0.30},
            ]
          )



        
        printer_conn
        .text('')
        .text('')
        .text('')
        .size(1, 1)
        .align('ct')
        .text('Powered by Pocket Systems, LLC.')
        .text('')


          printer_conn
          .cut()
          .close()

}





function getTime(dateFrom){
  let datetime= new Date(dateFrom);
  let year = datetime.getFullYear();
  let month = datetime.getMonth() + 1; 
  let day = datetime.getDate();
  
  let hours = datetime.getHours();
  hours = hours % 12;
 
  var ampm = hours >= 12 ? 'PM' : 'AM';  
  hours = hours ? hours : 12; 

  let minutes = datetime.getMinutes();
  minutes = minutes < 10 ? '0' + minutes : minutes;

  let time=hours+":"+minutes+" "+ampm;
  let date=day+"/"+month+"/"+year;
  return {time,date}
}


function removeDollarAndFormat(value) {

  if(value === undefined || value == null){
    return '0.00';
  }
  let valueStr = typeof value === 'number' ? value.toString() : value;

  let cleanedValue = valueStr.replace(/^\$/, '');

  cleanedValue = cleanedValue.replace(/,/g, '');
  const numericValue = Number(cleanedValue);
  const formattedValue = numericValue.toLocaleString('en-US', { minimumFractionDigits:2,maximumFractionDigits: 2 });

  return formattedValue;
}