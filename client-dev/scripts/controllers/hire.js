angular.module('tApp')
	.controller('HireController', ['$scope','$rootScope','$timeout','$http','$window', function ($scope,$rootScope,$timeout,$http,$window) {

		var errorMap = {
			general: {
				message: 'Could not send email, try again later.',
				eventLabel: 'error-server'
			},
			severe: {
				message: 'Server Error. Could not send email, try again later.',
				eventLabel: 'error-server-severe'
			},
			token: {
				message: 'Server Error. Could not send email, try again later.',
				eventLabel: 'error-server-token'
			}
		};

		$scope.visitor = {
			email: '',
			subject: '',
			message: '',
			enquiry: '',
			organization_type: ''
		};

		$scope.formIsSent = false;
		$scope.submittingData = false;

		$scope.project_types = [
			{ id:1, active:true, name:'Open source'},
			{ id:2, active:true, name:'Private B2B'},
			{ id:3, active:true, name:'Private B2C'},
			{ id:4, active:true, name:'Other'}
		];

		$scope.person_represents = [
			{ id:1, active:true, name:'HR agency'},
			{ id:2, active:true, name:'Private company'},
			{ id:3, active:true, name:'Project'},
			{ id:4, active:true, name:'Other'}
		]

		$scope.enquiry_types = [
			{ id:1, active:true, name:'Contract role'},
			{ id:2, active:false, name:'Permanent role'},
			{ id:3, active:true, name:'Help required for existing project'},
			{ id:4, active:true, name:'I have an idea'},
			{ id:5, active:true, name:'Join our startup'},
			{ id:6, active:true, name:'Other'}
		];

		$scope.sendAgain = function(){
			$window.location.reload();
		}

		$scope.sendEmail = function(){

			var visitorClone = _.clone($scope.visitor);
			var errors = validateVisitor(visitorClone);

			if(errors != null){
				$scope.formErrors = errors;
				sendEmailAnalyticsEvent("error-ui");
				return false;
			}

			prepareScopeForEmailDispatch();

			buildPostData(visitorClone, function(emailData){
				sendEmailData(emailData);
			});

		};

		function prepareScopeForEmailDispatch(){
			$scope.submittingData = true;
		}

		function handleEmailSuccess(){
			$scope.formIsSent = true;
			$scope.visitor = {};
			$scope.submittingData = false;
			sendEmailAnalyticsEvent("success");
		}
		function handleEmailError(errObj){
			$scope.formErrors = [errObj.message];
			$scope.submittingData = false;
			sendEmailAnalyticsEvent(errObj.eventLabel);
		}

		function sendEmailAnalyticsEvent(label){
			ga('send', {
				'hitType': 'event',          // Required.
				'eventCategory': 'email',   // Required.
				'eventAction': 'submit',      // Required.
				'eventLabel': label
			});
		}

		/**
		 * Should almost always pass validation as Angular validated
		 * model already, but who knows..
		 * @param visitorObj
		 * @returns {Array}
		 */
		function validateVisitor(visitorObj){
			var errors = [];

			if(!visitorObj.email)
				errors.push("Email is required");
			if(!visitorObj.subject)
				errors.push("Subject is required");
			if(!visitorObj.message)
				errors.push("Message is required");
			if(!visitorObj.enquiry || !visitorObj.enquiry.name)
				errors.push("Enquiry type must be selected");
			if(!visitorObj.organization_type || !visitorObj.organization_type.name)
				errors.push("Organization type must be selected");

			return errors.length ? errors : null;
		};


		function buildPostData(visitorObj, callback){

			var o1,o2;
			o1 = _.extend( {}, visitorObj);
			o2 = _.pick( o1, ['email', 'subject']);
			o2.message = [
				"<p>Enquiry: " + o1.enquiry.name + "</p>",
				"<p>Organization: " + o1.organization_type.name + "</p>",
				"<p>Email: " + o1.email + "</p>",
				"<p>Subject: " + o1.subject + "</p>",
				"<p>Message: " + o1.message + "</p>"
			].join("<br/>");

			$http.get( "/token" )
				.success(function(data, status, headers, config) {
					if(status == 200 && data && data.token){

						o2._csrf = data.token
						callback(o2);

					} else {
						handleEmailError(errorMap.token);
					}
				}).error(function(data, status, headers, config) {
					handleEmailError(errorMap.token);
				});

		}


		function sendEmailData(emailData){

			$http.post("/sendemail", emailData )
				.success(function(data, status, headers, config) {
					if(status == 200 && data && data.sent == true){
						handleEmailSuccess();
					} else {
						handleEmailError(errorMap.general);
					}

				}).error(function(data, status, headers, config) {
					handleEmailError(errorMap.severe);
				});

		}

	}]);
