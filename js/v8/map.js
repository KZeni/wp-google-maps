/**
 * @namespace map-block
 * @module Map
 * @requires map-block.EventDispatcher
 */
jQuery(function($) {
	
	/**
	 * Constructor
	 * @param element to contain map
	 */
	map-block.Map = function(element, options)
	{
		var self = this;
		
		map-block.assertInstanceOf(this, "Map");
		
		map-block.EventDispatcher.call(this);
		
		if(!(element instanceof HTMLElement))
			throw new Error("Argument must be a HTMLElement");
		
		this.id = element.getAttribute("data-map-id");
		if(!/\d+/.test(this.id))
			throw new Error("Map ID must be an integer");
		
		map-block.maps.push(this);
		this.element = element;
		this.element.map-blockMap = this;
		
		this.engineElement = element;
		
		this.markers = [];
		this.polygons = [];
		this.polylines = [];
		this.circles = [];
		
		this.loadSettings(options);
	}
	
	map-block.Map.prototype = Object.create(map-block.EventDispatcher.prototype);
	map-block.Map.prototype.constructor = map-block.Map;
	
	map-block.Map.getConstructor = function()
	{
		switch(map-block.settings.engine)
		{
			case "open-layers":
				if(map-block.isProVersion())
					return map-block.OLProMap;
				
				return map-block.OLMap;
				break;
			
			default:
				if(map-block.isProVersion())
					return map-block.GoogleProMap;
				
				return map-block.GoogleMap;
				break;
		}
	}
	
	map-block.Map.createInstance = function(element, options)
	{
		var constructor = map-block.Map.getConstructor();
		return new constructor(element, options);
	}
	
	/**
	 * Loads the maps settings and sets some defaults
	 * @return void
	 */
	map-block.Map.prototype.loadSettings = function(options)
	{
		var settings = new map-block.MapSettings(this.element);
		var other_settings = settings.other_settings;
		
		delete settings.other_settings;
		
		if(other_settings)
			for(var key in other_settings)
				settings[key] = other_settings[key];
			
		if(options)
			for(var key in options)
				settings[key] = options[key];
			
		this.settings = settings;
	}
	
	/**
	 * This override should automatically dispatch a .map-block scoped event on the element
	 * TODO: Implement
	 */
	/*map-block.Map.prototype.trigger = function(event)
	{
		
	}*/
	
	/**
	 * Sets options in bulk on map
	 * @return void
	 */
	map-block.Map.prototype.setOptions = function(options)
	{
		for(var name in options)
			this.settings[name] = options[name];
	}
	
	/**
	 * Gets the distance between two latLngs in kilometers
	 * NB: Static function
	 * @return number
	 */
	var earthRadiusMeters = 6371;
	var piTimes360 = Math.PI / 360;
	
	function deg2rad(deg) {
	  return deg * (Math.PI/180)
	};
	
	/**
	 * This gets the distance in kilometers between two latitude / longitude points
	 * TODO: Move this to the distance class, or the LatLng class
	 * @return void
	 */
	map-block.Map.getGeographicDistance = function(lat1, lon1, lat2, lon2)
	{
		var dLat = deg2rad(lat2-lat1);
		var dLon = deg2rad(lon2-lon1); 
		
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
			
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = earthRadiusMeters * c; // Distance in km
		
		return d;
	}
	
	map-block.Map.prototype.setCenter = function(latLng)
	{
		if(!("lat" in latLng && "lng" in latLng))
			throw new Error("Argument is not an object with lat and lng");
	}
	
	/**
	 * Sets the dimensions of the map
	 * @return void
	 */
	map-block.Map.prototype.setDimensions = function(width, height)
	{
		$(this.element).css({
			width: width
		});
		
		$(this.engineElement).css({
			width: "100%",
			height: height
		});
	}
	
	/**
	 * Adds the specified marker to this map
	 * @return void
	 */
	map-block.Map.prototype.addMarker = function(marker)
	{
		if(!(marker instanceof map-block.Marker))
			throw new Error("Argument must be an instance of map-block.Marker");
		
		marker.map = this;
		marker.parent = this;
		
		this.markers.push(marker);
		this.dispatchEvent({type: "markeradded", marker: marker});
		marker.dispatchEvent({type: "added"});
	}
	
	/**
	 * Removes the specified marker from this map
	 * @return void
	 */
	map-block.Map.prototype.removeMarker = function(marker)
	{
		if(!(marker instanceof map-block.Marker))
			throw new Error("Argument must be an instance of map-block.Marker");
		
		if(marker.map !== this)
			throw new Error("Wrong map error");
		
		marker.map = null;
		marker.parent = null;
		
		this.markers.splice(this.markers.indexOf(marker), 1);
		this.dispatchEvent({type: "markerremoved", marker: marker});
		marker.dispatchEvent({type: "removed"});
	}
	
	map-block.Map.prototype.getMarkerByID = function(id)
	{
		for(var i = 0; i < this.markers.length; i++)
		{
			if(this.markers[i].id == id)
				return this.markers[i];
		}
		
		return null;
	}
	
	map-block.Map.prototype.removeMarkerByID = function(id)
	{
		var marker = this.getMarkerByID(id);
		
		if(!marker)
			return;
		
		this.removeMarker(marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @return void
	 */
	map-block.Map.prototype.addPolygon = function(polygon)
	{
		if(!(polygon instanceof map-block.Polygon))
			throw new Error("Argument must be an instance of map-block.Polygon");
		
		polygon.map = this;
		
		this.polygons.push(polygon);
		this.dispatchEvent({type: "polygonadded", polygon: polygon});
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	map-block.Map.prototype.deletePolygon = function(polygon)
	{
		if(!(polygon instanceof map-block.Polygon))
			throw new Error("Argument must be an instance of map-block.Polygon");
		
		if(polygon.map !== this)
			throw new Error("Wrong map error");
		
		polygon.map = null;
		
		this.polygons.splice(this.polygons.indexOf(polygon), 1);
		this.dispatchEvent({type: "polygonremoved", polygon: polygon});
	}
	
	map-block.Map.prototype.getPolygonByID = function(id)
	{
		for(var i = 0; i < this.polygons.length; i++)
		{
			if(this.polygons[i].id == id)
				return this.polygons[i];
		}
		
		return null;
	}
	
	map-block.Map.prototype.deletePolygonByID = function(id)
	{
		var polygon = this.getPolygonByID(id);
		
		if(!polygon)
			return;
		
		this.deletePolygon(polygon);
	}
	
	/**
	 * Gets a polyline by ID
	 * @return void
	 */
	map-block.Map.prototype.getPolylineByID = function(id)
	{
		for(var i = 0; i < this.polylines.length; i++)
		{
			if(this.polylines[i].id == id)
				return this.polylines[i];
		}
		
		return null;
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @return void
	 */
	map-block.Map.prototype.addPolyline = function(polyline)
	{
		if(!(polyline instanceof map-block.Polyline))
			throw new Error("Argument must be an instance of map-block.Polyline");
		
		polyline.map = this;
		
		this.polylines.push(polyline);
		this.dispatchEvent({type: "polylineadded", polyline: polyline});
	}
	
	/**
	 * Removes the specified polyline from this map
	 * @return void
	 */
	map-block.Map.prototype.deletePolyline = function(polyline)
	{
		if(!(polyline instanceof map-block.Polyline))
			throw new Error("Argument must be an instance of map-block.Polyline");
		
		if(polyline.map !== this)
			throw new Error("Wrong map error");
		
		polyline.map = null;
		
		this.polylines.splice(this.polylines.indexOf(polyline), 1);
		this.dispatchEvent({type: "polylineremoved", polyline: polyline});
	}
	
	map-block.Map.prototype.getPolylineByID = function(id)
	{
		for(var i = 0; i < this.polylines.length; i++)
		{
			if(this.polylines[i].id == id)
				return this.polylines[i];
		}
		
		return null;
	}
	
	map-block.Map.prototype.deletePolylineByID = function(id)
	{
		var polyline = this.getPolylineByID(id);
		
		if(!polyline)
			return;
		
		this.deletePolyline(polyline);
	}
	
	/**
	 * Adds the specified circle to this map
	 * @return void
	 */
	map-block.Map.prototype.addCircle = function(circle)
	{
		if(!(circle instanceof map-block.Circle))
			throw new Error("Argument must be an instance of map-block.Circle");
		
		circle.map = this;
		
		this.circles.push(circle);
		this.dispatchEvent({type: "circleadded", circle: circle});
	}
	
	/**
	 * Removes the specified circle from this map
	 * @return void
	 */
	map-block.Map.prototype.removeCircle = function(circle)
	{
		if(!(circle instanceof map-block.Circle))
			throw new Error("Argument must be an instance of map-block.Circle");
		
		if(circle.map !== this)
			throw new Error("Wrong map error");
		
		circle.map = null;
		
		this.circles.splice(this.circles.indexOf(circle), 1);
		this.dispatchEvent({type: "circleremoved", circle: circle});
	}
	
	map-block.Map.prototype.getCircleByID = function(id)
	{
		for(var i = 0; i < this.circles.length; i++)
		{
			if(this.circles[i].id == id)
				return this.circles[i];
		}
		
		return null;
	}
	
	map-block.Map.prototype.deleteCircleByID = function(id)
	{
		var circle = this.getCircleByID(id);
		
		if(!circle)
			return;
		
		this.deleteCircle(circle);
	}
	
	/**
	 * Nudges the map viewport by the given pixel coordinates
	 * @return void
	 */
	map-block.Map.prototype.nudge = function(x, y)
	{
		var pixels = this.latLngToPixels(this.getCenter());
		
		pixels.x += parseFloat(x);
		pixels.y += parseFloat(y);
		
		if(isNaN(pixels.x) || isNaN(pixels.y))
			throw new Error("Invalid coordinates supplied");
		
		var latLng = this.pixelsToLatLng(pixels);
		
		this.setCenter(latLng);
	}
	
	/**
	 * Triggered when the window resizes
	 * @return void
	 */
	map-block.Map.prototype.onWindowResize = function(event)
	{
		
	}
	
	/**
	 * Listener for when the engine map div is resized
	 * @return void
	 */
	map-block.Map.prototype.onElementResized = function(event)
	{
		
	}
	
	map-block.Map.prototype.onBoundsChanged = function(event)
	{
		// Native events
		this.trigger("boundschanged");
		
		// Google / legacy compatibility events
		this.trigger("bounds_changed");
	}
	
	map-block.Map.prototype.onIdle = function(event)
	{
		$(this.element).trigger("idle");
	}
	
	/*$(document).ready(function() {
		function createMaps()
		{
			// TODO: Test that this works for maps off screen (which borks google)
			$(".map-block-map").each(function(index, el) {
				if(!el.map-blockMap)
				{
					map-block.runCatchableTask(function() {
						map-block.Map.createInstance(el);
					}, el);
				}
			});
		}
		
		createMaps();
		
		// Call again each second to load AJAX maps
		setInterval(createMaps, 1000);
	});*/
});