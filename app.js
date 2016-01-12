var express = require('express');
var app = express();


app.set('views', __dirname + '/views'); // specify the views directory
app.set('view engine', 'ejs'); // register the template engine

app.use('/static', express.static(__dirname + '/public'));

app.get('/', function (req, res, next) {
	res.render('index', {title: 'title', message: 'Hello World' });
});

app.listen(3000, function () {
	console.log('run server http://localhost:3000');
});
