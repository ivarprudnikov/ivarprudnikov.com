var express = require('express')
	, http = require('http')
	, path = require('path')
	, routes = require('./server/routes/init');

var app = express();

var oneYear = 86400000 * 365;

// CONFIGURE APP
////////////////////////////////

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/client-prod');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.favicon( path.join( __dirname, 'client-prod/favicon.ico'), { maxAge: oneYear } ));
app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('987a6s865d98as867d09dv0s9d60g6d09g6f9'));
app.use(express.session());
app.use(express.csrf());
app.use(function (req, res, next) {
	res.locals.token = req.session._csrf;
	next();
});
app.use(app.router);




// all necessary client resources
////////////////////////////////////////////////////////
var staticMainDir = 'client-prod';
var directoriesAndFiles = [
	'data',
	'fonts',
	'images',
	'scripts',
	'styles',
	'views',
	'404.html',
	'500.html',
	'favicon.ico',
	'index.html',
	'robots.txt'
];


// handle appcache files separately
////////////////////////////////////////////////////////
app.use(function (req, res, next) {
	if ('GET' != req.method && 'HEAD' != req.method) return next();
	if( req.path && req.path.match(/.*manifest\.appcache/) ){
		res.setHeader('Content-Type', 'text/cache-manifest');
		res.setHeader('Pragma', 'no-cache');
		res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		res.setHeader('Expires', '0');

		res.sendfile(path.join(__dirname, staticMainDir + req.path));

	} else {
		return next();
	}

});

// handle static files
////////////////////////////////////////////////////////
app.use( express.static( path.join(__dirname, staticMainDir), { maxAge: oneYear } ));

// 404 errors
////////////////////////////////////////////////////////
app.use(function (req, res, next) {
	res.status(404);
	if (req.accepts('html')) {
		res.render('404.html');
		return;
	}
	if (req.accepts('json')) {
		res.send({ error : 'Not found' });
		return;
	}
	res.type('txt').send('Not found');
});

// other errors
////////////////////////////////////////////////////////
app.use(function (err, req, res, next) {

	console.log(
		[
			"ERROR: " + (err.status || 500),
			"TIME: " + (new Date),
			"URL: " + req.url,
			"QUERY: " + JSON.stringify(req.query),
			"STACK: " + err.stack
		].join("; ")
	)

	res.status(err.status || 500);
	res.render('500.html', {
		status: err.status || 500
		, error: err
	});
});

// INIT ADDITIONAL CONFIG
////////////////////////////////

routes.init(app);

// CONNECT
////////////////////////////////

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});


