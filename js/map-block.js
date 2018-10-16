var MYMAP = new Array();
var map-block_Path_Polygon = new Array();
var map-block_Path = new Array();

if (markers && markers.length > 0 && markers !== "[]"){ 
    var db_marker_array = JSON.stringify(markers);
} else { 
    db_marker_array = '';
}
     
if ('undefined' === typeof window.jQuery) {
    setTimeout(function(){ 
        for(var entry in map-blockaps_localize) {
            document.getElementById('map-block_map_'+entry).innerHTML = map-block_jquery_error_string_1;
        }
    }, 3000);
} else {
    
}

jQuery(function($) {

	if (/1\.(0|1|2|3|4|5|6|7)\.(0|1|2|3|4|5|6|7|8|9)/.test(jQuery.fn.jquery)) {
		setTimeout(function(){ 
			for(var entry in map-blockaps_localize) {
				document.getElementById('map-block_map_'+entry).innerHTML = map-block_jquery_error_string_2;
			}
		}, 3000);
	} else {

		for(var entry in map-blockaps_localize) {
			InitMap(map-blockaps_localize[entry]['id'],false);
		}
	   
	}

});

for(var entry in map-blockaps_localize) {

    MYMAP[entry] = {
        map: null,
        bounds: null
    }

    if (map-blockaps_localize_global_settings['map-block_settings_map_draggable'] === "" || 'undefined' === typeof map-blockaps_localize_global_settings['map-block_settings_map_draggable']) { map-block_settings_map_draggable = true; } else { map-block_settings_map_draggable = false;  }
    if (map-blockaps_localize_global_settings['map-block_settings_map_clickzoom'] === "" || 'undefined' === typeof map-blockaps_localize_global_settings['map-block_settings_map_clickzoom']) { map-block_settings_map_clickzoom = false; } else { map-block_settings_map_clickzoom = true; }
    if (map-blockaps_localize_global_settings['map-block_settings_map_scroll'] === "" || 'undefined' === typeof map-blockaps_localize_global_settings['map-block_settings_map_scroll']) { map-block_settings_map_scroll = true; } else { map-block_settings_map_scroll = false; }
    if (map-blockaps_localize_global_settings['map-block_settings_map_zoom'] === "" || 'undefined' === typeof map-blockaps_localize_global_settings['map-block_settings_map_zoom']) { map-block_settings_map_zoom = true; } else { map-block_settings_map_zoom = false; }
    if (map-blockaps_localize_global_settings['map-block_settings_map_pan'] === "" || 'undefined' === typeof map-blockaps_localize_global_settings['map-block_settings_map_pan']) { map-block_settings_map_pan = true; } else { map-block_settings_map_pan = false; }
    if (map-blockaps_localize_global_settings['map-block_settings_map_type'] === "" || 'undefined' === typeof map-blockaps_localize_global_settings['map-block_settings_map_type']) { map-block_settings_map_type = true; } else { map-block_settings_map_type = false; }
    if (map-blockaps_localize_global_settings['map-block_settings_map_streetview'] === "" || 'undefined' === typeof map-blockaps_localize_global_settings['map-block_settings_map_streetview']) { map-block_settings_map_streetview = true; } else { map-block_settings_map_streetview = false; }
    if (map-blockaps_localize_global_settings['map-block_settings_map_full_screen_control'] === "" || 'undefined' === typeof map-blockaps_localize_global_settings['map-block_settings_map_full_screen_control']) { map-block_settings_map_full_screen_control = true; } else { map-block_settings_map_full_screen_control = false; }


    if ('undefined' === typeof map-blockaps_localize[entry]['other_settings']['map_max_zoom'] || map-blockaps_localize[entry]['other_settings']['map_max_zoom'] === "") { map-block_max_zoom = 0; } else { map-block_max_zoom = parseInt(map-blockaps_localize[entry]['other_settings']['map_max_zoom']); }

    MYMAP[entry].init = function(selector, latLng, zoom, maptype,mapid) {
        zoom = parseInt(zoom);


        var myOptions = {
            zoom:zoom,
            minZoom: map-block_max_zoom,
            maxZoom: 21,
            center: latLng,
            draggable: map-block_settings_map_draggable,
            disableDoubleClickZoom: map-block_settings_map_clickzoom,
            scrollwheel: map-block_settings_map_scroll,
            zoomControl: map-block_settings_map_zoom,
            panControl: map-block_settings_map_pan,
            mapTypeControl: map-block_settings_map_type,
            streetViewControl: map-block_settings_map_streetview,
            fullScreenControl = map-block_settings_map_full_screen_control,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };

        if (maptype === "1") { myOptions.mapTypeId = google.maps.MapTypeId.ROADMAP; }
        else if (maptype === "2") { myOptions.mapTypeId = google.maps.MapTypeId.SATELLITE; }
        else if (maptype === "3") { myOptions.mapTypeId = google.maps.MapTypeId.HYBRID; }
        else if (maptype === "4") { myOptions.mapTypeId = google.maps.MapTypeId.TERRAIN; }

        this.map = new google.maps.Map(jQuery(selector)[0], myOptions);
        this.bounds = new google.maps.LatLngBounds();
        jQuery( "#map-block_map_"+mapid).trigger( 'wpgooglemaps_loaded' );

        if ("undefined" !== typeof map-blockaps_localize[mapid]['other_settings']['map-block_theme_data'] && map-blockaps_localize[mapid]['other_settings']['map-block_theme_data'] !== false) {
           this.map.setOptions({styles: JSON.parse(map-blockaps_localize[mapid]['other_settings']['map-block_theme_data'])});
        } 


        /* insert polygon and polyline functionality */
        if (map-blockaps_localize_polygon_settings !== null) {
            if (typeof map-blockaps_localize_polygon_settings[mapid] !== "undefined") {
                  for(var poly_entry in map-blockaps_localize_polygon_settings[mapid]) {
                    add_polygon(mapid,poly_entry);
                  }
            }
        }
        if (map-blockaps_localize_polyline_settings !== null) {
            if (typeof map-blockaps_localize_polyline_settings[mapid] !== "undefined") {
                  for(var poly_entry in map-blockaps_localize_polyline_settings[mapid]) {
                    add_polyline(mapid,poly_entry);
                  }
            }
        }

        
        if (map-blockaps_localize[entry]['bicycle'] === "1") {
            var bikeLayer = new google.maps.BicyclingLayer();
            bikeLayer.setMap(this.map);
        }        
        if (map-blockaps_localize[entry]['traffic'] === "1") {
            var trafficLayer = new google.maps.TrafficLayer();
            trafficLayer.setMap(this.map);
        }  
        if (map-blockaps_localize[entry]['transport'] === "1") {
            var transitLayer = new google.maps.TransitLayer();
            transitLayer.setMap(this.map);
        }  
        

        
        google.maps.event.addListener(MYMAP[entry].map, 'click', function() {
            infoWindow.close();
        });
        
        
        
    }

    var infoWindow = new google.maps.InfoWindow();

    infoWindow.setOptions({maxWidth:map-blockaps_localize_global_settings['map-block_settings_infowindow_width']});

    google.maps.event.addDomListener(window, 'resize', function() {
        var myLatLng = new google.maps.LatLng(map-block_lat,map-block_lng);
        MYMAP[entry].map.setCenter(myLatLng);
    });
    MYMAP[entry].placeMarkers = function(filename,map_id,radius,searched_center,distance_type) {
        var check1 = 0;
        if (marker_pull === '1') {
        
            jQuery.get(filename, function(xml){
                jQuery(xml).find("marker").each(function(){
                    var wpmgza_map_id = jQuery(this).find('map_id').text();

                    if (wpmgza_map_id == map_id) {
                        var wpmgza_address = jQuery(this).find('address').text();
                        var lat = jQuery(this).find('lat').text();
                        var lng = jQuery(this).find('lng').text();
                        var wpmgza_anim = jQuery(this).find('anim').text();
                        var wpmgza_infoopen = jQuery(this).find('infoopen').text();
                        var current_lat = jQuery(this).find('lat').text();
                        var current_lng = jQuery(this).find('lng').text();
                        var show_marker_radius = true;

                        if (radius !== null) {
                            if (check1 > 0 ) { } else { 


                                var point = new google.maps.LatLng(parseFloat(searched_center.lat()),parseFloat(searched_center.lng()));
                                MYMAP[entry].bounds.extend(point);
                                
                                if (map-blockaps_localize[map_id]['other_settings']['store_locator_bounce'] === 1) {
                                var marker = new google.maps.Marker({
                                        position: point,
                                        map: MYMAP[entry].map,
                                        animation: map-block.Marker.ANIMATION_BOUNCE
                                });
                                } else { /* do nothing */ }

                                if (distance_type == "1") {
                                    var populationOptions = {
                                          strokeColor: '#FF0000',
                                          strokeOpacity: 0.25,
                                          strokeWeight: 2,
                                          fillColor: '#FF0000',
                                          fillOpacity: 0.15,
                                          map: MYMAP[entry].map,
                                          center: point,
                                          radius: parseInt(radius / 0.000621371)
                                        };
                                } else {
                                    var populationOptions = {
                                          strokeColor: '#FF0000',
                                          strokeOpacity: 0.25,
                                          strokeWeight: 2,
                                          fillColor: '#FF0000',
                                          fillOpacity: 0.15,
                                          map: MYMAP[entry].map,
                                          center: point,
                                          radius: parseInt(radius / 0.001)
                                        };
                                }
                                
                                cityCircle = new google.maps.Circle(populationOptions);
                                check1 = check1 + 1;
                            }
                            var R = 0;
                            if (distance_type == "1") {
                                R = 3958.7558657440545; 
                            } else {
                                R = 6378.16; 
                            }
                            var dLat = toRad(searched_center.lat()-current_lat);
                            var dLon = toRad(searched_center.lng()-current_lng); 
                            var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(current_lat)) * Math.cos(toRad(searched_center.lat())) * Math.sin(dLon/2) * Math.sin(dLon/2); 
                            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                            var d = R * c;
                            
                            if (d < radius) { show_marker_radius = true; } else { show_marker_radius = false; }
                        }



                        var point = new google.maps.LatLng(parseFloat(lat),parseFloat(lng));
                        MYMAP[entry].bounds.extend(point);
                        if (show_marker_radius === true) {
                            if (wpmgza_anim === "1") {
                            var marker = new google.maps.Marker({
                                    position: point,
                                    map: MYMAP[entry].map,
                                    animation: google.maps.Animation.BOUNCE
                                });
                            }
                            else if (wpmgza_anim === "2") {
                                var marker = new google.maps.Marker({
                                        position: point,
                                        map: MYMAP[entry].map,
                                        animation: google.maps.Animation.DROP
                                });
                            }
                            else {
                                var marker = new google.maps.Marker({
                                        position: point,
                                        map: MYMAP[entry].map
                                });
                            }
                            var d_string = "";
                            if (radius !== null) {                                 
                                if (distance_type == "1") {
                                    d_string = "<p style='min-width:100px; display:block;'>"+Math.round(d,2)+" "+map-blockaps_lang_m_away+"</p>"; 
                                } else {
                                    d_string = "<p style='min-width:100px; display:block;'>"+Math.round(d,2)+" "+map-blockaps_lang_km_away+"</p>"; 
                                }
                            } else { d_string = ''; }


                            var html='<p style=\'min-width:100px; display:block;\'>'+wpmgza_address+'</p>'+d_string;
                            if (wpmgza_infoopen === "1") {
                                infoWindow.setContent(html);
                                infoWindow.open(MYMAP[entry].map, marker);
                            }
                            
                            if (map-blockaps_localize_global_settings['map-block_settings_map_open_marker_by'] === "" || 'undefined' === typeof map-blockaps_localize_global_settings['map-block_settings_map_open_marker_by'] || map-blockaps_localize_global_settings['map-block_settings_map_open_marker_by'] === '1') { 
                                google.maps.event.addListener(marker, 'click', function() {
                                    infoWindow.close();
                                    infoWindow.setContent(html);
                                    infoWindow.open(MYMAP[entry].map, marker);

                                });
                            } else {
                                google.maps.event.addListener(marker, 'mouseover', function() {
                                    infoWindow.close();
                                    infoWindow.setContent(html);
                                    infoWindow.open(MYMAP[entry].map, marker);

                                });   
                            }
                            
                        }
                    }
                });

            });
        } else { 
        
            if (db_marker_array.length > 0) {
                var dec_marker_array = JSON.parse(db_marker_array);
                jQuery.each(dec_marker_array, function(i, val) {
                    
                    
                    var wpmgza_map_id = val.map_id;

                        if (wpmgza_map_id == map_id) {
                            
                            var wpmgza_address = val.address;
                            var wpmgza_anim = val.anim;
                            var wpmgza_infoopen = val.infoopen;
                            var lat = val.lat;
                            var lng = val.lng;
                            var point = new google.maps.LatLng(parseFloat(lat),parseFloat(lng));
                            
                           
                            var current_lat = val.lat;
                            var current_lng = val.lng;
                            var show_marker_radius = true;

                            if (radius !== null) {
                                if (check1 > 0 ) { } else { 


                                    var point = new google.maps.LatLng(parseFloat(searched_center.lat()),parseFloat(searched_center.lng()));
                                    MYMAP[entry].bounds.extend(point);
                                    if (map-blockaps_localize[map_id]['other_settings']['store_locator_bounce'] === 1) {
                                    var marker = new google.maps.Marker({
                                            position: point,
                                            map: MYMAP[entry].map,
                                            animation: google.maps.Animation.BOUNCE
                                    });
                                    } else { /* do nothing */ }



                                    if (distance_type == "1") {
                                        var populationOptions = {
                                              strokeColor: '#FF0000',
                                              strokeOpacity: 0.25,
                                              strokeWeight: 2,
                                              fillColor: '#FF0000',
                                              fillOpacity: 0.15,
                                              map: MYMAP[entry].map,
                                              center: point,
                                              radius: parseInt(radius / 0.000621371)
                                            };
                                    } else {
                                        var populationOptions = {
                                              strokeColor: '#FF0000',
                                              strokeOpacity: 0.25,
                                              strokeWeight: 2,
                                              fillColor: '#FF0000',
                                              fillOpacity: 0.15,
                                              map: MYMAP[entry].map,
                                              center: point,
                                              radius: parseInt(radius / 0.001)
                                            };
                                    }
                                    
                                    cityCircle = new google.maps.Circle(populationOptions);
                                    check1 = check1 + 1;
                                }
                                var R = 0;
                                if (distance_type == "1") {
                                    R = 3958.7558657440545; 
                                } else {
                                    R = 6378.16; 
                                }
                                var dLat = toRad(searched_center.lat()-current_lat);
                                var dLon = toRad(searched_center.lng()-current_lng); 
                                var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(current_lat)) * Math.cos(toRad(searched_center.lat())) * Math.sin(dLon/2) * Math.sin(dLon/2); 
                                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                                var d = R * c;
                                
                                if (d < radius) { show_marker_radius = true; } else { show_marker_radius = false; }
                            }



                            var point = new google.maps.LatLng(parseFloat(lat),parseFloat(lng));
                            MYMAP[entry].bounds.extend(point);
                            if (show_marker_radius === true) {
                                if (wpmgza_anim === "1") {
                                var marker = new google.maps.Marker({
                                        position: point,
                                        map: MYMAP[entry].map,
                                        animation: google.maps.Animation.BOUNCE
                                    });
                                }
                                else if (wpmgza_anim === "2") {
                                    var marker = new google.maps.Marker({
                                            position: point,
                                            map: MYMAP[entry].map,
                                            animation: google.maps.Animation.DROP
                                    });
                                }
                                else {
                                    var marker = new google.maps.Marker({
                                            position: point,
                                            map: MYMAP[entry].map
                                    });
                                }
                                var d_string = "";
                                if (radius !== null) {                                 
                                    if (distance_type == "1") {
                                        d_string = "<p style='min-width:100px; display:block;'>"+Math.round(d,2)+" "+map-blockaps_lang_m_away+"</p>"; 
                                    } else {
                                        d_string = "<p style='min-width:100px; display:block;'>"+Math.round(d,2)+" "+map-blockaps_lang_km_away+"</p>"; 
                                    }
                                } else { d_string = ''; }


                                var html='<p style=\'min-width:100px; display:block;\'>'+wpmgza_address+'</p>'+d_string;
                                if (wpmgza_infoopen === "1") {
                                    infoWindow.setContent(html);
                                    infoWindow.open(MYMAP[entry].map, marker);
                                }

                                if (map-blockaps_localize_global_settings['map-block_settings_map_open_marker_by'] === "" || 'undefined' === typeof map-blockaps_localize_global_settings['map-block_settings_map_open_marker_by'] || map-blockaps_localize_global_settings['map-block_settings_map_open_marker_by'] === '1') { 
                                    google.maps.event.addListener(marker, 'click', function() {
                                        infoWindow.close();
                                        infoWindow.setContent(html);
                                        infoWindow.open(MYMAP[entry].map, marker);

                                    });
                                } else {
                                    google.maps.event.addListener(marker, 'mouseover', function() {
                                        infoWindow.close();
                                        infoWindow.setContent(html);
                                        infoWindow.open(MYMAP[entry].map, marker);

                                    });   
                                }


                            }
                        }
                    
                    
                    
                    
                    
                });
            }


                    
        
        }
    }
}
jQuery("body").on("keypress","#addressInput", function(event) {
  if ( event.which == 13 ) {
     jQuery('.map-block_sl_search_button').trigger('click');
  }
});
var autocomplete;
function fillInAddress() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();
}
var elementExists = document.getElementById("addressInput");
if (typeof google === 'object' && typeof google.maps === 'object' && typeof google.maps.places === 'object' && typeof google.maps.places.Autocomplete === 'function' && map-block.settings.engine == "google-maps") {
    if (elementExists !== null) {
        /* initialize the autocomplete form */
        autocomplete = new google.maps.places.Autocomplete(
          /** @type {HTMLInputElement} */(document.getElementById('addressInput')),
          { types: ['geocode'] });
        // When the user selects an address from the dropdown,
        // populate the address fields in the form.
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
        fillInAddress();
        });
    } 
}

function add_polygon(mapid,polygonid) {
    var tmp_data = map-blockaps_localize_polygon_settings[mapid][polygonid];
     var current_poly_id = polygonid;
     var tmp_polydata = tmp_data['polydata'];
     var map-block_PathData = new Array();
     for (tmp_entry2 in tmp_polydata) {
         if (typeof tmp_polydata[tmp_entry2][0] !== "undefined") {
            
            map-block_PathData.push(new google.maps.LatLng(tmp_polydata[tmp_entry2][0], tmp_polydata[tmp_entry2][1]));
        }
     }
     if (tmp_data['lineopacity'] === null || tmp_data['lineopacity'] === "") {
         tmp_data['lineopacity'] = 1;
     }
     
     var bounds = new google.maps.LatLngBounds();
     for (i = 0; i < map-block_PathData.length; i++) {
       bounds.extend(map-block_PathData[i]);
     }

    map-block_Path_Polygon[polygonid] = new google.maps.Polygon({
         path: map-block_PathData,
         clickable: true, /* must add option for this */ 
         strokeColor: "#"+tmp_data['linecolor'],
         fillOpacity: tmp_data['opacity'],
         strokeOpacity: tmp_data['lineopacity'],
         fillColor: "#"+tmp_data['fillcolor'],
         strokeWeight: 2,
         map: MYMAP[mapid].map
   });
   map-block_Path_Polygon[polygonid].setMap(MYMAP[mapid].map);

    polygon_center = bounds.getCenter();

    if (tmp_data['title'] !== "") {
     infoWindow_poly[polygonid] = new google.maps.InfoWindow();
     google.maps.event.addListener(map-block_Path_Polygon[polygonid], 'click', function(event) {
         infoWindow_poly[polygonid].setPosition(event.latLng);
         content = "";
         if (tmp_data['link'] !== "") {
             var content = "<a href='"+tmp_data['link']+"'>"+tmp_data['title']+"</a>";
         } else {
             var content = tmp_data['title'];
         }
         infoWindow_poly[polygonid].setContent(content);
         infoWindow_poly[polygonid].open(MYMAP[mapid].map,this.position);
     }); 
    }


   google.maps.event.addListener(map-block_Path_Polygon[polygonid], "mouseover", function(event) {
         this.setOptions({fillColor: "#"+tmp_data['ohfillcolor']});
         this.setOptions({fillOpacity: tmp_data['ohopacity']});
         this.setOptions({strokeColor: "#"+tmp_data['ohlinecolor']});
         this.setOptions({strokeWeight: 2});
         this.setOptions({strokeOpacity: 0.9});
   });
   google.maps.event.addListener(map-block_Path_Polygon[polygonid], "click", function(event) {

         this.setOptions({fillColor: "#"+tmp_data['ohfillcolor']});
         this.setOptions({fillOpacity: tmp_data['ohopacity']});
         this.setOptions({strokeColor: "#"+tmp_data['ohlinecolor']});
         this.setOptions({strokeWeight: 2});
         this.setOptions({strokeOpacity: 0.9});
   });
   google.maps.event.addListener(map-block_Path_Polygon[polygonid], "mouseout", function(event) {
         this.setOptions({fillColor: "#"+tmp_data['fillcolor']});
         this.setOptions({fillOpacity: tmp_data['opacity']});
         this.setOptions({strokeColor: "#"+tmp_data['linecolor']});
         this.setOptions({strokeWeight: 2});
         this.setOptions({strokeOpacity: tmp_data['lineopacity']});
   });


       
    
    
}
function add_polyline(mapid,polyline) {
    
    
    var tmp_data = map-blockaps_localize_polyline_settings[mapid][polyline];

    var current_poly_id = polyline;
    var tmp_polydata = tmp_data['polydata'];
    var map-block_Polyline_PathData = new Array();
    for (tmp_entry2 in tmp_polydata) {
        if (typeof tmp_polydata[tmp_entry2][0] !== "undefined" && typeof tmp_polydata[tmp_entry2][1] !== "undefined") {
            var lat = tmp_polydata[tmp_entry2][0].replace(')', '');
            lat = lat.replace('(','');
            var lng = tmp_polydata[tmp_entry2][1].replace(')', '');
            lng = lng.replace('(','');
            map-block_Polyline_PathData.push(new google.maps.LatLng(lat, lng));
        }
         
         
    }
     if (tmp_data['lineopacity'] === null || tmp_data['lineopacity'] === "") {
         tmp_data['lineopacity'] = 1;
     }

    map-block_Path[polyline] = new google.maps.Polyline({
         path: map-block_Polyline_PathData,
         strokeColor: "#"+tmp_data['linecolor'],
         strokeOpacity: tmp_data['opacity'],
         strokeWeight: tmp_data['linethickness'],
         map: MYMAP[mapid].map
   });
   map-block_Path[polyline].setMap(MYMAP[mapid].map);
    
    
}



function searchLocations(map_id) {
    var address = document.getElementById("addressInput").value;
    var geocoder = new google.maps.Geocoder();

        checker = address.split(",");
        var map-block_lat = "";
        var map-block_lng = "";
        map-block_lat = checker[0];
        map-block_lng = checker[1];
        checker1 = parseFloat(checker[0]);
        checker2 = parseFloat(checker[1]);


        if (typeof map-blockaps_localize[map_id]['other_settings']['map-block_store_locator_restrict'] !== "undefined" && map-blockaps_localize[map_id]['other_settings']['map-block_store_locator_restrict'] != "") {
            if ((typeof map-block_lng !== "undefined" && map-block_lat.match(/[a-zA-Z]/g) === null && map-block_lng.match(/[a-zA-Z]/g) === null) && checker.length === 2 && (checker1 != NaN && (checker1 <= 90 || checker1 >= -90)) && (checker2 != NaN && (checker2 <= 90 || checker2 >= -90))) {
                var point = new google.maps.LatLng(parseFloat(map-block_lat),parseFloat(map-block_lng));
                searchLocationsNear(map_id,point);
            }
            else {
                /* is an address, must geocode */
                geocoder.geocode({address: address,componentRestrictions: {country: map-blockaps_localize[map_id]['other_settings']['map-block_store_locator_restrict']}}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        searchLocationsNear(map_id,results[0].geometry.location);
                    } else {
                        alert(address + ' not found');
                    }
                });

            }
        } else {

            if ((typeof map-block_lng !== "undefined" && map-block_lat.match(/[a-zA-Z]/g) === null && map-block_lng.match(/[a-zA-Z]/g) === null) && checker.length === 2 && (checker1 != NaN && (checker1 <= 90 || checker1 >= -90)) && (checker2 != NaN && (checker2 <= 90 || checker2 >= -90))) {
                var point = new google.maps.LatLng(parseFloat(map-block_lat),parseFloat(map-block_lng));
                searchLocationsNear(map_id,point);
            }
            else {
                /* is an address, must geocode */
            geocoder.geocode({address: address}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        searchLocationsNear(map_id,results[0].geometry.location);
                    } else {
                        alert(address + ' not found');
                    }
                });

            }

        } 

}

function clearLocations() {
    infoWindow.close();
}




function searchLocationsNear(mapid,center_searched) {
    clearLocations();
    var distance_type = document.getElementById("map-block_distance_type").value;
    var radius = document.getElementById('radiusSelect').value;
    if (distance_type == "1") {
        if (radius === "1") { zoomie = 14; }
        else if (radius === "5") { zoomie = 12; }
        else if (radius === "10") { zoomie = 11; }
        else if (radius === "25") { zoomie = 9; }
        else if (radius === "50") { zoomie = 8; }
        else if (radius === "75") { zoomie = 8; }
        else if (radius === "100") { zoomie = 7; }
        else if (radius === "150") { zoomie = 7; }
        else if (radius === "200") { zoomie = 6; }
        else if (radius === "300") { zoomie = 6; }
        else { zoomie = 14; }
    } else {
        if (radius === "1") { zoomie = 14; }
        else if (radius === "5") { zoomie = 12; }
        else if (radius === "10") { zoomie = 11; }
        else if (radius === "25") { zoomie = 10; }
        else if (radius === "50") { zoomie = 9; }
        else if (radius === "75") { zoomie = 8; }
        else if (radius === "100") { zoomie = 8; }
        else if (radius === "150") { zoomie = 7; }
        else if (radius === "200") { zoomie = 7; }
        else if (radius === "300") { zoomie = 6; }
        else { zoomie = 14; }
    }
    MYMAP[mapid].init("#map-block_map_"+mapid, center_searched, zoomie, 3,mapid);
    MYMAP[mapid].placeMarkers(map-blockaps_markerurl+mapid+'markers.xml?u='+UniqueCode,mapid,radius,center_searched,distance_type);
}

function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}



function InitMap(map_id,reinit) {
    
    jQuery("#map-block_map_"+map_id).css({
            height:map-blockaps_localize[map_id]['map_height']+''+map-blockaps_localize[map_id]['map_height_type'],
            width:map-blockaps_localize[map_id]['map_width']+''+map-blockaps_localize[map_id]['map_width_type']

    });
    var myLatLng = new google.maps.LatLng(map-block_lat,map-block_lng);
    MYMAP[map_id].init('#map-block_map_'+map_id, myLatLng, map-block_start_zoom, map-blockaps_localize['type'],map_id);
    UniqueCode=Math.round(Math.random()*10000);
    MYMAP[map_id].placeMarkers(map-blockaps_markerurl+map_id+'markers.xml?u='+UniqueCode,map_id,null,null,null);

    jQuery('body').on('tabsactivate', function(event, ui) {
        MYMAP[map_id].init('#map-block_map_'+map_id, myLatLng, map-block_start_zoom, map-blockaps_localize['type'],map_id);
        UniqueCode=Math.round(Math.random()*10000);
        MYMAP[map_id].placeMarkers(map-blockaps_markerurl+map_id+'markers.xml?u='+UniqueCode,map_id,null,null,null);
    });

    jQuery('body').on('click','.x-accordion-heading', function(){
        setTimeout(function(){
            MYMAP[map_id].init('#map-block_map_'+map_id, myLatLng, map-block_start_zoom, map-blockaps_localize['type'],map_id);
            UniqueCode=Math.round(Math.random()*10000);
            MYMAP[map_id].placeMarkers(map-blockaps_markerurl+map_id+'markers.xml?u='+UniqueCode,map_id,null,null,null);
        }, 100);
    });
    



    
   
};
