app.controller('ProjectsCtrl', function($scope, $http, Projects) {
    
    var after = Projects.getNInitialItems();
    var nItemsToFetch = Projects.getNItemsToFetch();
    $scope.reachedEnd = false;
    $scope.busy = false;
        
	$scope.projects = Projects.getProjects();
	$scope.noResult = Projects.givesNoResult();
    
    $scope.onlyImg = Projects.getOnlyImg();
    		
	function updateProjects(newValue, oldValue) {
		$scope.projects = newValue;		
		$scope.noResult = Projects.givesNoResult();
	};
    
    function updateGetOnlyImg(newValue, oldValue) {
        $scope.onlyImg = newValue;
        $scope.reachedEnd = false;
    };
    
    $scope.$watch(Projects.getOnlyImg, updateGetOnlyImg);
	
	$scope.$watch(Projects.getProjects, updateProjects);
    
    $scope.toShow = function(project) {
        return Boolean(!$scope.onlyImg || project.image_file != '' || project.wikipedia_image_url !='')
    };
    
    // Get image width and height
    
    function getMeta(url){
      $("<img/>").attr("src", url).load(function(){
         s = {w:this.width, h:this.height};
         return s;      
      }); 
    }
    
    // $scope.getThumbUrl = function(project) {
    //
    //     project.baseUrl = project.wikipedia_image_url;
    //
    //     $("<img/>").attr("src", project.baseUrl + "?width=100").load(function(){
    //        if (this.width/this.height > 4/3) {
    //            project.output = project.baseUrl + "?width=" + 400 * this.width/this.height
    //        }
    //        else {
    //            project.output = project.baseUrl + "?width=400"
    //        }
    //     });
    //
    //     return project.output
    //
    // }
    
    $scope.nextPage = function() {
        
        // Avoid making too many requests
        if ($scope.busy) return;
        $scope.busy = true;
        
        var resource;
        
        console.log(after);
        
        var params = { after: after, nitems: nItemsToFetch, only_img: $scope.onlyImg };
                
        switch (Projects.getCurrentSource()) {
            
            case 'home':
                resource = $http.get('/api/projects/', {
                    params: params
                });

                break;
                
            case 'search':
                                                
                var extendedParams = angular.extend(Projects.getCurrentSearchParams(), params);
                console.log("Youhou");
                resource = $http.get('/api/search/', {
                    params: extendedParams
                });
                break;
                
        };
        
        resource.success(function(data, status) {
            newProjects = data;
            if (newProjects.length == 0) {
                console.log("Reached end!");
                $scope.reachedEnd = true;
            }
                    
            else {
                // Stop fetching if onlyImg and reached entries of user 12 ie. KMLImporter
                // Else content is always fetched until the end...
                
                if($scope.onlyImg && newProjects[0].owner == 12) {
                    $scope.reachedEnd = true;
                }
                
                for (var i = 0; i < newProjects.length; i++) {
                  $scope.projects.push(newProjects[i]);
                }
                after += nItemsToFetch;
            };
        
            $scope.busy = false;
        });     
    }; 	
	
});

app.controller('ProjectDetailCtrl',function($scope, $routeParams, $modal, $http, $location, $anchorScroll, Restangular, AuthService, Projects) {
    
    
    // **** Manage editing permissions ****
    
	$scope.isLogged = false;
    $scope.project = {'owner': -1};
    var loggedUser = AuthService.getUser();
    
    $scope.username = "";
    
    $scope.checkIfStaffOrOwner = function() {       
        
        if (AuthService.isStaff()) {
            return true;
        }
        
        else {
            
            loggedUser = AuthService.getUser();
            
            if (loggedUser != null) {                
                if (loggedUser.hasOwnProperty('id')) {
                    if (loggedUser.id == $scope.project.owner) {
                        return true;
                    }
                }
            }
            
            return false;
        }
    };
        
	function updateIsLogged(newValue, oldValue) {
		$scope.isLogged = newValue;
        loggedUser = AuthService.getUser();
		$scope.username = AuthService.getUsername();
	};

	$scope.$watch(AuthService.checkLogin, updateIsLogged);	
    
    $scope.edit = function() {
        $location.path('/project-edit/' + $routeParams.projectId);
    };
    
    var confirmModalInstanceCtrl = function($scope, $modalInstance) {

        $scope.ok = function() {
            $modalInstance.close();
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

    
    $scope.delete = function() {
        
        var modalInstance = $modal.open({
          templateUrl: 'confirmModalContent.html',
          controller: confirmModalInstanceCtrl,
          });

        modalInstance.result.then(function () {
            $http.delete('api/projects/' + $routeParams.projectId + '/').success(function() {
                Projects.initProjects();
                $location.path('/');
            });
        });
    };
    
	// **** GOOGLE MAP ****

	angular.extend($scope, {

		map: {
			control: {},
			markersControl: {},
			refresh: true,
			center: {
				latitude: 0,
				longitude: 0
			},
			zoom: 15,
			bounds: {},
			dragging: false,
			options: {},
			events: {},
			marker: {
				control: {},
				id: 1,
				coords: {
					latitude: 0,
					longitude: 0
				},
				showWindow: false,
				options: {
					title: "hello"
				}
			}
		}
	});
	 	
	google.maps.visualRefresh = true;
	 
	$scope.map.events = {
		tilesloaded: function (map) {
			$scope.$apply(function () {
				$scope.mapInstance = map;
			});
		}
	};

	$http.get('api/projects/' + $routeParams.projectId + '/').success(function(data) {
		
		$scope.project = data;
        		
        Projects.setCurrentProject(data); // Store current project data for potential edition
        
        $scope.hasPubDate = Boolean(data.pub_date != '');
		$scope.map.center.latitude = $scope.project.latitude;
		$scope.map.center.longitude = $scope.project.longitude;
		$scope.map.marker.coords.latitude = $scope.project.latitude;
		$scope.map.marker.coords.longitude = $scope.project.longitude;
		$scope.map.marker.options.title = $scope.project.name;
		$scope.map.refresh = true; 	  
		$scope.map.markersControl.getGMarkers()[0].title = $scope.project.name;
        
        console.log($scope.project.owner);
	  
		Restangular.one('users', $scope.project.owner).get().then(function(publisher) {
			$scope.publisher = publisher;
		});	  	  
	});

	// **** IMAGE POP-UP ****
	  
	var imageModalInstanceCtrl = function ($scope, $modalInstance, image) {
	  
		$scope.image = image;
        
        $scope.close = function() {
            $modalInstance.dismiss('close');
        };

		};

	$scope.open = function (size) {
	

		var modalInstance = $modal.open({
			templateUrl: 'myModalContent.html',
			controller: imageModalInstanceCtrl,
			windowClass: "modal fade in",
			size: size,
			resolve: {
				image: function () {			  
					return $scope.project.image_file;
				}
			}
		});

	};
	
});

app.controller("ProjectEditCtrl",function ($scope, $http, $routeParams, $location, $timeout, Projects, AuthService, Restangular) {
	
    var mydata;
    var rngdata;
    $scope.project = {};
    $scope.project.name = "";
    
    
    $http.get('/api/projects/' + $routeParams.projectId + '/').success( function(data) {
        
        $scope.project = data;
        delete $scope.project.image_file;
        delete $scope.project.thumbnail_file;
        
        // Reattribute projects from KMLImporter
        
        if ($scope.project.owner == 12) {
            $scope.project.owner = AuthService.getUser().id;
            var date = new Date(Date.now());
            $scope.project.pub_date = date.toISOString();
            console.log("Projects belongs to KMLImporter");
        }
        
        if ($scope.project.address == '') {
            
            var output;

            geocoder = new google.maps.Geocoder();
        
            var latlng = new google.maps.LatLng($scope.project.latitude, $scope.project.longitude);
    
            geocoder.geocode({'latLng': latlng}, function(results, status) {
                
                if (status == google.maps.GeocoderStatus.OK) {           
                    if (results[1]) {
                        output = results[1].formatted_address;
                    } else {
                        output = 'No results found';
                    }
                } else {
                    output = 'Geocoder failed due to: ' + status;
                }
        
                $scope.project.address = output;
                $scope.$apply();
        
            });
            
        }

    });
    
    
        
    $scope.gmapbox_result = '';
	$scope.gmapbox_options = null;
	$scope.gmapbox_details = '';
    
        
    $scope.save = function() {
        
		fd = new FormData();
		fd.append('name', $scope.project.name);
		fd.append('architect', $scope.project.architect);
		fd.append('address', $scope.project.address);
        fd.append('id', $scope.project.id);
        fd.append('owner', $scope.project.owner);
        fd.append('pub_date', $scope.project.pub_date);
		
        if ($scope.image_file) {
            fd.append('image_file', $scope.image_file);
            console.log("has image")
        }

        $http.patch('/api/projects/' + $routeParams.projectId + '/', 
        fd,
        {   transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).error(function(data, status, headers, config) {
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);

        }).
        success(function() {
            console.log("Project successfully patched");
            $scope.saved = true;
        });
    };
    
    $scope.done = function() {
        Projects.initProjects();
        $location.path('/');
    };
    
	function updateSaved() {
        $scope.saved = false;
	}

	$scope.$watch('project', updateSaved, true);
    
});

app.controller('MenuCtrl', function($rootScope, $scope, $http, $window, $location, api, menuVisibilityService, AuthService, Projects){

	$scope.isLogged = false;
	$scope.username = "";
    $scope.onlyImg = Projects.getOnlyImg();
    
    $scope.toggleOnlyImg = function() {
        Projects.toggleOnlyImg();
    }

	function updateIsLogged(newValue, oldValue) {
		$scope.isLogged = newValue;
		$scope.username = AuthService.getUsername();
	}

	$scope.$watch(AuthService.checkLogin, updateIsLogged);	
    
    
    $scope.atHome = function() {
        return Boolean($location.path()=='/')
    }
	$scope.reInit = function(){
		$window.location.href = '/';
	};

	$scope.menuShow = function(){
		menuVisibilityService.setTrueTag();	 
	};

	$scope.menuHide = function(){
		menuVisibilityService.setFalseTag();
	};

	$scope.menuVisibility = function(){
		return menuVisibilityService.menuVisibilityVar;
	};

	// **** Authentication ****

	// Angular does not detect auto-fill or auto-complete. If the browser
	// autofills "username", Angular will be unaware of this and think
	// the $scope.username is blank. To workaround this we use the 
	// autofill-event polyfill [4][5]

	$('#id_auth_form input').checkAndTriggerAutoFillEvent();

	$scope.getCredentials = function(){
		return {username: $scope.username, password: $scope.password};
	};
	
	$scope.login = function(){
		api.auth.login($scope.getCredentials()).
		$promise.
		then(function(data){
			// on good username and password
			$scope.user = data;
			AuthService.login(data);					
		}).
		catch(function(data){
			// on incorrect username and password
			alert(data.data.detail);
		});
	};

	$scope.logout = function(){
		api.auth.logout(function(){
			$scope.user = null;
			AuthService.logout();
		});
	};
	$scope.register = function($event){
		// prevent login form from firing
		$event.preventDefault();
		// create user and immediatly login on success
		api.users.create($scope.getCredentials()).
		$promise.
		then($scope.login).
		catch(function(data){
			alert(data.data.username);
		});
	};

});

app.controller('SearchCtrl', function($scope, $http, $location, Projects){
    
    $scope.saved = false;
    
	$scope.architect = "";
	$scope.project_name = "";
	$scope.owner = "";
	$scope.address = "";
    $scope.description = "";

	$scope.search = function() {
	
		var searchParams = {project_name: $scope.project_name, architect: $scope.architect, owner: $scope.owner, address: $scope.address, description: $scope.description};
		Projects.searchProjects(searchParams);
		if ($location.path() != '/' && $location.path() != '/map') {$location.path('/')};	
	}
});
 
app.controller("AddCtrl",function ($scope, $http, $location, Projects) {

	// GMaps box
	$scope.gmapbox_result = '';
	$scope.gmapbox_options = null;
	$scope.gmapbox_details = '';
	
	$scope.formData = {};
	
	$scope.add= function() {
			
		fd = new FormData();
		fd.append('name', $scope.formData.name);
		fd.append('architect', $scope.formData.architect);
		fd.append('address', $scope.gmapbox_details.formatted_address);
		try {
			fd.append('latitude', $scope.gmapbox_details.geometry.location.k);
			fd.append('longitude', $scope.gmapbox_details.geometry.location.B);
		}
		catch(err) {
			console.log(err);
		}
		
		fd.append('image', $scope.image);
			
		$http.post('/add/', fd, {
			transformRequest: angular.identity,
			headers: {'Content-Type': undefined}
		})
		.success(function(id){
			Projects.initProjects();
			$location.path('/projects/' + id );
		})
		.error(function(){
		});
	

	
	}


});

app.controller("MapCtrl", function ($scope, $http, $location, $timeout, Projects) {

	console.log("launch mapCtrl");
    
    // **** Interface to service Projects ****
	
    if (Projects.getCurrentSource() == 'home') { 
        $scope.projects = Projects.mapProjects();
    }
    
    else { $scope.projects = Projects.getProjects() };
	
	$scope.noResult = Projects.givesNoResult();
    
	var bounds = new google.maps.LatLngBounds();
    var markerCluster;
    var marker_list;
    
    $scope.entering = true;
    $scope.firstRealUpdate = false;
    $scope.mapLoaded = false;
    
    var mapLoad = function() {
        
        if (Projects.getMapLoaded()) {
            
            if ($scope.mapLoaded) {
                return
            };
            
            console.log("ShowMap");
            $timeout( function() {
                $scope.mapLoaded = true;
            }, 200);
        
        }
    }
    
    var projectsHaveChanged = false;
	
	function updateProjects(newValue, oldValue) {
        
        if ($scope.entering) {
            $scope.entering = false;
            $scope.firstRealUpdate = true;
            return;
        }
        
        projectsHaveChanged = true;

        
        console.log("projects updated");
		
        if (markerCluster) {
            markerCluster.clearMarkers();
            console.log("markers cleared");
        };
        
		$scope.projects = newValue;		
		$scope.noResult = Projects.givesNoResult();
        
		
        
		if ($scope.firstRealUpdate && Projects.getMapBounds() != undefined) {
            
            bounds = Projects.getMapBounds();
            console.log("Bounds found");
            console.log(Projects.getMapBounds());
                        
		}
        
        else {
            
            bounds = new google.maps.LatLngBounds();
                
    		for (var i in $scope.projects)
    		{
    			currentPosition = new google.maps.LatLng($scope.projects[i].latitude, $scope.projects[i].longitude);
                bounds.extend(currentPosition);
    		};
        
        }
        

                      
		$scope.map.control.getGMap().fitBounds(bounds);
        
        if ($scope.firstRealUpdate) {
            $scope.firstRealUpdate = false;
        } 
        
	}

	$scope.$watch(Projects.getProjects, updateProjects);	

	// **** GOOGLE MAP ****

	angular.extend($scope, {

		map: {
			control: {},
			markersControl: {},
			refresh: true,
			center: {
				latitude: 0,
				longitude: 0
			},
			zoom: 5,
			bounds: {},
			dragging: false,
			options: {
				mapTypeControlOptions: { 
					position: google.maps.ControlPosition.TOP_CENTER
				}
			},
			events: {}
		}
	});
		 	
	google.maps.visualRefresh = true;
	$scope.map.events = {
		idle: function (map) {
            console.log("idle")
			$scope.$apply(function () {
				$scope.mapInstance = map;
                marker_list = $scope.map.markersControl.getGMarkers();           
                if (!markerCluster) {
                    markerCluster = new MarkerClusterer(map, marker_list);
                    console.log("markercluster created");
                    google.maps.event.addListener(markerCluster, "clusteringend", function () {
                        console.log("youpi");
                        marker_list.visible = false;
                        mapLoad();
                    });
                }
                else {
                    if (projectsHaveChanged) {
                        try {
                            markerCluster.clearMarkers();
                            markerCluster.addMarkers(marker_list);
                            console.log("Markers updated");
                        }
                        catch(err) {    
                        }
                        
                        finally {
                            projectsHaveChanged = false;
                        }
                    }
                }
                
            
			});
		}
	};
	


	$scope.seeProject = function(id) {
		Projects.setMapBounds($scope.mapInstance.getBounds());
		$location.path('/projects/' + id);
		$scope.$apply();
	};

});

app.controller("ExploreCtrl", function ($scope, $http, $timeout) {
    
    $scope.currentId = 340002;
    
    
    var dbpediaURL = 'http://dbpedia.org/sparql';
            
    
    // var getThumb = function (structure, size) {
    //     return $http.jsonp('http://en.wikipedia.org/w/api.php?action=query&pageids=' + structure.id + '&prop=url&format=json&callback=JSON_CALLBACK');
    // }
    
    var getThumb = function (id) {
        var query = "SELECT ?thumb WHERE { ?structure dbpedia-owl:wikiPageID " + id + " . ?structure dbpedia-owl:thumbnail ?thumb }";
        var queryUrl = encodeURI( dbpediaURL + "?query=" + query + "&format=json&callback=JSON_CALLBACK" );
        return $http.jsonp(queryUrl);
    };
    
    var makeThumbUrl = function(data, size) {
      url = data.results.bindings[0].thumb.value;
      return url.substr(0, url.lastIndexOf("=") + 1) + size;
    };
    
    var sizeShort = function(label) {
        var sizeMap = {"Small 320": "n", "Medium": "", "Medium 640": "z", "Medium 800":"c", "Large":"b", "Large 1600": "h"};
        return sizeMap[label];
    }
    
    var filterArchitect = function (entry) {
        var query = "SELECT ?type WHERE { ?entry dbpedia-owl:wikiPageID " + entry.id + " . ?entry a ?type }";
        
        var queryUrl = encodeURI( dbpediaURL + "?query=" + query + "&format=json&callback=JSON_CALLBACK" );
        
        $http.jsonp(queryUrl).success(function(data) {
            
            for (result in data.results.bindings) {
                if (data.results.bindings[result].type.value  == "http://dbpedia.org/ontology/Architect" || data.results.bindings[result].type.value  == "http://dbpedia.org/class/yago/Architect109805475") {
                    if (entry.weight > 0.7) {
                        var notIn = true;
                        for (oldEntry in $scope.architects) {
                            oldEntry = $scope.architects[oldEntry];
                            if (oldEntry.id == entry.id) {
                                alreadyIn = false;
                                break;
                            };
                        };
                        
                        if (notIn) {
                            getThumb(entry.id).success(function(data) {
                                var reallyNotIn = true;
                                for (i in $scope.architects) {                                   
                                    if (entry.title == $scope.architects[i].title ) {
                                        reallyNotIn = false;
                                        break;
                                    }
                                }
                                if (reallyNotIn) {
                                    entry['thumb'] = makeThumbUrl(data, 70);
                                    $scope.architects.push(entry);
                                };
                            });
                            
                        };    
                    }
                    break;
                }
            }
        });
            
        
    };
    
    var filterArchitecturalStructure = function (categoryTitle, structure) {
                        
        var query = "SELECT ?type WHERE { ?structure dbpedia-owl:wikiPageID " + structure.id + " . ?structure a ?type }";
        
        var queryUrl = encodeURI( dbpediaURL + "?query=" + query + "&format=json&callback=JSON_CALLBACK" );
        
        $http.jsonp(queryUrl).success(function(data) {
            
                var currentCategory;

                //Looking for the type 'ArchitecturalStructure' in the results

                for (result in data.results.bindings) {
                    //"http://www.w3.org/2003/01/geo/wgs84_pos#SpatialThing"
                    if (data.results.bindings[result].type.value  == "http://dbpedia.org/ontology/ArchitecturalStructure") {
                        
                        if (categoryTitle != 'uncategorizedSuggestions') {
                            
                            var categoryExists = false;
                            
                            for (category in $scope.filteredData.suggestionCategories) {
                                if ($scope.filteredData.suggestionCategories[category].title == categoryTitle) {
                                    categoryExists = true;
                                    break;
                                };
                            };
                    
                            if (!categoryExists) {
                                $scope.filteredData.suggestionCategories.push({title:categoryTitle, suggestions:[]});
                            };
                    
                            for (category in $scope.filteredData.suggestionCategories) {
                                if ($scope.filteredData.suggestionCategories[category].title == categoryTitle) {
                                    currentCategory = category;
                                    break;
                                };
                            };
                            
                            getThumb(structure.id).success(function(data) {
                                structure['thumb'] = makeThumbUrl(data, 250);
                            });
                            
                            $scope.filteredData.suggestionCategories[currentCategory].suggestions.push(structure);
                        }
                            
                        else {
                            
                            getThumb(structure.id).success(function(data) {
                                structure['thumb'] = makeThumbUrl(data, 250);
                            });
                            
                            $scope.filteredData.uncategorizedSuggestions.push(structure);
                        };
                        
                        break;
                    }

                };
            });
    }
    
    $scope.getNewStructure = function(id) {
        
        $scope.architects = [];
        
        $scope.works = [];
        
        $scope.filteredData = {'suggestionCategories': [], 'uncategorizedSuggestions': []};
        
        $scope.currentId = id;
        
        $scope.description = "";
        
        // Retrieve infos for main building
        
        // Wikipedia additional photos
        
        var query = "SELECT ?label ?lon ?lat ?description WHERE { ?structure dbpedia-owl:wikiPageID " + id + " . ?structure rdfs:label ?label . ?structure geo:long ?lon . ?structure geo:lat ?lat . ?structure rdfs:comment ?description}";
        
        var queryUrl = encodeURI( dbpediaURL + "?query=" + query + "&format=json&callback=JSON_CALLBACK" );
        
        $http.jsonp(queryUrl).success(function(data) {
            
            for (i in data.results.bindings) {
                if (data.results.bindings[i].description["xml:lang"] == "en") {
                    $scope.description = data.results.bindings[i].description.value;
                    break;                  
                }
            }
            
            $scope.mainTitle = data.results.bindings[0].label.value;
            var lon = data.results.bindings[0].lon.value;
            var lat = data.results.bindings[0].lat.value;
            
            
            // Flickr
            
            flickrURL = "https://api.flickr.com/services/rest/";
            api_key = "4f2e1c6fce8b3367b7a5e88455af7d95";
            flickrQueryUrl = encodeURI(flickrURL + "?method=flickr.photos.search&api_key=" + api_key + "&text=" + $scope.mainTitle + "&sort=date-posted-desc&format=json&jsoncallback=JSON_CALLBACK");

            $scope.photos = [];
            
             $http.jsonp(flickrQueryUrl).success(function(data) {
                 
                 for (i in data.photos.photo) {
                     
                     if (i > 100) break;
                     
                     var p = data.photos.photo[i];
                                          
                     flickrQueryUrl = encodeURI(flickrURL + "?method=flickr.photos.getInfo&api_key=" + api_key + "&photo_id=" + p.id + "&format=json&jsoncallback=JSON_CALLBACK");
                     
                     $http.jsonp(flickrQueryUrl).success(function(data) {
                                                  
                         if (true) {
                             flickrQueryUrl = encodeURI(flickrURL + "?method=flickr.photos.getSizes&api_key=" + api_key + "&photo_id=" + data.photo.id + "&format=json&jsoncallback=JSON_CALLBACK");
                     
                             $http.jsonp(flickrQueryUrl).success(function(data2) {
                                 
                                 $scope.debug = data2;
                                              
                                 sizeLabel = "";
                                                  
                                 for (i in data2.sizes.size) {
                                     size = data2.sizes.size[i];
                                     if (size.width > 290) {
                                         data.photo["shortURL"] = size.source;
                                         break;
                                     };
                                 };
                                 
                                 $scope.photos.push(data.photo)                                         
                             }); 
                         }
                     });
                     
                 };
             });
            
        });
        
        getThumb(id).success(function(data) {
            $scope.mainThumb = makeThumbUrl(data, 600);           
        });
        
        
        
        
        //Retrieve suggestions

        $http.get('/api/explore/', {params: {id: id}}).success(function(data) {

            $scope.data = data;

            for (category in data['suggestionCategories']) {
                suggestions = data.suggestionCategories[category].suggestions;
                for (structure in suggestions) {
                    $timeout(filterArchitecturalStructure(data.suggestionCategories[category].title, suggestions[structure]), 0);
                    $timeout(filterArchitect(suggestions[structure]), 0);
                };
            };

            for (structure in data.uncategorizedSuggestions) {
                $timeout(filterArchitecturalStructure('uncategorizedSuggestions', data.uncategorizedSuggestions[structure]), 0);
                $timeout(filterArchitect(data.uncategorizedSuggestions[structure]), 0);
            };

        });
    };
    
    $scope.loadWorks = function(architect) {
        
        var query = "SELECT ?work WHERE { ?architect dbpedia-owl:wikiPageID " + architect.id + " . ?work dbpprop:architect ?architect}";
        
        var queryUrl = encodeURI( dbpediaURL + "?query=" + query + "&format=json&callback=JSON_CALLBACK" );
        $http.jsonp(queryUrl).success(function(data) {
                
            $scope.works = [];        
            
            for (i in data.results.bindings) {
                       
                workURI = data.results.bindings[i].work.value;
                workIdentifier = "dbpedia:" + workURI.substr(workURI.lastIndexOf('/') + 1);
                                
                var query = "SELECT ?label ?thumb ?id WHERE {"+ workIdentifier + " dbpedia-owl:thumbnail ?thumb . " + workIdentifier +" dbpedia-owl:wikiPageID ?id . "+ workIdentifier + " rdfs:label ?label . filter langMatches( lang(?label), 'en' )}";
                var queryUrl = encodeURI( dbpediaURL + "?query=" + query + "&format=json&callback=JSON_CALLBACK" );
                                
                $http.jsonp(queryUrl).success(function(data) {
                    $scope.works['architect'] = architect;
                    $scope.works.push(data.results.bindings[0]);
                });
            }
                     
        });
        
    };
    
    $scope.getNewStructure($scope.currentId);
});