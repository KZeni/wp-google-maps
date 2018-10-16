(function($) {
    var placeSearch, autocomplete;
    var map-block_table_length;
    var map-blockTable;
    var marker_added = false;
    var map-blockaps_markers_array = [];
    var infoWindow = new Array();
    var tmp_marker;
    var map-block_Path_Polygon = new Array();
    var map-block_Path = new Array();
    var saveReminderBound = false;


	if ('undefined' == typeof window.jQuery) {
		alert("jQuery is not installed. Map Block requires jQuery in order to function properly. Please ensure you have jQuery installed.")
	} else {
		// all good.. continue...
	}

	function map-block_parse_theme_data(raw)
	{
		var json;
		
		try{
			json = JSON.parse(raw);
		}catch(e) {
			try{
				json = eval(raw);
			}catch(e) {
				console.warn("Couldn't parse theme data");
				return [];
			}
		}
		
		return json;
	}
	
    function fillInAddress() {
      // Get the place details from the autocomplete object.
      var place = autocomplete.getPlace();
    }

	function enableAddMarkerButton(enable)
	{
		var button = $("#map-block_addmarker");
		button.prop("disabled", (enable ? false : "disabled"));
		button.val(enable ? button.data("original-text") : "Saving...");
	}
	$("#map-block_addmarker").data("original-text", $("#map-block_addmarker").val());
	$("#map-block_addmarker_loading").hide();
	
	function enableEditMarkerButton(enable)
	{
		var button = $("#map-block_editmarker");
		button.prop("disabled", (enable ? false : "disabled"));
		button.val(enable ? button.data("original-text") : "Saving...");
		
		if(enable)
		{
			button.parent().show();
			$("#map-block_editmarker_loading").hide();
		}
		else
		{
			button.parent().hide();
			$("#map-block_editmarker_loading").show();
		}
	}
	$("#map-block_editmarker").data("original-text", $("#map-block_editmarker").val());
	$("#map-block_editmarker_loading").hide();
	
	function setMarkerAdded(added)
	{
		var button = $("#map-block_addmarker");
		var caption = (added ? "Save Marker" : "Add Marker");
		button.data("original-text", caption);
		button.val(caption);
		marker_added = added;
	}

	function onBeforeUnload(event)
	{
		var message = "You have unsaved changes to your map, leaving this page will discard them";
		event.returnValue = message;
		return message;
	}
	
	function bindSaveReminder()
	{
		if(saveReminderBound)
			return;
		
		window.addEventListener("beforeunload", onBeforeUnload);
	}
	
	function unbindSaveReminder()
	{
		window.removeEventListener("beforeunload", onBeforeUnload);
	}
	
	window.map-blockUnbindSaveReminder = function()
	{
		unbindSaveReminder();
	}
	
	function map-block_select_all_markers()
	{
		$("#map-block_table input[name='mark']").prop("checked", "checked");
	}
	
	function map-block_bulk_delete()
	{
		var ids = [];
		
		// Gather IDs to delete
		$("#map-block_table input[name='mark']:checked").each(function(index, el) {
			ids.push( $(el).closest("tr").attr("id").match(/\d+$/)[0] );
		});
		
		if(ids.length == 0)
		{
			alert("No markers selected");
			return;
		}
		
		// Prompt user to confirm
		if(!confirm("Confirm deleting " + ids.length + " marker(s)"))
			return;
		
		// Get ready
		var data = {
			action: "delete_marker",
			security: map-blockaps_nonce,
			map_id: map-blockaps_mapid
		};
		
		// Count responses separately since were shifting ids straight off the array async
		var counter = ids.length;
		
		function sendDeleteRequest(id)
		{
			$.post(ajaxurl, $.extend({marker_id: id}, data), function(response) {
				if(--counter == 1)
				{
					// Send very last one synchronous so tables don't collide
					var last = ids.shift();
					sendDeleteRequest(last);
				}
				else if(counter == 0)
				{
					// Receive last response
					jQuery("#map-block_marker_holder").html(JSON.parse(response).table_html);
					map-block_reinitialisetbl();
				}
			});
			
			map-blockaps_markers_array[id].setMap(null);
			delete map-blockaps_markers_array[id];
		}
		
		// Send all but one delete request async, last one is send inside sendDeleteRequest
		while(ids.length > 1)
		{
			var id = ids.shift();
			sendDeleteRequest(id);
		}
	}

	jQuery(function($) {
		
		if(map-block.isProVersion())
		{
			if(console && console.warn)
				console.warn("Unexpected plugin load order");
			
			return;
		}
		
		$("input[type='submit'].button-primary").on("click", function() {
			unbindSaveReminder();
		});
		
		$(document.body).on("click", function(event) {
			if($(event.target).is(".map-block.bulk_delete"))
			{
				map-block_bulk_delete();
				return;
			}
			
			if($(event.target).is(".map-block.select_all_markers"))
			{
				map-block_select_all_markers();
				return;
			}
		});

        jQuery("select[name=map-block_table_length]").change(function () {
            map-block_table_length = jQuery(this).val();
        })

		if (/*map-block.isGoogleAutocompleteSupported()*/ window.google && google.maps && google.maps.places && google.maps.places.Autocomplete && map-block.settings.engine == "google-maps")
		{
			if(document.getElementById('map-block_add_address'))
			{
				/* initialize the autocomplete form */
				autocomplete = new google.maps.places.Autocomplete(
				  /** @type {HTMLInputElement} */(document.getElementById('map-block_add_address')),
				  { types: ['geocode'] });
				// When the user selects an address from the dropdown,
				// populate the address fields in the form.
				google.maps.event.addListener(autocomplete, 'place_changed', function() {
					fillInAddress();
				});
			}
			
			if(document.getElementById('map-block_store_locator_default_address'))
			{
				var store_default_autocomplete = new google.maps.places.Autocomplete(
                    (document.getElementById('map-block_store_locator_default_address')),
                    { types: ['geocode'] });
			}
		}
        
        map-blockTable = jQuery('#map-block_table').DataTable({
            "bProcessing": true,
            "aaSorting": [[ 0, "desc" ]]
        });
		
        function map-block_reinitialisetbl() {
            //map-blockTable.fnClearTable( 0 );
            if (map-block_table_length === "") { map-block_table_length = 10; }
            var map-blockTable = jQuery('#map-block_table').DataTable({
                "bProcessing": true,
                "iDisplayLength": map-block_table_length
            });
        }
		
        function map-block_InitMap() {
            var myLatLng = new map-block.LatLng(map-blockaps_localize[map-blockaps_mapid].map_start_lat ,map-blockaps_localize[map-blockaps_mapid].map_start_lng);
			
			$("#map-block_map").attr("data-map-id", "1");
			$("#map-block_map").attr("data-maps-engine", map-block.settings.engine);
			
            MYMAP.init('#map-block_map', myLatLng, parseInt(map-blockaps_localize[map-blockaps_mapid].map_start_zoom));
            UniqueCode=Math.round(Math.random()*10000);
            MYMAP.placeMarkers(map-blockaps_markerurl + '?u='+UniqueCode,map-blockaps_mapid,null,myLatLng);
        }

        jQuery("#map-block_map").css({
            height:map-blockaps_localize[map-blockaps_mapid].map_height+''+map-blockaps_localize[map-blockaps_mapid].map_height_type,
            width:map-blockaps_localize[map-blockaps_mapid].map_width+''+map-blockaps_localize[map-blockaps_mapid].map_width_type

        });
		
		var geocoder = map-block.Geocoder.createInstance();
        map-block_InitMap();

        jQuery("body").on("click", ".map-block_del_btn", function() {
            var cur_id = jQuery(this).attr("id");
			var marker = map-blockaps_markers_array[cur_id];
			
			if(!map-blockaps_markers_array[cur_id])
				return;
			
			map-blockaps_markers_array[cur_id].setMap(null);
            delete map-blockaps_markers_array[cur_id];
			
            var data = {
                action: 'delete_marker',
                security: map-blockaps_nonce,
                map_id: map-blockaps_mapid,
                marker_id: cur_id
            };
			
            jQuery.post(ajaxurl, data, function(response) {
                returned_data = JSON.parse(response);
                map-blockaps_localize_marker_data = returned_data.marker_data;
                
                jQuery("#map-block_marker_holder").html(JSON.parse(response).table_html);
                map-block_reinitialisetbl();
            });


        });
        jQuery("body").on("click", ".map-block_poly_del_btn", function() {
            var cur_id = jQuery(this).attr("id");
            var data = {
                    action: 'delete_poly',
                    security: map-blockaps_nonce,
                    map_id: map-blockaps_mapid,
                    poly_id: cur_id
            };
            jQuery.post(ajaxurl, data, function(response) {
                    map-block_Path_Polygon[cur_id].setMap(null);
                    delete map-blockaps_localize_polygon_settings[cur_id];
                    jQuery("#map-block_poly_holder").html(response);

            });

        });
        jQuery("body").on("click", ".map-block_polyline_del_btn", function() {
            var cur_id = jQuery(this).attr("id");
            var data = {
                    action: 'delete_polyline',
                    security: map-blockaps_nonce,
                    map_id: map-blockaps_mapid,
                    poly_id: cur_id
            };
            jQuery.post(ajaxurl, data, function(response) {
                    map-block_Path[cur_id].setMap(null);
                    delete map-blockaps_localize_polyline_settings[cur_id];
                    jQuery("#map-block_polyline_holder").html(response);
                    

            });

        });

		jQuery("body").on("click", ".map-block_circle_del_btn", function() {
			
			var circle_id = jQuery(this).attr("id");
			var map_id = jQuery("#map-block_id").val();
			
			var map-block_map_id = "0";
			if (document.getElementsByName("map-block_id").length > 0) { map-block_map_id = jQuery("#map-block_id").val(); }
			var data = {
					action: 'delete_circle',
					security: map-blockaps_nonce,
					map_id: map-block_map_id,
					circle_id: circle_id
			};
			jQuery.post(ajaxurl, data, function(response) {
				$("#tabs-circles table").replaceWith(response);
				circle_array.forEach(function(circle) {
					
					if(circle.id == circle_id)
					{
						circle.setMap(null);
						return false;
					}
					
				});
				
			});
			
		});
		
		jQuery("body").on("click", ".map-block_rectangle_del_btn", function() {
			
			var rectangle_id = jQuery(this).attr("id");
			var map_id = jQuery("#map-block_id").val();
			
			var map-block_map_id = "0";
			if (document.getElementsByName("map-block_id").length > 0) { map-block_map_id = jQuery("#map-block_id").val(); }
			var data = {
					action: 'delete_rectangle',
					security: map-blockaps_nonce,
					map_id: map-block_map_id,
					rectangle_id: rectangle_id
			};
			jQuery.post(ajaxurl, data, function(response) {
				$("#tabs-rectangles table").replaceWith(response);
				rectangle_array.forEach(function(rectangle) {
					
					if(rectangle.id == rectangle_id)
					{
						rectangle.setMap(null);
						return false;
					}
					
				});
				
			});
			
		});
		
        jQuery('#map-block_map_type').on('change', function (e) {
            var optionSelected = jQuery("option:selected", this);
            var valueSelected = this.value;
            if (typeof valueSelected !== "undefined") {
                if (valueSelected === "1") { maptype = google.maps.MapTypeId.ROADMAP; }
                else if (valueSelected === "2") { maptype = google.maps.MapTypeId.SATELLITE; }
                else if (valueSelected === "3") { maptype = google.maps.MapTypeId.HYBRID; }
                else if (valueSelected === "4") { maptype = google.maps.MapTypeId.TERRAIN; }
                else { maptype = google.maps.MapTypeId.ROADMAP; }
            } else {
                maptype = google.maps.MapTypeId.ROADMAP;
            }
            MYMAP.map.setMapTypeId(maptype);
        });


        var map-block_edit_address = ""; /* set this here so we can use it in the edit marker function below */
        var map-block_edit_lat = ""; 
        var map-block_edit_lng = ""; 
        jQuery("body").on("click", ".map-block_edit_btn", function() {
            var cur_id = jQuery(this).attr("id");
            map-block_edit_address = jQuery("#map-block_hid_marker_address_"+cur_id).val();
            var map-block_edit_title = jQuery("#map-block_hid_marker_title_"+cur_id).val();
            var map-block_edit_anim = jQuery("#map-block_hid_marker_anim_"+cur_id).val();
            var map-block_edit_infoopen = jQuery("#map-block_hid_marker_infoopen_"+cur_id).val();
            
            if( map-block_edit_anim == '' ){ map-block_edit_anim = '0'; }
            if( map-block_edit_infoopen == '' ){ map-block_edit_infoopen = '0'; }
            
            map-block_edit_lat = jQuery("#map-block_hid_marker_lat_"+cur_id).val();
            map-block_edit_lng = jQuery("#map-block_hid_marker_lng_"+cur_id).val();
            
            jQuery("#map-block_edit_id").val(cur_id);
            jQuery("#map-block_add_address").val(map-block_edit_address);
            jQuery("#map-block_add_title").val(map-block_edit_title);
            jQuery("#map-block_animation").val(map-block_edit_anim);
            jQuery("#map-block_infoopen").val(map-block_edit_infoopen);
            jQuery("#map-block_addmarker_div").hide();
            jQuery("#map-block_editmarker_div").show();
        });

        jQuery("#map-block_addmarker").click(function(){
			var addressInput = $("#map-block_add_address")
			
			if(!marker_added && addressInput.val().length == 0)
			{
				alert("Please enter an address or right click on the map");
				addressInput.focus();
				return;
			}
			
			enableAddMarkerButton(false);

            var map-block_address = "0";
            var map-block_gps = "0";
            if ($("#map-block_add_address").length > 0)
				map-block_address = $("#map-block_add_address").val();
            var map-block_anim = "0";
            var map-block_infoopen = "0";
            if (document.getElementsByName("map-block_animation").length > 0) { map-block_anim = jQuery("#map-block_animation").val(); }
            if (document.getElementsByName("map-block_infoopen").length > 0) { map-block_infoopen = jQuery("#map-block_infoopen").val(); }

            /* first check if user has added a GPS co-ordinate */
            checker = map-block_address.split(",");
            var map-block_lat = "";
            var map-block_lng = "";
            map-block_lat = checker[0];
            map-block_lng = checker[1];
            checker1 = parseFloat(checker[0]);
            checker2 = parseFloat(checker[1]);
            if (typeof map-block_lat !== "undefined" && typeof map-block_lng !== "undefined" && (map-block_lat.match(/[a-zA-Z]/g) === null && map-block_lng.match(/[a-zA-Z]/g) === null) && checker.length === 2 && (checker1 != NaN && (checker1 <= 90 || checker1 >= -90)) && (checker2 != NaN && (checker2 <= 90 || checker2 >= -90))) {
                var data = {
                    action: 'add_marker',
                    security: map-blockaps_nonce,
                    map_id: map-blockaps_mapid,
                    address: map-block_address,
                    lat: map-block_lat,
                    lng: map-block_lng,
                    infoopen: map-block_infoopen,
                    anim: map-block_anim 
                };
                jQuery.post(ajaxurl, data, function(response) {

                    if (typeof tmp_marker !== "undefined" && typeof tmp_marker.map !== "undefined") {
                        tmp_marker.setMap(null);
                    }
                    returned_data = JSON.parse(response);

                    marker_id = returned_data.marker_id;
                    marker_data = returned_data.marker_data[marker_id];

                    if (typeof map-blockaps_localize_marker_data !== "undefined") { map-blockaps_localize_marker_data[marker_id] = marker_data; }
                    marker_data.map = MYMAP.map;

                    marker_data.point = new map-block.LatLng(map-block_lat,map-block_lng);

                    add_marker(marker_data);

                    //map-block_InitMap();
                    jQuery("#map-block_marker_holder").html(JSON.parse(response).table_html);
                    enableAddMarkerButton(true);
                    jQuery("#map-block_add_address").val("");
                    jQuery("#map-block_animation").val("0");
                    jQuery("#map-block_infoopen").val("0");
                    map-block_reinitialisetbl();
                    
                    MYMAP.map.setCenter(marker_data.point);
                    setMarkerAdded(false);
                    
                    if( jQuery("#map-blockaps_marker_cache_reminder").length > 0 ){

                        jQuery("#map-blockaps_marker_cache_reminder").fadeIn();

                    }

                    
                });
            } else { 
                geocoder.geocode ({ 'address': map-block_address }, function(results, status) {
                    if (status == map-block.Geocoder.SUCCESS) {

						result = results[0];
						map-block_lat = result.latLng.lat;
						map-block_lng = result.latLng.lng;

                        var data = {
                            action: 'add_marker',
                            security: map-blockaps_nonce,
                            map_id: map-blockaps_mapid,
                            address: map-block_address,
                            lat: map-block_lat,
                            lng: map-block_lng,
                            infoopen: map-block_infoopen,
                            anim: map-block_anim 
                        };
                        jQuery.post(ajaxurl, data, function(response) {
                            returned_data = JSON.parse(response);

                            marker_id = returned_data.marker_id;
                            marker_data = returned_data.marker_data[marker_id];
                            if (typeof map-blockaps_localize_marker_data !== "undefined") { map-blockaps_localize_marker_data[marker_id] = marker_data; }
                            marker_data.map = MYMAP.map;

                            marker_data.point = new map-block.LatLng(map-block_lat,map-block_lng);
                            add_marker(marker_data);

                            jQuery("#map-block_marker_holder").html(JSON.parse(response).table_html);
                            enableAddMarkerButton(true);
                            jQuery("#map-block_add_address").val("");
                            jQuery("#map-block_animation").val("0");
                            jQuery("#map-block_infoopen").val("0");
                            map-block_reinitialisetbl();
                            var myLatLng = new map-block.LatLng(map-block_lat,map-block_lng);
                            MYMAP.map.setCenter(myLatLng);
                            setMarkerAdded(false);

                            if( jQuery("#map-blockaps_marker_cache_reminder").length > 0 ){

                                jQuery("#map-blockaps_marker_cache_reminder").fadeIn();
                                
                            }
                        });
                        

                    } else {
                        alert("Geocode was not successful for the following reason: " + status);
                        enableAddMarkerButton(true);

                    }
                });
            }
        });


        jQuery("#map-block_editmarker").click(function(){

            jQuery("#map-block_editmarker_div").hide();
            jQuery("#map-block_editmarker_loading").show();


            var map-block_edit_id;
            map-block_edit_id = parseInt(jQuery("#map-block_edit_id").val());
            var map-block_address = "0";
            var map-block_gps = "0";
            var map-block_anim = "0";
            var map-block_infoopen = "0";
            if (document.getElementsByName("map-block_add_address").length > 0) { map-block_address = jQuery("#map-block_add_address").val(); }
            
            var do_geocode;
            if (map-block_address === map-block_edit_address) {
                do_geocode = false;
                var map-block_lat = map-block_edit_lat;
                var map-block_lng = map-block_edit_lng;
            } else { 
                do_geocode = true;
            }
            
            if (document.getElementsByName("map-block_animation").length > 0) { map-block_anim = jQuery("#map-block_animation").val(); }
            if (document.getElementsByName("map-block_infoopen").length > 0) { map-block_infoopen = jQuery("#map-block_infoopen").val(); }

            if (do_geocode === true) {

            geocoder.geocode( { 'address': map-block_address}, function(results, status) {
                if (status == map-block.Geocoder.SUCCESS) {
                    map-block_gps = String(results[0].geometry.location);
                    var map-block_lat = parseFloat(results[0].geometry.location.lat);
                    var map-block_lng = parseFloat(results[0].geometry.location.lng);

                    var data = {
                        action: 'edit_marker',
                        security: map-blockaps_nonce,
                        map_id: map-blockaps_mapid,
                        edit_id: map-block_edit_id,
                        address: map-block_address,
                        lat: map-block_lat,
                        lng: map-block_lng,
                        anim: map-block_anim,
                        infoopen: map-block_infoopen
                    };

                    jQuery.post(ajaxurl, data, function(response) {
                        returned_data = JSON.parse(response);
                        marker_id = returned_data.marker_id;
                        marker_data = returned_data.marker_data[marker_id];
                        if (typeof map-blockaps_localize_marker_data !== "undefined") {  map-blockaps_localize_marker_data[marker_id] = marker_data; }
                        marker_data.map = MYMAP.map;

                        marker_data.point = new map-block.LatLng(map-block_lat,map-block_lng);

                        add_marker(marker_data);
                        
                        jQuery("#map-block_add_address").val("");
                        jQuery("#map-block_add_title").val("");
                        jQuery("#map-block_marker_holder").html(JSON.parse(response).table_html);
                        jQuery("#map-block_addmarker_div").show();
                        jQuery("#map-block_editmarker_loading").hide();
                        jQuery("#map-block_edit_id").val("");
                        map-block_reinitialisetbl();
                        setMarkerAdded(false);

                        if( jQuery("#map-blockaps_marker_cache_reminder").length > 0 ){

                            jQuery("#map-blockaps_marker_cache_reminder").fadeIn();

                        }
                    });

                } else {
                    alert("Geocode was not successful for the following reason: " + status);
					enableEditMarkerButton(true);
                }
            });
            } else {
                /* address was the same, no need for geocoding */
                var data = {
                        action: 'edit_marker',
                        security: map-blockaps_nonce,
                        map_id: map-blockaps_mapid,
                        edit_id: map-block_edit_id,
                        address: map-block_address,
                        lat: map-block_lat,
                        lng: map-block_lng,
                        anim: map-block_anim,
                        infoopen: map-block_infoopen
                    };

                    jQuery.post(ajaxurl, data, function(response) {
                        returned_data = JSON.parse(response);
                        marker_id = returned_data.marker_id;
                        marker_data = returned_data.marker_data[marker_id];
                        
                        if (typeof map-blockaps_localize_marker_data !== "undefined") { map-blockaps_localize_marker_data[marker_id] = marker_data; }
                        marker_data.map = MYMAP.map;

                        marker_data.point = new map-block.LatLng(map-block_lat,map-block_lng);

                        add_marker(marker_data);
                        
                        jQuery("#map-block_add_address").val("");
                        jQuery("#map-block_add_title").val("");
                        jQuery("#map-block_marker_holder").html(JSON.parse(response).table_html);
                        jQuery("#map-block_addmarker_div").show();
                        jQuery("#map-block_editmarker_loading").hide();
                        jQuery("#map-block_edit_id").val("");
                        map-block_reinitialisetbl();
                        setMarkerAdded(false);
                        if( jQuery("#map-blockaps_marker_cache_reminder").length > 0 ){

                            jQuery("#map-blockaps_marker_cache_reminder").fadeIn();

                        }
                    });
            }



        });
    });

MYMAP = {
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

if ('undefined' === typeof map-blockaps_localize[map-blockaps_mapid]['other_settings']['map_max_zoom'] || map-blockaps_localize[map-blockaps_mapid]['other_settings']['map_max_zoom'] === "") { map-block_max_zoom = 0; } else { map-block_max_zoom = parseInt(map-blockaps_localize[map-blockaps_mapid]['other_settings']['map_max_zoom']); }
if ('undefined' === typeof map-blockaps_localize[map-blockaps_mapid]['other_settings']['map_min_zoom'] || map-blockaps_localize[map-blockaps_mapid]['other_settings']['map_min_zoom'] === "") { map-block_min_zoom = 21; } else { map-block_min_zoom = parseInt(map-blockaps_localize[map-blockaps_mapid]['other_settings']['map_min_zoom']); }


MYMAP.init = function(selector, latLng, zoom) {

	var maptype = null;
    if (window.google)
		switch(parseInt(map-blockaps_localize[map-blockaps_mapid].type))
		{
			case 2:
				maptype = google.maps.MapTypeId.SATELLITE;
				break;
				
			case 3:
				maptype = google.maps.MapTypeId.HYBRID;
				break;
				
			case 4:
				maptype = google.maps.MapTypeId.TERRAIN;
				break;
				
			default:
				maptype = google.maps.MapTypeId.ROADMAP;
				break;
		}

    var myOptions = {
		id: 1,
        zoom:zoom,
        minZoom: map-block_max_zoom,
        maxZoom: map-block_min_zoom,
        center: latLng,
        zoomControl: map-block_settings_map_zoom,
        panControl: map-block_settings_map_pan,
        mapTypeControl: map-block_settings_map_type,
        streetViewControl: map-block_settings_map_streetview,
        draggable: map-block_settings_map_draggable,
        disableDoubleClickZoom: map-block_settings_map_clickzoom,
        scrollwheel: map-block_settings_map_scroll,
        fullscreenControl: map-block_settings_map_full_screen_control,
        mapTypeId: maptype
    }

	this.map = map-block.Map.createInstance(jQuery(selector)[0], myOptions);
    //this.bounds = new google.maps.LatLngBounds();

    if ("undefined" !== typeof map-blockaps_localize[map-blockaps_mapid]['other_settings']['map-block_theme_data'] && map-blockaps_localize[map-blockaps_mapid]['other_settings']['map-block_theme_data'] !== false && map-blockaps_localize[map-blockaps_mapid]['other_settings']['map-block_theme_data'] !== "") {
        var map-block_theme_data = map-block_parse_theme_data(map-blockaps_localize[map-blockaps_mapid]['other_settings']['map-block_theme_data']);
        this.map.setOptions({styles: map-block_theme_data});
    }
	
	this.map.on("rightclick", function(event) {
        if (marker_added === false) {
            tmp_marker = map-block.Marker.createInstance({
                position: event.latLng, 
                map: MYMAP.map
            });
            tmp_marker.setDraggable(true);
            //google.maps.event.addListener(tmp_marker, 'dragend', function(event) { 
			tmp_marker.on("dragend", function(event) {
                jQuery("#map-block_add_address").val(event.latLng.lat+', '+event.latLng.lng);
            } );
            jQuery("#map-block_add_address").val(event.latLng.lat+', '+event.latLng.lng);
            jQuery("#map-block_notice_message_save_marker").show();
			
            setMarkerAdded("true");
			bindSaveReminder();
			
            setTimeout(function() {
                jQuery("#map-block_notice_message_save_marker").fadeOut('slow')
            }, 3000);
        } else {
            jQuery("#map-block_notice_message_addfirst_marker").fadeIn('fast')
            setTimeout(function() {
                jQuery("#map-block_notice_message_addfirst_marker").fadeOut('slow')
            }, 3000);
        }
       
    });

    this.map.on('zoom_changed', function() {

        zoomLevel = MYMAP.map.getZoom();
	
        jQuery("#map-block_start_zoom").val(zoomLevel);
        
        if (zoomLevel == 0 && map-block.settings.engine == "google-maps") {
            MYMAP.map.setZoom(10);
        }

    });
    
    jQuery( "#map-block_map").trigger( 'wpgooglemaps_loaded' );

    if (map-blockaps_localize_polygon_settings !== null) {
        if (typeof map-blockaps_localize_polygon_settings !== "undefined") {
              for(var poly_entry in map-blockaps_localize_polygon_settings) {
                add_polygon(poly_entry);
              }
        }
    }
    if (map-blockaps_localize_polyline_settings !== null) {
        if (typeof map-blockaps_localize_polyline_settings !== "undefined") {
              for(var poly_entry in map-blockaps_localize_polyline_settings) {
                add_polyline(poly_entry);
              }
        }
    }
    if (map-blockaps_localize[map-blockaps_mapid]['bicycle'] === "1") {
		MYMAP.map.enableBicycleLayer(true);
		
        //var bikeLayer = new google.maps.BicyclingLayer();
        //bikeLayer.setMap(MYMAP.map);
    }        
	
	if(map-block.settings.engine == "google")
	{
		if (map-blockaps_localize[map-blockaps_mapid]['traffic'] === "1") {
			var trafficLayer = new google.maps.TrafficLayer();
			trafficLayer.setMap(MYMAP.map);
		}    

		if ("undefined" !== typeof map-blockaps_localize[map-blockaps_mapid]['other_settings']['transport_layer'] && map-blockaps_localize[map-blockaps_mapid]['other_settings']['transport_layer'] === 1) {
			var transitLayer = new google.maps.TransitLayer();
			transitLayer.setMap(MYMAP.map);
		}
	}	
    
	if(window.map-block_circle_data_array) {
		window.circle_array = [];
		for(var circle_id in map-block_circle_data_array)
			add_circle(1, map-block_circle_data_array[circle_id]);
	}
	
	if(window.map-block_rectangle_data_array) {
		window.rectangle_array = [];
		for(var rectangle_id in map-block_rectangle_data_array)
			add_rectangle(1, map-block_rectangle_data_array[rectangle_id]);
	}
	
	
    MYMAP.map.on('click', function(event) {
		if(event.target instanceof map-block.Map)
			close_infowindows();
    });
    
    
    MYMAP.map.on('bounds_changed', function() {
        var location = MYMAP.map.getCenter();
        jQuery("#map-block_start_location").val(location.lat+","+location.lng);
        jQuery("#map-blockaps_save_reminder").show();
		bindSaveReminder();
    });

}


if (typeof map-blockaps_localize_global_settings['map-block_settings_infowindow_width'] !== "undefined" && map-blockaps_localize_global_settings['map-block_settings_infowindow_width'] !== "" && typeof infoWindow !== "undefined" && typeof infoWindow.setOptions !== "undefined") { infoWindow.setOptions({maxWidth:map-blockaps_localize_global_settings['map-block_settings_infowindow_width']}); }

if(window.google)
	google.maps.event.addDomListener(window, 'resize', function() {
		var myLatLng = new map-block.LatLng(map-blockaps_localize[map-blockaps_mapid].map_start_lat,map-blockaps_localize[map-blockaps_mapid].map_start_lng);
		MYMAP.map.setCenter(myLatLng);
	});


MYMAP.placeMarkers = function(filename,map_id,radius,searched_center,distance_type) {
    var check1 = 0;
    if (map-blockaps_localize_global_settings.map-block_settings_marker_pull === '1') {
        jQuery.get(filename, function(xml){
            jQuery(xml).find("marker").each(function(){
                var wpmgza_map_id = jQuery(this).find('map_id').text();

                if (wpmgza_map_id == map_id) {
                    var wpmgza_address = jQuery(this).find('address').text();
                    var lat = jQuery(this).find('lat').text();
                    var lng = jQuery(this).find('lng').text();
                    var wpmgza_anim = jQuery(this).find('anim').text();
                    var marker_id = jQuery(this).find('marker_id').text();
                    var wpmgza_infoopen = jQuery(this).find('infoopen').text();
                    var current_lat = jQuery(this).find('lat').text();
                    var current_lng = jQuery(this).find('lng').text();
                    var show_marker_radius = true;

                    if (radius !== null) {
                        if (check1 > 0 ) { } else { 


                            var point = new map-block.LatLng(parseFloat(searched_center.lat()),parseFloat(searched_center.lng()));
                            //MYMAP.bounds.extend(point);
                            if (typeof map-blockaps_localize[map-blockaps_mapid]['other_settings']['store_locator_bounce'] === "undefined" || map-blockaps_localize[map-blockaps_mapid]['other_settings']['store_locator_bounce'] === 1) {
                                var marker = map-block.Marker.createInstance({
                                        position: point,
                                        map: MYMAP.map,
                                        animation: google.maps.Animation.BOUNCE
                                });
                            } else { /* dont show icon */ }
                            if (distance_type == "1") {
                                var populationOptions = {
                                      strokeColor: '#FF0000',
                                      strokeOpacity: 0.25,
                                      strokeWeight: 2,
                                      fillColor: '#FF0000',
                                      fillOpacity: 0.15,
                                      map: MYMAP.map,
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
                                      map: MYMAP.map,
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



                    var point = new map-block.LatLng(parseFloat(lat),parseFloat(lng));
                    //MYMAP.bounds.extend(point);
                    if (show_marker_radius === true) {
                            marker_data = new Object();
                            marker_data.anim = wpmgza_anim;
                            marker_data.point = point;
                            marker_data.marker_id = marker_id;
                            marker_data.map = MYMAP.map;
                            marker_data.address = wpmgza_address;
                            marker_data.radius = radius;
                            marker_data.distance_type = distance_type;
                            marker_data.d = d;
                            marker_data.infoopen = wpmgza_infoopen;


                            add_marker(marker_data);

                    }
                }
            });

        });
    } else { 

        if (typeof map-blockaps_localize_marker_data !== "undefined") {
            jQuery.each(map-blockaps_localize_marker_data, function(i, val) {
                
                var wpmgza_map_id = val.map_id;

                    if (wpmgza_map_id == map_id) {
                        
                        var wpmgza_address = val.address;
                        var marker_id = val.marker_id;
                        var wpmgza_anim = val.anim;
                        var wpmgza_infoopen = val.infoopen;
                        var lat = val.lat;
                        var lng = val.lng;
                        var point = new map-block.LatLng(parseFloat(lat),parseFloat(lng));
                        
                       
                        var current_lat = val.lat;
                        var current_lng = val.lng;
                        var show_marker_radius = true;

                        if (radius !== null) {
                            if (check1 > 0 ) { } else { 


                                var point = new map-block.LatLng(parseFloat(searched_center.lat()),parseFloat(searched_center.lng()));
                                //MYMAP.bounds.extend(point);
                                if (typeof map-blockaps_localize[map-blockaps_mapid]['other_settings']['store_locator_bounce'] === "undefined" || map-blockaps_localize[map-blockaps_mapid]['other_settings']['store_locator_bounce'] === 1) {
                                    var marker = map-block.Marker.createInstance({
                                            position: point,
                                            map: MYMAP.map,
                                            animation: google.maps.Animation.BOUNCE
                                    });
                                } else { /* dont show icon */ }
                                if (distance_type == "1") {
                                    var populationOptions = {
                                          strokeColor: '#FF0000',
                                          strokeOpacity: 0.25,
                                          strokeWeight: 2,
                                          fillColor: '#FF0000',
                                          fillOpacity: 0.15,
                                          map: MYMAP.map,
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
                                          map: MYMAP.map,
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

                        

                        var point = {
							lat: parseFloat(lat),
							lng: parseFloat(lng)
						};
                        //MYMAP.bounds.extend(point);
                        if (show_marker_radius === true) {
                            marker_data = new Object();
                            marker_data.anim = wpmgza_anim;
                            marker_data.point = point;
                            marker_data.marker_id = marker_id;
                            marker_data.map = MYMAP.map;
                            marker_data.address = wpmgza_address;
                            marker_data.radius = radius;
                            marker_data.distance_type = distance_type;
                            marker_data.d = d;
                            marker_data.infoopen = wpmgza_infoopen;



                            add_marker(marker_data);

                          
                        }
                    }
            });
        }
    }
}


function add_marker(marker_data) {


    if (typeof map-blockaps_markers_array[marker_data.marker_id] !== "undefined") {
        map-blockaps_markers_array[marker_data.marker_id].setMap(null);
    }

    marker_data.marker_id = parseInt(marker_data.marker_id);

    /*if (marker_data.anim === "1") { marker_animation_type = google.maps.Animation.BOUNCE; }
    else if (marker_data.anim === "2") { marker_animation_type = google.maps.Animation.DROP; }
    else {  marker_animation_type = null; } */
    
	var marker = map-blockaps_markers_array[marker_data.marker_id] = map-block.Marker.createInstance({
        position: marker_data.point,
        map: MYMAP.map,
        animation: marker_data.anim
    });

    var d_string = "";

    if (typeof marker_data.radius !== "undefined" && marker_data.radius !== null) {                                 
        if (marker_data.distance_type == "1") {
            d_string = "<p style='min-width:100px; display:block;'>"+Math.round(marker_data.d,2)+" "+map-blockaps_lang_m_away+"</p>"; 
        } else {
            d_string = "<p style='min-width:100px; display:block;'>"+Math.round(marker_data.d,2)+" "+map-blockaps_lang_km_away+"</p>";
        }
    } else { d_string = ''; }
    infoWindow[marker_data.marker_id] = map-block.InfoWindow.createInstance(marker);
    var html='<span style=\'min-width:100px; display:block;\'>'+marker_data.address+'</span>'+d_string;
    if (marker_data.infoopen === "1") {
        infoWindow[marker_data.marker_id].setContent(html);
        infoWindow[marker_data.marker_id].open(marker_data.map, map-blockaps_markers_array[marker_data.marker_id]);
    }
    temp_actiontype = 'click';
    if (typeof map-blockaps_localize_global_settings.map-block_settings_map_open_marker_by !== "undefined" && map-blockaps_localize_global_settings.map-block_settings_map_open_marker_by == '2') {
        temp_actiontype = 'mouseover';
    }
	
    marker.on(temp_actiontype, function() {
        close_infowindows();
        infoWindow[marker_data.marker_id].setContent(html);
        infoWindow[marker_data.marker_id].open(marker_data.map, map-blockaps_markers_array[marker_data.marker_id]);
    });

}
function close_infowindows() {
    infoWindow.forEach(function(entry,index) {
        infoWindow[index].close();
    });
}

function add_polygon(polygonid) {
	
	if(map-block.settings.engine != "google-maps")
		return;
	
    var tmp_data = map-blockaps_localize_polygon_settings[polygonid];
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
         map: MYMAP.map.googleMap
   });
   map-block_Path_Polygon[polygonid].setMap(MYMAP.map.googleMap);

    polygon_center = bounds.getCenter();

    if (tmp_data['title'] !== "") {
        if(!window.infoWindow_poly) {
            infoWindow_poly = {};
        }
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
             infoWindow_poly[polygonid].open(MYMAP.map,this.position);
        }); 
    }


    
}
function add_polyline(polyline) {
    
	if(map-block.settings.engine != "google-maps")
		return;
    
    var tmp_data = map-blockaps_localize_polyline_settings[polyline];

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
         map: MYMAP.map.googleMap
   });
   map-block_Path[polyline].setMap(MYMAP.map.googleMap);
    
    
}

function add_circle(mapid, data)
{
	if(map-block.settings.engine != "google-maps")
		return;
	
	data.map = MYMAP.map.googleMap;
	
	var m = data.center.match(/-?\d+(\.\d*)?/g);
	data.center = {
		lat: parseFloat(m[0]),
		lng: parseFloat(m[1]),
	};
	
	data.radius = parseFloat(data.radius);
	data.fillColor = data.color;
	data.fillOpacity = parseFloat(data.opacity);
	
	data.strokeOpacity = 0;
	
	var circle = new google.maps.Circle(data);
	circle_array.push(circle);
}

function add_rectangle(mapid, data)
{
	if(map-block.settings.engine != "google-maps")
		return;
	
	data.map = MYMAP.map.googleMap;
	
	data.fillColor = data.color;
	data.fillOpacity = parseFloat(data.opacity);
	
	var northWest = data.cornerA;
	var southEast = data.cornerB;
	
	var m = northWest.match(/-?\d+(\.\d+)?/g);
	var north = parseFloat(m[0]);
	var west = parseFloat(m[1]);
	
	m = southEast.match(/-?\d+(\.\d+)?/g);
	var south = parseFloat(m[0]);
	var east = parseFloat(m[1]);
	
	data.bounds = {
		north: north,
		west: west,
		south: south,
		east: east
	};
	
	data.strokeOpacity = 0;
	
	var rectangle = new google.maps.Rectangle(data);
	rectangle_array.push(rectangle);
}

})(jQuery);