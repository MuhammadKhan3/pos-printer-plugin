const sqlite = require('sqlite3');
const path = require('path');
const axios=require('axios')
const kds_config=require(path.join('..','..','config','proxy.config.json'))['kds'];

const db = new sqlite.Database(path.join(__dirname, '..','..','offline_server', 'db', 'ApiData.db'));
// change kds
exports.add_kds_order=async (req,res,next)=>{	
	try {
		
		console.log("........... request insert the kds orders...........")
		if(kds_config.use==='self'){
			const {order,business_id,order_id,order_via,invoiceNumber,udid,order_type,name,customer_name,...main_payload}=req.body;
			// Insert the orders items we insert the multiple orders
			
			db.all(
				`Select count(*) as order_count from kds_orders where order_id=? and order_via=?`,
				[order_id,'online_order'],
				(err,data)=>{
					const [{order_count}]=data;

					if(order_count>0){
						res.status(200).json({success:false,message:'This order is already exist.'})

					}else{
						order.forEach(data => {
							const {uniqueId,quantity,menuExtrasSelected,menuItem,itemInstructions,kds_sound_file,...order_payload}=data;
							

							db.run(
								'INSERT INTO kds_orders (business_id, order_id,order_via,item_id,quantity,extras,item_status,item_name,notes,invoiceNumber,order_type,name,order_status,customer_name,udid,kds_sound_file, is_blinking,main_payload,order_payload) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', 
								[business_id,order_id,order_via,uniqueId,quantity,JSON.stringify(menuExtrasSelected),'pending',menuItem,itemInstructions,invoiceNumber,order_type,name,'pending',customer_name,udid,kds_sound_file,JSON.stringify({[`${req.ip}`]:0}),JSON.stringify(main_payload),JSON.stringify(order_payload)], (err) => {
									if(err){
										console.log(err)
									}else{
									}
								}
							)			
						});	
						res.status(200).json({success:true,message:'KDS order send successfully.'})
					}
				}
			)


		}else{
			console.log('............remote............')
			const body=req.body;
			let data=await axios.post(`${kds_config.remote_ip}/kds/insert_orders`,body)
			data=await data.data
			res.status(200).json(data);
		}
	} catch (error) {
		console.log(error)		
	}

}
		
// In this controller we get the all orders
exports.get_kds_order=async (req,res,next)=>{


	try {
				
		if(kds_config.use==='self'){
			let {order_type,business_id,autoClearTime=2,...item_config}=req.body;
			let {timezone}=req.query;
			let kds_orders=[];
			let kds=[];
			let all_orders=[];
			
			
			// we get the previous 1 day all orders and status 
			//    wise get we pass the order_type is ready or pending and bussiness_id to get order
			let sql_query='SELECT * FROM kds_orders WHERE ';
			sql_query+=`business_id=${business_id} AND `

			
			if(order_type=='ready' || order_type=='pending'){
				sql_query+=`item_status="${order_type}"`
			}
			
			else{
				sql_query+=`item_status IN ("ready", "pending")`	
			}

			
			if (Number(autoClearTime) > 0) {
				sql_query += ` AND (item_status != "ready" OR (item_status = "ready" AND updated_at >= datetime('now', '-${Number(autoClearTime)} minutes', 'localtime','utc')))`;
			}
			
			sql_query+= ` AND created_at>=datetime('now', '-1 day', 'localtime','utc')`
			

			db.all(sql_query,async (err,orders)=>{
				try {
					
				
						
					for (const order of orders) {
						// if the order id index not exist in array we intialize the index and object varaible
						if (!kds_orders[order.order_id]) {
							
							all_orders=await getOrders(order.order_id)
							// we check the all orders status  is ready true the status and send response ready other  pending
							let order_status=all_orders.every((o)=>o.order_status==='ready') ? 'ready' : 'pending'

							// boolean update
							
							let {status,created_since}=item_status(order['created_at'],item_config,timezone);
							let created_at=new Date(order['created_at'] + "Z");
							
							let formatter_created_at=new Intl.DateTimeFormat('en-US', {
								hour: '2-digit',
								minute: '2-digit',
								timeZone: timezone,
								hour12: true
							}).format(created_at);

							
							let is_blinking=JSON.parse(order['is_blinking'])							
							
							let blinkEnabled=is_blinking[req.ip] < 1;														

							const isBlinkingForCurrentIP = Object.keys(is_blinking).includes(req.ip);							
						    
							

							kds_orders[order.order_id] = {   
								// id:  order['id'],
								invoiceNumber:order['invoiceNumber'],
								name:order['name'],
								order_type:order['order_type'],							
								order_status:order_status,
								order_id:order['order_id'],
								customer_name:order['customer_name'],
								udid:order['udid'],
								created_at:formatter_created_at,
								updated_at:order['updated_at'],
								...JSON.parse(order['main_payload']),
								status:status,
								is_blinking: blinkEnabled,
								created_since:created_since,
								items:[]
							};
							

							if(isBlinkingForCurrentIP==true){
								is_blinking[req.ip]+=1;
							}else{
								is_blinking[req.ip]=0;
							}

							if(is_blinking[req.ip]<=1){
								update_is_blinking(order?.order_id, is_blinking)
							}

						}
						
						// In this varaiable we get the status and created_since the status or green,red etc or create_at in mintues
						let {status,created_since}=item_status(order['created_at'],item_config,timezone);
						
						kds_orders[order.order_id]["items"].push({id:order['id'],
							order_via:order['order_via'],item_id:order['item_id'],
							status:status,quantity:order['quantity'],
							extras:JSON.parse(order['extras']),item_status:order['item_status'],
							item_name:order['item_name'],created_since,notes:order['notes'],
							kds_sound_file:order['kds_sound_file'],...JSON.parse(order['order_payload'])
						});


					}
					

					for (const ko in kds_orders) {
						// we remove the empty index in the array of items of same order_id
						if (Object.prototype.hasOwnProperty.call(kds_orders, ko)) {
							kds.push(kds_orders[ko])
						}
					}

					kds.sort((a,b)=>{
						const time=a?.created_since.split(':')
						const a_seconds=(time[0]*60*60*1000)+(time[1]*60*1000)+(time[2]*1000)

						const time1=b?.created_since.split(':')
						const b_seconds=(time1[0]*60*60*1000)+(time1[1]*60*1000)+(time1[2]*1000)

						return a_seconds-b_seconds;
					});


					if(err){
						res.json({success:false,message:'Fail add kds order!',orders:kds})
					}else{
						res.json({success:true,message:'KDS order get successfully.',orders:kds})
					}
				} catch (error) {
       				console.log("-----------------error------------------------",error);				
				}

			})
		}else {
			console.log('............remote............')
			const body=req.body;
			let data=await axios.post(`${kds_config.remote_ip}/kds/get_orders`,body)
			data=await data.data
			res.status(200).json(data);
		
		}

	} catch (error) {
		console.log(error);			
	}

}
	

// Update the order status update
exports.update_kds_order_status=async (req,res,next)=>{
	try {
    
		console.log("........... request update the kds orders...........")
		if(kds_config.use==='self'){
			console.log('............self............')

			const {type,status,order_id,kds_item_id}=req.body;

			if (type== 'all') {
				// when we pass type all update the related order_id order_status and item status
				db.run('UPDATE kds_orders SET updated_at=strftime("%Y-%m-%d %H:%M:%S", "now","localtime", "utc"),item_status = ?,order_status=? WHERE order_id = ?',['ready','ready',order_id],(err)=>{
					if (err) {
						res.json({success:false,message:'Fail update kds order status!'})
					}else{
						res.json({success:true,message:'KDS order status change successfully.'})
					}
				})
			} else if(type== 'all_orders'){
				// when we pass the all_orders update the all_orders in table update the order_status and item_status
				db.run('UPDATE kds_orders SET updated_at=strftime("%Y-%m-%d %H:%M:%S", "now","localtime", "utc"), item_status= ?,order_status= ? where item_status=? OR order_status=?',['ready','ready','pending','pending'],(err)=>{
					if (err) {
						res.json({success:false,message:'Fail update kds order status!'})
					}else{
						res.json({success:true,message:'KDS All orders status change successfully.'})
					}
				})
			} else if(type=="clear"){
				db.run('UPDATE kds_orders SET updated_at=strftime("%Y-%m-%d %H:%M:%S", "now","localtime", "utc"),item_status= ?,order_status= ? where item_status=? AND order_status=? AND order_id=?',['clear','clear',status,status,order_id],(err)=>{
					if (err) {
						res.json({success:false,message:'Fail update kds order status!'})
					}else{
						res.json({success:true,message:'KDS orders status change successfully.'})
					}
				})
			}
			else{
				// othen than we update the individual item item_status and order_status update 
				db.run('UPDATE kds_orders SET  updated_at=strftime("%Y-%m-%d %H:%M:%S", "now","localtime", "utc"), item_status= ? ,order_status =? WHERE id = ?',['ready','ready',kds_item_id],(err)=>{
					if (err) {
						console.log(err)
						res.json({success:false,message:'Fail update kds order status!'})
					}else{
						res.json({success:true,message:'KDS order status change successfully.'})
					}
				})
			}

		}else{
			console.log('............remote............')
			const body=req.body;
			let data=await axios.put(`${kds_config.remote_ip}/kds/update_orders`,body)
			data=await data.data
			res.status(200).json(data);
		}
	
	} catch (error) {
		console.log(error)		
	}

}

exports.delete_orders=(req,res,next)=>{
	try {
		const {order_id}=req.body;
		db.run('DELETE FROM kds_orders where order_id=?;',[order_id],(err)=>{
			if (err) {
				console.log(err);
				res.json({success:false,message:'Fail to Delete kds order '})
			}else{
				res.json({success:true,message:'KDS order Delete Successfully.'})
			}

		});
	} catch (error) {
		console.log(error);
	}
}



exports.clear_orders=(req,res,next)=>{
	try {
		console.log("----------------clear kds---------------------");
		db.run('DELETE FROM kds_orders where item_status=?;',["ready"],(err)=>{
			if (err) {
				res.json({success:false,message:'Fail to Delete kds order '})
			}else{
				res.json({success:true,message:'KDS order Clear Successfully.'})
			}

		});
	} catch (error) {
		console.log(error);
	}
}


// to get the orders for order_status if is ready
const getOrders=async (order_id)=>{
	const orders=await new Promise((resolve)=>{
		db.all('SELECT * FROM kds_orders WHERE order_id=?',[order_id],(err,res)=>{
			resolve(res)
		})
	})
	return orders;
}

function formatDateInTimeZone(date, timeZone) {
    return new Date(new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date));
}

// To check the status of time wise
const item_status=(item_created_at,item_config,timezone)=>{
	
	const created_at = new Date(item_created_at +"Z"); 
	const current_time =new Date();

	const created_at_local = formatDateInTimeZone(created_at, timezone);;
    const current_time_local = formatDateInTimeZone(current_time, timezone);

	
	const created_since=time_since(item_created_at,timezone);
	let time_diff=current_time_local-created_at_local;
	const time_difference = Math.floor(time_diff/ (1000 * 60));
	let status;
	// check the time is less than 5 to green less than 10 and greater than 5 is orange
	if (time_difference <item_config?.firstDuration) {
	    status = item_config?.firstDurationColor; 
	} else if (time_difference <item_config?.secondDuration) {
	    status = item_config?.secondDurationColor; 
	} else {
    	status = item_config?.thirdDurationColor; 
	}

	return {status,created_since:created_since};
}

const update_is_blinking=(order_id, is_blinking)=>{

	
	db.run('UPDATE kds_orders SET  updated_at=strftime("%Y-%m-%d %H:%M:%S", "now","localtime", "utc"),is_blinking =? WHERE order_id = ?',[JSON.stringify(is_blinking),order_id],(err)=>{
		if(err){
			console.log(err)
		}
	})
}


const time_since=(created_at,timezone)=>{
	const createdAtTime = new Date(created_at+"Z");
	const currentTime = new Date();

	const createdATDateLocal = new Date(createdAtTime.toLocaleString('en-US', { timezone }));
    const currentTimeLocal = new Date(currentTime.toLocaleString('en-US', { timezone }));

	const durationMs = currentTimeLocal - createdATDateLocal;
	const totalSeconds = Math.floor(durationMs / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	return formattedTime
}