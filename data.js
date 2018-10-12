var mysql = require("mysql");

function retrieveData (params, callback) {
	const connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "Cymadeagle1!",
		database: "d3_proj"
	});

	var params_arr = params.categories.split(',');

	var sql = "select * from store_data, product_id_to_category";

	if (params.startdate || params.enddate){
		sql += ", times";
	}
	
	sql += " where category in (?";

	for (var i = 0; i < params_arr.length - 1; i++){
		sql += ", ?";
	}
	sql += ") and product_id = distinct_pid"; 

	
	var datequery;
	if (params.startdate && params.enddate){
		datequery = " and yyyymmdd between ? and ? and times.time_id = store_data.time_id";
		params_arr.push(params.startdate);
		params_arr.push(params.enddate);
	} else if (params.startdate){
		datequery = " and yyyymmdd > ? and times.time_id = store_data.time_id";
		params_arr.push(params.startdate);
	} else if (params.enddate){
		datequery = " and yyyymmdd < ? and times.time_id = store_data.time_id";
		params_arr.push(params.enddate);
	} else {
		datequery = "";
	}

	sql += datequery;

	connection.query(sql, params_arr, function(err, result){
		if (err) throw err;
		callback(false, result);
	})
}

function formatData(data){
	//data is an array of RowDataPacket, a type of JS object. Loop through array, perform necessary sums, 
	//return in form that HTML file can directly use to plot. x is an array of store ids, y is the largest total sale value
	//for a store, stack keys -> array of distinct metric (in this case, unique categories, could also be product_ids, etc), 
	//stack values -> array of JS objects, each representing a store, whose keys are the distinct metric and values are number of times that metric occurs.
	
	//initialize return object with default values. These should ALL be replaced by the end of the function.
	var returned = {"x": [], "y": 0, "stack_keys": [], "stack_vals": []};

	var totals = {};
	var stack_vals_map = new Map();

	data.forEach(function (salesObj){

		//add distinct metric (category) to x array
		if (!(returned.x.includes(+salesObj.store_id))){
			returned.x.push(+salesObj.store_id);
		}
		
		//count up total sales for y 
		if (totals.hasOwnProperty(+salesObj.store_id)){
			totals[+salesObj.store_id] += +salesObj.unit_sales;
		} else {
			totals[+salesObj.store_id] = +salesObj.unit_sales;
		}

		//build stack_keys array for d3.stack()
		if (!(returned.stack_keys.includes(salesObj.category))){
			returned.stack_keys.push(salesObj.category);
		}

		//
		if (stack_vals_map.has(+salesObj.store_id)){
			if (stack_vals_map.get(+salesObj.store_id).hasOwnProperty(salesObj.category)){
				stack_vals_map.get(+salesObj.store_id)[salesObj.category] += salesObj.unit_sales;
			} else {
				stack_vals_map.get(+salesObj.store_id)[salesObj.category] = +salesObj.unit_sales;
			}
		} else {
				stack_vals_map.set(+salesObj.store_id, {[salesObj.category]: +salesObj.unit_sales, "store_id": +salesObj.store_id});
		}

	});

	//sort store ids
	returned.x.sort();

	//set y to largest total sales value
	returned.y = Math.max(...Object.values(totals));

	//convert stack_vals_map to appropriate format for d3.stack()
	returned.stack_vals = Array.from(stack_vals_map.values());

	return returned;
}

module.exports.retrieveData = retrieveData;
module.exports.formatData = formatData;

