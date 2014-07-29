(function (exports) {

	"use strict";

	exports.init = function (app) {

		var AWS = require('aws-sdk');
		AWS.config.update({region: 'eu-west-1'});
		var ses = new AWS.SES({region: 'eu-west-1'});

		app.get('/', function (req, res) {

			var data = {};

			return res.format({
				html: function(){
					res.render('index.html');
				},
				json: function(){
					res.send(data);
				}
			});

		});

		app.get('/token', function (req, res) {
			res.send({
				token: req.session._csrf
			});
		})

		app.post('/sendemail', function (req, res) {

			var response = {
				sent:false
			};

			ses.sendEmail({
				Source:'info@ivarprudnikov.com',
				Destination:{
					ToAddresses:["ivar.prudnikov@gmail.com"]
				},
				Message: {
					Subject: {
						Data: req.body.subject
					},
					Body: {
						Html: {
							Data: req.body.message
						}
					}
				},
				ReplyToAddresses: [req.body.email]
			}, function(error,responseData){

				if(error == null){
					response.sent = true;
				} else {
					res.status = 400;
					response.error = error;
				}

				res.send(response);
			}); // end ses send

		});

	};

}(exports));