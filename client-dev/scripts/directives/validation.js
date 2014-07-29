angular.module('tApp')
	.directive( 'rcSubmit', ['$parse', function ($parse) {
	    return {
	        restrict: 'A',
	        require: ['rcSubmit', '?form'],
	        controller: ['$scope', function ($scope) {
	            this.attempted = false;
	            
	            var formController = null;
	            
	            this.setAttempted = function() {
	                this.attempted = true;
	            };
	            
	            this.setFormController = function(controller) {
	              formController = controller;
	            };
	            
	            this.needsAttention = function (fieldModelController) {
	                if (!formController) return false;
	                
	                if (fieldModelController) {
	                    return fieldModelController.$invalid && (fieldModelController.$dirty || this.attempted);
	                } else {
	                    return formController && formController.$invalid && (formController.$dirty || this.attempted);
	                }
	            };
	        }],
	        compile: function(cElement, cAttributes, transclude) {
	            return {
	                pre: function(scope, formElement, attributes, controllers) {
	                  
	                    var submitController = controllers[0];
	                    var formController = (controllers.length > 1) ? controllers[1] : null;
	                    
	                    submitController.setFormController(formController);
	                    
	                    scope.rc = scope.rc || {};
	                    scope.rc[attributes.name] = submitController;
	                },
	                post: function(scope, formElement, attributes, controllers) {
	                	
	                    var submitController = controllers[0];
	                    var formController = (controllers.length > 1) ? controllers[1] : null;
	                    var fn = $parse(attributes.rcSubmit);
	                    var submitFn = function (eee) {

							submitController.setAttempted();

							// HACK https://github.com/angular/angular.js/issues/1460#issuecomment-24404240
							$('input[ng-model]', formElement).each(function (index, item) {
								if (angular.element(this).attr('type') !== 'checkbox' && angular.element(this).attr('type') !== 'radio') {
									angular.element(this).controller('ngModel').$setViewValue($(this).val());
								}
							});

							if (!scope.$$phase) scope.$apply();

							if (!formController.$valid) return false;

							scope.$apply(function() {
								fn(scope, {$event:eee});
							});
						}

	                    formElement.bind('submit', submitFn);

						formElement.on('$destroy', function() {
							formElement.unbind();
						});
	                }
	            };
	        }
	    }
	}] );