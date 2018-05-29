var express = require('express');
var dbs = require('./routes/uitestdb');
var app = express();


var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

app.get('/findAll/:id/:scope/:pageNum', dbs.findAll);
app.get('/readFile/:file', dbs.readFile);

//IDE sends the test result( result of each test case and profiling data) 
app.post('/addTestResult', upload.array('results'), dbs.addResult);

app.set('views', __dirname + '/views'); // specify the views directory
app.set('view engine', 'ejs'); // register the template engine

app.use('/static', express.static(__dirname + '/public'));
app.use('/lib', express.static(__dirname + '/node_modules'));

//overall test result(show the result of all test which user tries to) 
app.get('/', function (req, res, next) {
	console.log("======/");
	res.render('showAll', {title: 'title', message: 'Hello World', id:'000000000000', scope:'gt', pageNum:1 });
	//res.render('index', {title: 'title', message: 'Hello World' });
});
//overall test result(show the result of all test which user tries to) 
app.get('/showAll/:id/:scope/:pageNum', function (req, res, next) {
	console.log("app.js " + req.params.id + ", " + req.params.scope + ", " + req.params.pageNum);
	res.render('showAll', {title: 'title', message: 'Hello World', id:req.params.id, scope:req.params.scope, pageNum:req.params.pageNum });
	//res.render('index', {title: 'title', message: 'Hello World' });
});
//show the result of one test details( profiling result and the result of each test case)
app.get('/showDetails/:resultfile/:profilefile/:packageName/:sdk/:version/:period/:model/:manufacturer/:release/:country', function (req, res, next) {
	res.render('showDetails', {title: 'title', message: 'Hello World', packageName : req.params.packageName, sdk : req.params.sdk, version : req.params.version, period : req.params.period, model : req.params.model, manufacturer: req.params.manufacturer, release:req.params.release, country:req.params.country, result : req.params.resultfile, profilefile : req.params.profilefile});


});


app.listen(3000, function () {
	console.log('run server http://localhost:3000');
});
