const express = require('express');
const path = require('path');
const d3 = require('d3');

const app = express();
app.use(express.static('public'));

app.get('/', function (req, res){
	res.sendFile(path.join(__dirname, 'testd3stack.html'));
	//console.log("hello");
});

app.listen(8080);