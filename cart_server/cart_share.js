var global_cart_and_user_data = [];


var https = require('https');
var fs = require('fs');
var path = require('path');

// proxy configuration....
var proxy_config=require(path.join('..','config','proxy.config.json'))['cart'];
var axios=require('axios')

var options = {
    key: fs.readFileSync(path.join(__dirname, '../config/ssl/', '', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../config/ssl/', '', 'cert.pem')),
};

var express = require('express');
const cors = require('cors');
var app = express();
const printer_config=require(path.join(__dirname,'../config','printer_config.json'))

app.use(express.json({limit: '100mb'}));

app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var portServer = process.env.PORT || 6967;

var router = express.Router();
const auto_pairing=express.Router()

router.post('/add_cart',async function(req, res) {

    var raw_data = null;    

    console.log("---Request in add_cart---");
    if(proxy_config.use==='self'){
		console.log('............self............')
        var receiptModal = false;
        
        if(req.body.receiptModal && req.body.receiptModal != undefined){
            receiptModal = req.body.receiptModal
        }

        if(req.body.raw_data == undefined){
            raw_data = null;
        }
        else{
            raw_data = req.body.raw_data;
        }

        add_cart(req.body.k_id, req.body.cart, req.body.total, receiptModal, raw_data);
        

        res.json({
            status: true
        });
    
    }else{

		console.log('............remote............')
		const body=req.body;
		let data=await axios.post(`${proxy_config.remote_ip}/cart_share/add_cart`,body)
		data=await data.data
		res.status(200).json(data);
	}

});

router.post('/get_cart', async function(req, res) {

    console.log("---Request in get_cart---");

    if(proxy_config.use==='self'){
		console.log('............self............')

        var data = get_cart(req.body.k_id);

        //console.log('data get_cart', data);
    
        res.json({
            data: data,
            status: true
        });
    }else{
        console.log('............remote............')
		const body=req.body;
		let data=await axios.post(`${proxy_config.remote_ip}/cart_share/get_cart`,body)
		data=await data.data
		res.status(200).json(data);
    }


});


router.post('/add_user', async function(req, res) {

    console.log("---Request in add_user---");

    if(proxy_config.use==='self'){
		console.log('............self............')

        add_user(req.body.k_id, req.body.user);

        res.json({
            status: true
        });
    }else{
        console.log('............remote............')
		const body=req.body;
		let data=await axios.post(`${proxy_config.remote_ip}/cart_share/add_user`,body)
		data=await data.data
		res.status(200).json(data);
    }

});

router.post('/get_user', async function(req, res) {


    console.log("---Request in get_user---");

    if(proxy_config.use==='self'){
		console.log('............self............')

        var data = get_user(req.body.k_id);

        res.json({
            data: data,
            status: true
        });

    }else{

        console.log('............remote............')
		const body=req.body;
		let data=await axios.post(`${proxy_config.remote_ip}/cart_share/get_user`,body)
		data=await data.data
		res.status(200).json(data);

    }


});


router.post('/setReceiptModalAction', async function(req, res) {

    console.log("---Request in setReceiptModalAction---");
    if(proxy_config.use==='self'){
		console.log('............self............')

        setReceiptModalAction(req.body.k_id, req.body.action);

        res.json({
            status: true
        });
    }else{
		console.log('............ remote ............')
		const body=req.body;
		let data=await axios.post(`${proxy_config.remote_ip}/cart_share/setReceiptModalAction`,body)
		data=await data.data
		res.status(200).json(data);

    }


});

router.post('/getReceiptModalAction', async function(req, res) {

    console.log("---Request in getReceiptModalAction---");

	if(proxy_config.use==='self'){
        console.log('............self............')
        var receiptModal = getReceiptModalAction(req.body.k_id);

        res.json({
            receiptModal: receiptModal,
            status: true
        });

    }else{
		console.log('............remote............')
		const body=req.body;
		let data=await axios.post(`${proxy_config.remote_ip}/cart_share/getReceiptModalAction`,body)
		data=await data.data
		res.status(200).json(data);

    }
});


auto_pairing.get('/auto_pairing',async (req,res,next)=>{
    console.log("---Request in Printing Auto Pairing---");

    let k_ids=[];
    const {counter_printer_ips}=printer_config;
    


    if(proxy_config.use==='self'){
        console.log('............self............')

        counter_printer_ips.forEach(data => {
            k_ids.push(data.k_id);
        });

        // console.log({
        //     status: true,
        //     massage: `Connection is active`,
        //     k_ids:k_ids
        // });

        res.send({
            status: true,
            massage: `Connection is active`,
            k_ids:k_ids
        });

    }else{
        console.log('............remote............')
        const body=req.body;
        let data=await axios.get(`${proxy_config.remote_ip}/auto_pairing`,body)
        data=await data.data
        res.status(200).json(data);

    }       

})

app.use('/',auto_pairing)
app.use('/cart_share', router);

https.createServer(options, app).listen(6968, '0.0.0.0');
app.listen(6967);
console.log('Cart Sharing started on port:' + portServer);



function add_cart(k_id, cart, total, receiptModal, raw_data = null) {

    var index = search_k_id(k_id);

    if (index == 'null') {

        global_cart_and_user_data.push({
            k_id: k_id,
            cart: cart,
            user: '',
            tip: '',
            total: total,
            receiptModal: receiptModal,
            action: '',
            raw_data: null
        });

    } else {
        global_cart_and_user_data[index].cart = cart;
        global_cart_and_user_data[index].total = total;
        global_cart_and_user_data[index].raw_data = raw_data;
    }

    return;

}


function get_cart(k_id) {

    var index = search_k_id(k_id);

    if (index == 'null') {

        return {
            cart: [],
            total: 0,
            receiptModal: false
        };

    } else {
        return {
            cart: global_cart_and_user_data[index].cart,
            total: global_cart_and_user_data[index].total,
            receiptModal: global_cart_and_user_data[index].receiptModal,
            raw_data: global_cart_and_user_data[index].raw_data
        };
    }

    return;

}


function add_user(k_id, user) {

    var index = search_k_id(k_id);

   // console.log('INDEX');

    if (index == 'null') {

        global_cart_and_user_data.push({
            k_id: k_id,
            cart: '',
            user: user,
            tip: '',
            total: 0,
            receiptModal: false,
            action: ''
        });

    } else {
        global_cart_and_user_data[index].user = user;
    }

    return;

}


function get_user(k_id) {

    var index = search_k_id(k_id);

   // console.log('INDEX', index);

    if (index == 'null') {

        return {
            user: []
        };

    } else {
        return {
            user: global_cart_and_user_data[index].user
        };
    }

    return;

}

function getReceiptModalAction(k_id) {

    var index = search_k_id(k_id);

    //console.log('INDEX', index);

    if (index == 'null') {

        return {
            receiptModal: false
        };

    } else {
        return {
            receiptModal: global_cart_and_user_data[index].receiptModal
        };
    }

    return;

}


function setReceiptModalAction(k_id, action){
    var index = search_k_id(k_id);

   // console.log('INDEX', index);

    if (index == 'null') {

        global_cart_and_user_data.push({
            k_id: k_id,
            cart: '',
            user: '',
            tip: '',
            total: 0,
            receiptModal: false,
            action: ''
        });

    } else {
        global_cart_and_user_data[index].action = action;
    }

    return;
}


function search_k_id(k_id) {


    for (var i = 0; i < global_cart_and_user_data.length; i++) {
        if (global_cart_and_user_data[i].k_id === k_id) {

            return i;
        }
    }

    return 'null';

}


router.post('/add_tip',async function(req, res) {

    console.log("---Request in add_tip---");

   // console.log('add_tip', req.body);
   if(proxy_config.use==='self'){
        console.log('............self............')
        
        add_tip(req.body.k_id, req.body.tip, req.body.tipType, req.body);

        res.json({
            status: true
        });
    }else{
        console.log('............remote............')
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/cart_share/add_tip`,body)
        data=await data.data
        res.status(200).json(data);
    }  


});

router.post('/get_tip', async function(req, res) {

    console.log("---Request in get_tip---");

    //console.log('get_tip', req.body);
    if(proxy_config.use==='self'){
        console.log('............self............')
        
        var data = get_tip(req.body.k_id);

        res.json({
            data: data,
            status: true
        });    
    }else{
        console.log('............remote............')

        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/cart_share/get_tip`,body)
        data=await data.data
        res.status(200).json(data);
    }  

});

router.post('/get_thankyou',async function(req, res) {

    console.log("---Request in get_thankyou---");
    if(proxy_config.use==='self'){
        console.log('............self............')

        var data = get_thankyou(req.body.k_id);

        res.json({
            data: data,
            status: true
        });

    }else{
        console.log('............remote............')

        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/cart_share/get_thankyou`,body)
        data=await data.data
        res.status(200).json(data);
    }      


});
router.post('/set_thankyou',async function(req, res) {

    console.log("---Request in set_thankyou---");

  //  console.log('add_tip', req.body);
   if(proxy_config.use==='self'){
        set_thankyou(req.body.k_id, req.body.thankyouType, req.body.thankyouValue);

        res.json({
            status: true
        });
   }else{
        console.log('............remote............')
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/cart_share/set_thankyou`,body)
        data=await data.data
        res.status(200).json(data);
    }

});


router.post('/init_tip',async function(req, res) {

    console.log("---Request in init_tip---");

   // console.log('init_tip', req.body);

   if(proxy_config.use==='self'){
        console.log('............self............')

        var data = init_tip(req.body.k_id);

        res.json({
            status: true
        });
    }else{
        console.log('............remote............')
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/cart_share/init_tip`,body)
        data=await data.data
        res.status(200).json(data);
    }      

});

router.post('/init_thankyou',async function(req, res) {

    console.log("---Request in init_thankyou---");

    if(proxy_config.use==='self'){
        console.log('............self............')

        var data = init_thankyou(req.body.k_id);

        res.json({
            status: true
        });

    }else{
        console.log('............remote............')
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/cart_share/init_thankyou`,body)
        data=await data.data
        res.status(200).json(data);
    }       


});






function add_tip(k_id, tip, tipType, req_data) {
    var index = search_k_id(k_id);
   // console.log('INDEX', index);
    if (index == 'null') {
        global_cart_and_user_data.push({
            k_id: k_id,
            cart: '',
            user: '',
            tip: tip,
            total: 0,
            receiptModal: false,
            action: ''
        });
    } else {
        global_cart_and_user_data[index].tip = tip;
        global_cart_and_user_data[index].tipType = tipType;

        // console.log('DATA', req_data);

        if(req_data.registerTip != undefined){
        if(req_data.registerTip !== false){
            global_cart_and_user_data[index].tipAction = 'inactive';
        }else{
            global_cart_and_user_data[index].tipAction = 'getTip';
        }
        }
    }
    return;
}


function get_tip(k_id) {
    var index = search_k_id(k_id);
    //console.log('INDEX', index);
    if (index == 'null') {
        return {
            tip: []
        };
    } else {
        return {
            tip: global_cart_and_user_data[index].tip,
            tipType: global_cart_and_user_data[index].tipType,
            tipAction: global_cart_and_user_data[index].tipAction,
        };
    }
    return;
}

function init_tip(k_id) {
    var index = search_k_id(k_id);
    //console.log('INDEX', index);
    if (index != 'null') {
        global_cart_and_user_data[index].tipAction = 'active';
    }
    return;
}

function init_thankyou(k_id) {
    var index = search_k_id(k_id);
  //  console.log('INDEX', index);
    if (index != 'null') {
        global_cart_and_user_data[index].thankyouAction = 'active';
        global_cart_and_user_data[index].thankyouType = '';
        global_cart_and_user_data[index].thankyouValue = '';
    }
    return;
}

function get_thankyou(k_id) {
    var index = search_k_id(k_id);
   // console.log('INDEX', index);
    if (index == 'null') {
        return {
            thankyouType: []
        };
    } else {
        return {
            thankyouType: global_cart_and_user_data[index].thankyouType,
            thankyouValue:global_cart_and_user_data[index].thankyouValue,
            thankyouAction: global_cart_and_user_data[index].thankyouAction,
        };
    }
    return;
}

function set_thankyou(k_id, thankyouType, thankyouValue) {
    var index = search_k_id(k_id);
    //console.log('INDEX', index);
    if (index == 'null') {
        global_cart_and_user_data.push({
            k_id: k_id,
            cart: '',
            user: '',
            tip: 0,
            total: 0,
            receiptModal: false,
            action: ''
        });
    } else {
        global_cart_and_user_data[index].thankyouType = thankyouType;
        global_cart_and_user_data[index].thankyouValue = thankyouValue;
        global_cart_and_user_data[index].thankyouAction = 'inactive';
    }
    return;
}
