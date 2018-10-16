// TODO: Move this file into /js and out of /includes which is for PHP
jQuery(function($){
	jQuery(window).on("load", function(){
		if(typeof map-block_backwards_compat_v6_marker_tab_headings !== "undefined"){
			$("#map-blockaps_tabs_markers > ul").append(map-block_backwards_compat_v6_marker_tab_headings);
			$("#map-blockaps_tabs_markers").append(map-block_backwards_compat_v6_marker_tab_content);

			$("#map-blockaps_tabs_markers").tabs("refresh");
		}

		if(typeof MYMAP !== "undefined"){
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
		}
	});

	function add_circle(mapid, data){
		data.map = MYMAP.map;
		
		var m = data.center.match(/-?\d+(\.\d*)?/g);
		data.center = new google.maps.LatLng({
			lat: parseFloat(m[0]),
			lng: parseFloat(m[1]),
		});
		
		data.radius = parseFloat(data.radius);
		data.fillColor = data.color;
		data.fillOpacity = parseFloat(data.opacity);
		
		data.strokeOpacity = 0;
		
		var circle = new google.maps.Circle(data);
		circle_array.push(circle);
	}

	function add_rectangle(mapid, data)	{
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
});