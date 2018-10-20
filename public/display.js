document.getElementById("options").addEventListener("submit", displayChart);


function displayChart(submission){
	//disable submit default action
	submission.preventDefault();

	//clear current chart
	d3.selectAll("svg").remove();

	//margins for graph
	const margin = {top:20, right:30, bottom:30, left:40};
	const width = 800-margin.left-margin.right;
	const height = 500-margin.top-margin.bottom;

	//x and y scale
	var yScale = d3.scaleLinear().rangeRound([height,0]);
	var xScale = d3.scaleBand().rangeRound([0,width]).paddingInner(0.05).align(0.1);

	//colors
	var c10 = d3.scaleOrdinal(d3.schemeCategory10);

	//scalable vector graphic (svg)
	var svg = d3.select("body")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom + 20)
		.append("g")
		.attr("transform","translate(" + margin.left + "," + margin.right + ")");

	//retrieve inputs
	var categories_arr = document.getElementsByName("categories[]");
	var categories = [];
	for (var i = 0; i < categories_arr.length; i++){
		if (categories_arr[i].checked){
			categories.push(categories_arr[i].value);
		}
	}

	var startdate = document.getElementById("startdate").value;

	var enddate = document.getElementById("enddate").value;

	//request data from server
	$.get("http://localhost:8080/retrieve-data?categories=" + categories + "&startdate=" + startdate + "&enddate=" + enddate, function (json){

		//set x and y domains
		yScale.domain([0,json.y]);
		xScale.domain(json.x);

		//map colors to product categories
		c10.domain(json.stack_keys);

		//create x and y axes
		var xAxis = d3.axisBottom(xScale);
		var yAxis = d3.axisLeft(yScale);

		//create horizontal grid lines
		svg.append("g")
		.selectAll("g")
		.data(d3.stack().keys(json.stack_keys)(json.stack_vals))
		.enter().append("g")
		.attr("fill", function(d){
			return c10(d.key);
		})
		.attr("class", "grid")
		//create bars
		.selectAll("rect")
					.data(function(d){
						return d;
					})
					.enter()
					.append("rect")
					.attr("class", "bar")
					.attr("width", xScale.bandwidth())
					.attr("y", function(d){
						return yScale(d[1]);
					})
					.attr("x", function(d){
						return xScale(d.data.store_id) + 20;
					})
					.attr("height", function(d){
						return yScale(d[0]) - yScale(d[1]);
					})
					.on("mouseover", function (d){
						d3.select(this).attr("opacity", 0.5);
					})
					.on("mouseout", function (){
						d3.select(this).attr("opacity", 1);
					})

		svg.append("g")
		.attr("transform", "translate(20," + height + ")")
		.call(xAxis)
		.attr("class", "x axis");

		svg.append("g")
		.attr("transform", "translate(20, 0)")
		.attr("class", "y axis")
		.call(yAxis)

		//create axes text
		svg.append("text")             
		.attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 20) + ")")
		.style("text-anchor", "middle")
		.text("Store ID");

		svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left)
		.attr("x",0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Total Units Sold");  

		//create legend
	  	var legend = svg.append("g")
	      .attr("font-family", "sans-serif")
	      .attr("font-size", 10)
	      .attr("text-anchor", "end")
	    .selectAll("g")
	    .data(json.stack_keys.slice())
	    .enter().append("g")
	      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	  	legend.append("rect")
	      .attr("x", width + 1)
	      .attr("width", 19)
	      .attr("height", 19)
	      .attr("fill", c10);

	  	legend.append("text")
	      .attr("x", width - 4)
	      .attr("y", 9.5)
	      .attr("dy", "0.32em")
	      .text(function(d) { return d; });
	});

}