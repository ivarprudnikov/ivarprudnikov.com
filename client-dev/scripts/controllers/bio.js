'use strict';

angular.module('tApp')
	.controller('BioController', ['$scope','$rootScope','$timeout', function ($scope,$rootScope,$timeout) {

		$scope.animateHeader = false;

		$timeout(function() {
			$scope.animateHeader = true;
		}, 100);


		// Technologies visibility
		/////////////////////////////////////

		$scope.languageBlock = null;
		$scope.updateLanguageBlock = function(frontOrBack,idx){
			if(frontOrBack === 'front' && (!$scope.languageBlock || $scope.codeDataFrontEnd[idx].lang !== $scope.languageBlock.lang) ){
				$scope.languageBlock = $scope.codeDataFrontEnd[idx];
			} else if(frontOrBack === 'back' && (!$scope.languageBlock || $scope.codeDataBackEnd[idx].lang !== $scope.languageBlock.lang) ) {
				$scope.languageBlock = $scope.codeDataBackEnd[idx];
			} else {
        $scope.languageBlock = null;
      }
		};


		// Expertise visibility
		/////////////////////////////////////

		$scope.expertiseDescription = null;
		$scope.updateExpertise = function(frontOrBack,idx){
			if( frontOrBack === 'front' && (!$scope.expertiseDescription ||
				$scope.expertiseFront[idx].title !== $scope.expertiseDescription.title) ){

				$scope.expertiseDescription = $scope.expertiseFront[idx];
			} else if ( frontOrBack === 'back' && (!$scope.expertiseDescription ||
				$scope.expertiseBack[idx].title !== $scope.expertiseDescription.title) ) {

				$scope.expertiseDescription = $scope.expertiseBack[idx];
			} else {
        $scope.expertiseDescription = null;
      }
		};


		// Technologies
		//////////////////////////

		$scope.codeDataBackEnd = [
      {
        lang:'cassandra',
        text:'The Apache Cassandra database is the right choice when you need scalability and high availability without compromising performance.'
      },
      {
        lang:'grails',
        text:'Grails is an open source web application framework that uses the Groovy programming language.'
      },
      {
        lang:'groovy',
        text:'Groovy is an object-oriented programming language for the Java platform. It is a dynamic language with features similar to those of Python, Ruby, Perl, and Smalltalk.'
      },
      {
        lang:'hibernate',
        text:'Object-relational mapping (ORM) library for the Java language, providing a framework for mapping an object-oriented domain model to a traditional relational database.'
      },
      {
        lang:'java',
        text:'Java is a general-purpose, concurrent, class-based, object-oriented computer programming language that is specifically designed to have as few implementation dependencies as possible.'
      },
			{
				lang:'mongodb',
				text:'MongoDB is a cross-platform document-oriented database system.'
			},
      {
        lang:'mysql',
        text:'the world\'s most widely used open-source relational database management system'
      },
      {
        lang:'node.js',
        text:'Node.js is a platform built on Chrome\'s JavaScript runtime for easily building fast, scalable network applications.'
      }
		];

		$scope.codeDataFrontEnd = [
      {
        lang:'angular',
        text:'AngularJS is what HTML would have been, had it been designed for building web-apps.'
      },
      {
        lang:'android',
        text:'Android is the customizable, easy to use operating system that powers more than a billion devices across the globe.'
      },
			{
				lang:'backbone',
				text:'Backbone supplies structure to JavaScript-heavy applications.'
			},
      {
        lang:'css/less/sass',
        text:'Cascading Style Sheets (CSS) is a style sheet language used for describing the presentation semantics (the look and formatting) of a document written in a markup language.'
      },
      {
        lang:'html/jade',
        text:'HyperText Markup Language (HTML) is the main markup language for creating web pages and other information that can be displayed in a web browser.'
      },
      {
        lang:'javascript',
        text:'JavaScript is a prototype-based scripting language with dynamic typing and has first-class functions.'
      },
      {
        lang:'sencha/cordova/phonegap',
        text:'JavaScript frameworks for building cross-platform mobile web applications.'
      }
		];

		// EXPERTISE
		//////////////////////////

		$scope.expertiseFront = [
			{
				title:'UI',
				className: 'expertise-ui',
				text:'Drawings, flyers, posters - it was starting point of everything I am now, and although I work mainly on engineering solutions I still enjoy and maintain graphical assets, create new ones.'
			},
			{
				title:'UX',
				className: 'expertise-ux',
				text:'I am more than happy to be part of UX decisions as it involves analytics, observations, new design patterns.'
			},
			{
				title:'SPA',
				className: 'expertise-spa',
				text:'Single Page Applications are present & future. It is also challenging as requires adoption of new dev techniques, new design patterns.'
			}
		];

		$scope.expertiseBack = [
			{
				title:'REST',
				className: 'expertise-rest',
				text:'Representational state transfer is usually the first choice when I develop backend services as it is predictable and modular, sometimes repetitive though.'
			},
			{
				title:'API',
				className: 'expertise-api',
				text:'Cannot imagine rich application without some sort of third party api that needs integration. Maps, social networks, video, you name it, I\'ve been there'
			},
			{
				title:'Servers',
				className: 'expertise-servers',
				text:'I am no stranger to DevOps, usually using IaaS (Infrastructure as a Service) from Amazon'
			}
		];



	}]);
