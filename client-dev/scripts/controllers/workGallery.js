angular.module('tApp')
	.controller('WorkGalleryController', ['Projects', 'Companies','Skills','Languages','$scope','$rootScope','$timeout','$stateParams',
		function (Projects,Companies,Skills,Languages,$scope,$rootScope,$timeout,$stateParams) {

			var
				DEFAULT_MAX, DEFAULT_OFFSET,
				searchFilter, pagination,
				allProjects, allCompanies, allSkills, allLanguages, years,
				rootSearch
				;

			DEFAULT_MAX = 6;
			DEFAULT_OFFSET = 0;

			/**
			 * use project id when viewing one item
			 * @type {*}
			 */
			$scope.active_project_id = $stateParams["itemId"];

			/**
			 * Populate array of available years
			 * [ { year:"2013", selected:false }, .... ]
			 */
			years = $scope.years = _.reduce(
					( _.range(2003, (new Date).getFullYear() + 1).reverse() ),
					function(memo, year){
						memo.push( { year:year, selected:false } );
						return memo;
					},
					[]
				);

			/**
			 * Main search, observable search object
			 * @type {{company_ids: Array, years: Array, skill_ids: Array, language_ids: Array, ttt: null}}
			 */
			searchFilter = $scope.searchFilter = {
				company_ids : [],
				years : [],
				skill_ids : [],
				language_ids : [],
				ttt : null // when it is necessary to trigger change
			};

			/**
			 * Pagination observable object
			 * @type {{max: number, offset: number, nextOffset: null, prevOffset: null}}
			 */
			pagination = $scope.pagination = {
				max : DEFAULT_MAX,
				offset : DEFAULT_OFFSET,
				nextOffset: null,
				prevOffset: null
			};

			/**
			 * Save search params for reuse when coming back
			 * from single project view
			 */
			function updateLocationSearch(){
				var updatedSearchObject;
				updatedSearchObject = _.extend(_.omit(searchFilter, 'ttt'), _.omit(pagination, ["nextOffset", "prevOffset"]), {});
				$rootScope.gallerySearch = updatedSearchObject;
			}

			/**
			 * check if search options exist in
			 * $rootScope.gallerySearch and merge
			 * into search filters if true
			 */
			rootSearch = $rootScope.gallerySearch;
			if( _.isObject(rootSearch) && _.size(rootSearch)){

				_.each( _.keys(pagination), function(k){
					if(rootSearch[k])
						pagination[k] = rootSearch[k];
				});

				_.each( _.keys(searchFilter), function(k){
					if(rootSearch[k])
						searchFilter[k] = rootSearch[k];
				});
			}

			// watch filter and update model
			////////////////////////////////////////////

			allCompanies = $scope.companies = Companies.getAll();
			allSkills = $scope.skills = Skills.getAll();
			allLanguages = $scope.languages = Languages.getAll();
			allProjects = $scope.projects = Projects.getAll(filterAndSortPortfolio);

			$scope.$watch( 'searchFilter', filterAndSortPortfolio, true);


			/**
			 * one big massive filter function
			 * Will filter results based on filter contents.
			 * Will update `selected` state for result objects.
			 * Will update pagination obj
			 * Will sync rootScope filter details
			 */
			function filterAndSortPortfolio(){

				executeFilter(function(projects){
					paginate(projects, function(paginatedProjects){
						// save preferences
						updateLocationSearch();
						$scope.projects = paginatedProjects;
					});
				});


				function executeFilter(callback){

					var filteredByProperty = allProjects;

					// filter
					if(searchFilter.company_ids.length){
						filteredByProperty = _.filter(filteredByProperty, function(proj){
							return _.contains(searchFilter.company_ids, proj["company_id"] );
						});

						// reflect selected companies
						_.each(allCompanies, function(obj, index, list){
							obj.selected = _.indexOf(searchFilter.company_ids, obj.id) > -1;
						});
					} else {
						_.each(allCompanies, function(obj, index, list){
							obj.selected = false;
						});
					}

					if(searchFilter.years.length){

						filteredByProperty = _.filter(filteredByProperty, function(proj){

							// check if project from/to fields value matches
							// years selected

							var fromDate = new Date(), fromYear, toDate = new Date(), toYear,
								yearsToCheck = [], contains;

							if(proj.from){
								fromDate.setTime(proj.from)
							}
							if(proj.to){
								toDate.setTime(proj.to)
							}

							fromYear = fromDate.getFullYear();
							toYear = toDate.getFullYear();

							if(fromYear === toYear)
								yearsToCheck = [toYear];
							else
								yearsToCheck = _.range(fromYear,toYear + 1);

							contains = _.some(searchFilter.years, function(yearValue){
								return _.contains(yearsToCheck, yearValue )
							});

							return contains;
						});

						// reflect selected years
						_.each(years, function(obj, index, list){
							obj.selected = _.indexOf(searchFilter.years, obj.year) > -1;
						});

					} else {
						_.each(years, function(obj, index, list){
							obj.selected = false;
						});
					}

					if(searchFilter.skill_ids.length){
						filteredByProperty = _.filter(filteredByProperty, function(proj){
							return _.some(searchFilter.skill_ids, function(filterSkillId){
								return _.contains(proj.skills, filterSkillId )
							})
						});

						// reflect selected skills
						_.each(allSkills, function(obj, index, list){
							obj.selected = _.indexOf(searchFilter.skill_ids, obj.id) > -1;
						});
					} else {
						_.each(allSkills, function(obj, index, list){
							obj.selected = false;
						});
					}

					if(searchFilter.language_ids.length){
						filteredByProperty = _.filter(filteredByProperty, function(proj){
							return _.some(searchFilter.language_ids, function(filterLanguageId){
								return _.contains(proj.languages, filterLanguageId )
							})
						});

						// reflect selected languages
						_.each(allLanguages, function(obj, index, list){
							obj.selected = _.indexOf(searchFilter.language_ids, obj.id) > -1;
						});
					} else {
						_.each(allLanguages, function(obj, index, list){
							obj.selected = false;
						});
					}

					if(callback != null && typeof callback === 'function'){
						callback(filteredByProperty);
					} else {
						throw new Error("fn executeFilter requires callback function");
					}

				} // end executeFilter()


				function paginate(projects,callback){

					var paginated, direction;

					// save pagination details
					pagination.prevOffset = (pagination.offset - pagination.max) > -1 ? (pagination.offset - pagination.max) : null;
					pagination.nextOffset = (pagination.offset + pagination.max) >= projects.length ? null : (pagination.offset + pagination.max);

					// paginate results
					paginated = projects.slice(pagination.offset,(pagination.max + pagination.offset));

					if(callback != null && typeof callback === 'function'){
						callback(paginated);
					} else {
						throw Error("fn paginate requires callback function");
					}

				}

			}



			// public methods allowing filtering
			////////////////////////////////////////////

			$scope.toggleCompany = function(companyId){

				// RESET MAX & OFFSET
				pagination.offset = DEFAULT_OFFSET;
				pagination.max = DEFAULT_MAX;

				// update search filter
				if(companyId != null){
					if( _.indexOf(searchFilter.company_ids, companyId) > -1 ){
						searchFilter.company_ids = _.difference(searchFilter.company_ids, [companyId]);
					} else {
						searchFilter.company_ids = _.union(searchFilter.company_ids, [companyId]);
					}
				} else {
					searchFilter.company_ids = [];
				}

				// TRIGGER CHANGE
				searchFilter.ttt = (new Date).getTime();
			};

			$scope.toggleYear = function(y){

				// RESET MAX & OFFSET
				pagination.offset = DEFAULT_OFFSET;
				pagination.max = DEFAULT_MAX;

				if(y != null){
					// update search filter
					if( _.indexOf(searchFilter.years, y) > -1 ){
						searchFilter.years = _.difference(searchFilter.years, [y]);
					} else {
						searchFilter.years = _.union(searchFilter.years, [y]);
					}

				} else {
					searchFilter.years = [];
				}

				// TRIGGER CHANGE
				searchFilter.ttt = (new Date).getTime();
			};

			$scope.toggleSkill = function(id){

				// RESET MAX & OFFSET
				pagination.offset = DEFAULT_OFFSET;
				pagination.max = DEFAULT_MAX;

				if(id != null){
					// update search filter
					if( _.indexOf(searchFilter.skill_ids, id) > -1 ){
						searchFilter.skill_ids = _.difference(searchFilter.skill_ids, [id]);
					} else {
						searchFilter.skill_ids = _.union(searchFilter.skill_ids, [id]);
					}
				} else {
					searchFilter.skill_ids = [];
				}

				// TRIGGER CHANGE
				searchFilter.ttt = (new Date).getTime();

			};

			$scope.toggleLanguage = function(id){

				// RESET MAX & OFFSET
				pagination.offset = DEFAULT_OFFSET;
				pagination.max = DEFAULT_MAX;

				if(id != null){
					if( _.indexOf(searchFilter.language_ids, id) > -1 ){
						searchFilter.language_ids = _.difference(searchFilter.language_ids, [id]);
					} else {
						searchFilter.language_ids = _.union(searchFilter.language_ids, [id]);
					}
				} else {
					searchFilter.language_ids = [];
				}

				// TRIGGER CHANGE
				searchFilter.ttt = (new Date).getTime();

			};


			// public methods allowing pagination
			////////////////////////////////////////////

			$scope.prevPage = function(){
				if(pagination.prevOffset != null){
					pagination.offset = pagination.prevOffset;

					// trigger change to filter
					searchFilter.ttt = (new Date).getTime()
				}
			};

			$scope.nextPage = function(){
				if(pagination.nextOffset != null){
					pagination.offset = pagination.nextOffset;

					// trigger change to filter
					searchFilter.ttt = (new Date).getTime()
				}
			};


			// other public methods
			////////////////////////////////////////////

			$scope.isAnyItemSelected = function(itemObjectList){
				return _.some(itemObjectList,function(x){return x.selected})
			};


			$scope.isFilterActive = function(){

				var isActive = false,
					scopeVars = ["companies", "skills", "languages", "years"];

				return _.some(scopeVars, function( variableName ){
					return $scope.isAnyItemSelected( $scope[variableName] )
				});

			};


			$scope.clearAllFilters = function(){
				$scope.toggleCompany();
				$scope.toggleYear();
				$scope.toggleSkill();
				$scope.toggleLanguage();
			};


	}]);
