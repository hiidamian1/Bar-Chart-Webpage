const express = require('express');
const path = require('path');
const d3 = require('d3');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

const dataTools = require('./data.js');

app.get('/', function (req, res){
	res.sendFile(path.join(__dirname, 'd3withsql.html'));
});

app.get('/retrieve-data', function (req, res){
	dataTools.retrieveData(req.query, function(error, data){
		res.json(dataTools.formatData(data));
	});
});


app.listen(8080);