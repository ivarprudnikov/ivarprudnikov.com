'use strict';

angular.module('tApp', ['ui.router','ui.bootstrap','ngResource','ngAnimate','ui.keypress','ui.event','ngTouch'])
	.run(function($rootScope,$timeout,$window,$location) {

		$rootScope.menuIsActive = false;

		$rootScope.projectImagePath = 'https://s3-eu-west-1.amazonaws.com/ivarprudnikov/img/projects/';

		$rootScope.currentState = { name:'', pageTitle:'', pageDescription: '' };

		$rootScope.$on('$stateChangeStart',
			function(event, toState, toParams, fromState, fromParams){
				$rootScope.currentState.name = toState.name.replace(/\./g,'_');
        $rootScope.currentState.pageTitle = toState.data.pageTitle || '';
        $rootScope.currentState.pageDescription = toState.data.pageDescription || '';
				$('body').animate({ scrollTop: 0 }, 100);
			}
		);


		$rootScope.$on('$locationChangeSuccess',
			function(event){
				var pagePaths, pagePath;

				pagePaths = $window.location.href.split($window.location.host);
				if(pagePaths.length > 1) {
          pagePath = pagePaths[1];
        } else {
          pagePath = '/';
        }

				ga('send', {
					'hitType': 'pageview',
					'page': pagePath
				});

			}
		);
	})
	.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
		function ( $stateProvider, $urlRouterProvider, $locationProvider ) {

    $locationProvider.hashPrefix('!');

		$urlRouterProvider.otherwise('/main');

		$stateProvider
			.state( 'main', {
				url: '/main',
				abstract: true,
				views: {
					'navigation' : {
						templateUrl: 'views/menu.html',
						controller: 'MenuController'
					}
				},
        data: {
          pageTitle: 'Home page',
          pageDescription: 'Please welcome to my minimal protfolio site'
        }
			})
			.state('main.home', {
				url: '',
				views: {
					'main@' : {
						templateUrl: 'views/main.home.html',
						controller: 'HomeController'
					}
				}
			})
			.state('main.bio', {
				url: '/bio',
				views: {
					'main@' : {
						templateUrl: 'views/main.bio.html',
						controller: 'BioController'
					}
				},
        data: {
          pageTitle: 'Short bio'
        }
			})
			.state('main.work', {
				url: '/work',
				views: {
					'main@' : {
						templateUrl: 'views/main.work.html',
						controller: 'WorkController'
					}
				},
        data: {
          pageTitle: 'Work examples'
        }
			})
			.state('main.work.gallery', {
				url: '/gallery',
				views: {
					'list@main.work' : {
						templateUrl: 'views/main.work.gallery.html',
						controller: 'WorkGalleryController'
					}
				},
        data: {
          pageTitle: 'Gallery of project examples'
        }
			})
			.state('main.work.gallery.item', {
				url: '/:itemId',
				views: {
					'list@main.work' : {
						templateUrl: 'views/main.work.gallery.list.html',
						controller: 'WorkGalleryController'
					},
					// absolutely target content view
					'item@main.work' : {
						templateUrl: 'views/main.work.gallery.item.html',
						controller: 'WorkGalleryItemController'
					}
				}
			})
			.state('main.work.timeline', {
				url: '/timeline',
				views: {
					'list@main.work' : {
						templateUrl: 'views/main.work.timeline.html',
						controller: 'WorkTimelineController'
					}
				},
        data: {
          pageTitle: 'Timeline of experience'
        }
			})
			.state('main.work.timeline.item', {
				url: '/:itemId',
				views: {
					'list@main.work' : {
						templateUrl: 'views/main.work.timeline.list.html',
						controller: 'WorkTimelineController'
					},
					// absolutely target content view
					'item@main.work' : {
						templateUrl: 'views/main.work.timeline.item.html',
						controller: 'WorkTimelineItemController'
					}
				}
			})

			.state('main.hire', {
				url: '/hire',
				views: {
					'main@' : {
						templateUrl: 'views/main.hire.html',
						controller: 'HireController'
					},
					'hireContent@main.hire' : {
						templateUrl: 'views/main.hire.form.html'
					}
				},
        data: {
          pageTitle: 'Hire me form'
        }
			})
			.state('main.hire.locations', {
				url: '/locations',
				views: {
					'hireContent' : {
						templateUrl: 'views/main.hire.locations.html'
					}
				},
        data: {
          pageTitle: 'Available locations'
        }
			})
			.state('main.hire.future', {
				url: '/future',
				views: {
					'hireContent' : {
						templateUrl: 'views/main.hire.future.html'
					}
				},
        data: {
          pageTitle: 'Future locations'
        }
			})
			.state('main.hire.documents', {
				url: '/documents',
				views: {
					'hireContent' : {
						templateUrl: 'views/main.hire.documents.html'
					}
				},
        data: {
          pageTitle: 'Documentation'
        }
			});


  }]);
