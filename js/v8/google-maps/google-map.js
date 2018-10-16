/**
 * @namespace map-block
 * @module GoogleMap
 * @requires map-block.Map
 * @pro-requires map-block.ProMap
 */
jQuery(function($) {
	var Parent;
	
	/**
	 * Constructor
	 * @param element to contain the map
	 */
	map-block.GoogleMap = function(element, options)
	{
		var self = this;
		
		Parent.call(this, element, options);
		
		if(!window.google)
		{
			var status = map-block.googleAPIStatus;
			var message = "Google API not loaded";
			
			if(status && status.message)
				message += " - " + status.message;
			
			if(status.code == "USER_CONSENT_NOT_GIVEN")
			{
				return;
			}
			
			$(element).html("<div class='notice notice-error'><p>" + map-block.localized_strings.google_api_not_loaded + "<pre>" + message + "</pre></p></div>");
			
			throw new Error(message);
		}
		
		this.loadGoogleMap();
		
		if(options)
			this.setOptions(options);

		google.maps.event.addListener(this.googleMap, "click", function(event) {
			var map-blockEvent = new map-block.Event("click");
			map-blockEvent.latLng = {
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			self.dispatchEvent(map-blockEvent);
		});
		
		google.maps.event.addListener(this.googleMap, "rightclick", function(event) {
			var map-blockEvent = new map-block.Event("rightclick");
			map-blockEvent.latLng = {
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			self.dispatchEvent(map-blockEvent);
		});
		
		google.maps.event.addListener(this.googleMap, "dragend", function(event) {
			self.dispatchEvent("dragend");
		});
		
		google.maps.event.addListener(this.googleMap, "zoom_changed", function(event) {
			self.dispatchEvent("zoom_changed");
			self.dispatchEvent("zoomchanged");
		});
		
		// Idle event
		google.maps.event.addListener(this.googleMap, "idle", function(event) {
			self.onIdle(event);
		});
		
		// Dispatch event
		if(!map-block.isProVersion())
		{
			this.dispatchEvent("created");
			map-block.events.dispatchEvent({type: "mapcreated", map: this});
		}
	}
	
	// If we're running the Pro version, inherit from ProMap, otherwise, inherit from Map
	if(map-block.isProVersion())
	{
		Parent = map-block.ProMap;
		map-block.GoogleMap.prototype = Object.create(map-block.ProMap.prototype);
	}
	else
	{
		Parent = map-block.Map;
		map-block.GoogleMap.prototype = Object.create(map-block.Map.prototype);
	}
	map-block.GoogleMap.prototype.constructor = map-block.GoogleMap;
	
	/**
	 * Creates the Google Maps map
	 * @return void
	 */
	map-block.GoogleMap.prototype.loadGoogleMap = function()
	{
		var self = this;
		var options = this.settings.toGoogleMapsOptions();
		
		this.googleMap = new google.maps.Map(this.engineElement, options);
		google.maps.event.addListener(this.googleMap, "bounds_changed", function() { 
			self.onBoundsChanged();
		});
		
		if(this.settings.bicycle == 1)
			this.enableBicycleLayer(true);
		if(this.settings.traffic == 1)
			this.enableTrafficLayer(true);
		if(this.settings.transport == 1)
			this.enablePublicTransportLayer(true);
		this.showPointsOfInterest(this.settings.show_points_of_interest);
		
		// Move the loading wheel into the map element (it has to live outside in the HTML file because it'll be overwritten by Google otherwise)
		$(this.engineElement).append($(this.element).find(".map-block-loader"));
	}
	
	map-block.GoogleMap.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		this.googleMap.setOptions(this.settings.toGoogleMapsOptions());
		
		var clone = $.extend({}, options);
		if(clone.center instanceof map-block.LatLng || typeof clone.center == "object")
			clone.center = {
				lat: parseFloat(clone.center.lat),
				lng: parseFloat(clone.center.lng)
			};
		
		this.googleMap.setOptions(clone);
	}
	
	/**
	 * Adds the specified marker to this map
	 * @return void
	 */
	map-block.GoogleMap.prototype.addMarker = function(marker)
	{
		marker.googleMarker.setMap(this.googleMap);
		
		Parent.prototype.addMarker.call(this, marker);
	}
	
	/**
	 * Removes the specified marker from this map
	 * @return void
	 */
	map-block.GoogleMap.prototype.removeMarker = function(marker)
	{
		marker.googleMarker.setMap(null);
		
		Parent.prototype.removeMarker.call(this, marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @return void
	 */
	map-block.GoogleMap.prototype.addPolygon = function(polygon)
	{
		polygon.googlePolygon.setMap(this.googleMap);
		
		Parent.prototype.addPolygon.call(this, polygon);
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	map-block.GoogleMap.prototype.removePolygon = function(polygon)
	{
		polygon.googlePolygon.setMap(null);
		
		Parent.prototype.removePolygon.call(this, polygon);
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @return void
	 */
	map-block.GoogleMap.prototype.addPolyline = function(polyline)
	{
		polyline.googlePolyline.setMap(this.googleMap);
		
		Parent.prototype.addPolyline.call(this, polyline);
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	map-block.GoogleMap.prototype.removePolyline = function(polyline)
	{
		polyline.googlePolyline.setMap(null);
		
		Parent.prototype.removePolyline.call(this, polyline);
	}
	
	map-block.GoogleMap.prototype.addCircle = function(circle)
	{
		circle.googleCircle.setMap(this.googleMap);
		
		Parent.prototype.addCircle.call(this, circle);
	}
	
	map-block.GoogleMap.prototype.removeCircle = function(circle)
	{
		circle.googleCircle.setMap(null);
		
		Parent.prototype.removeCircle.call(this, circle);
	}
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	map-block.GoogleMap.prototype.getCenter = function()
	{
		var latLng = this.googleMap.getCenter();
		
		return {
			lat: latLng.lat(),
			lng: latLng.lng()
		};
	}
	
	/**
	 * Delegate for google maps setCenter
	 * @return void
	 */
	map-block.GoogleMap.prototype.setCenter = function(latLng)
	{
		map-block.Map.prototype.setCenter.call(this, latLng);
		
		if(latLng instanceof map-block.LatLng)
			this.googleMap.setCenter({
				lat: latLng.lat,
				lng: latLng.lng
			});
		else
			this.googleMap.setCenter(latLng);
	}
	
	/**
	 * Delegate for google maps setPan
	 * @return void
	 */
	map-block.GoogleMap.prototype.panTo = function(latLng)
	{
		if(latLng instanceof map-block.LatLng)
			this.googleMap.panTo({
				lat: latLng.lat,
				lng: latLng.lng
			});
		else
			this.googleMap.panTo(latLng);
	}
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	map-block.GoogleMap.prototype.getZoom = function()
	{
		return this.googleMap.getZoom();
	}
	
	/**
	 * Delegate for google maps getZoom
	 * @return void
	 */
	map-block.GoogleMap.prototype.setZoom = function(value)
	{
		if(isNaN(value))
			throw new Error("Value must not be NaN");
		
		return this.googleMap.setZoom(value);
	}
	
	/**
	 * Gets the bounds
	 * @return object
	 */
	map-block.GoogleMap.prototype.getBounds = function()
	{
		var bounds = this.googleMap.getBounds();
		var northEast = bounds.getNorthEast();
		var southWest = bounds.getSouthWest();
		
		return {
			topLeft: {
				lat: northEast.lat(),
				lng: southWest.lng()
			},
			bottomRight: {
				lat: southWest.lat(),
				lng: northEast.lng()
			}
		};
	}
	
	/**
	 * Fit to given boundaries
	 * @return void
	 */
	map-block.GoogleMap.prototype.fitBounds = function(southWest, northEast)
	{
		if(southWest instanceof map-block.LatLng)
			southWest = {lat: southWest.lat, lng: southWest.lng};
		if(northEast instanceof map-block.LatLng)
			northEast = {lat: northEast.lat, lng: northEast.lng};
		
		this.googleMap.fitBounds(southWest, northEast);
	}
	
	/**
	 * Fit the map boundaries to visible markers
	 * @return void
	 */
	map-block.GoogleMap.prototype.fitBoundsToVisibleMarkers = function()
	{
		var bounds = new google.maps.LatLngBounds();
		for(var i = 0; i < this.markers.length; i++)
		{
			if(markers[i].getVisible())
				bounds.extend(markers[i].getPosition());
		}
		this.googleMap.fitBounds(bounds);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	map-block.GoogleMap.prototype.enableBicycleLayer = function(enable)
	{
		if(!this.bicycleLayer)
			this.bicycleLayer = new google.maps.BicyclingLayer();
		
		this.bicycleLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	map-block.GoogleMap.prototype.enableTrafficLayer = function(enable)
	{
		if(!this.trafficLayer)
			this.trafficLayer = new google.maps.TrafficLayer();
		
		this.trafficLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	map-block.GoogleMap.prototype.enablePublicTransportLayer = function(enable)
	{
		if(!this.publicTransportLayer)
			this.publicTransportLayer = new google.maps.TransitLayer();
		
		this.publicTransportLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Shows / hides points of interest
	 * @param show boolean, enable or not
	 * @return void
	 */
	map-block.GoogleMap.prototype.showPointsOfInterest = function(show)
	{
		// TODO: This will bug the front end because there is textarea with theme data
		var text = $("textarea[name='theme_data']").val();
		
		if(!text)
			return;
		
		var styles = JSON.parse(text);
		
		styles.push({
			featureType: "poi",
			stylers: [
				{
					visibility: (show ? "on" : "off")
				}
			]
		});
		
		this.googleMap.setOptions({styles: styles});
	}
	
	/**
	 * Gets the min zoom of the map
	 * @return int
	 */
	map-block.GoogleMap.prototype.getMinZoom = function()
	{
		return parseInt(this.settings.min_zoom);
	}
	
	/**
	 * Sets the min zoom of the map
	 * @return void
	 */
	map-block.GoogleMap.prototype.setMinZoom = function(value)
	{
		this.googleMap.setOptions({
			minZoom: value,
			maxZoom: this.getMaxZoom()
		});
	}
	
	/**
	 * Gets the min zoom of the map
	 * @return int
	 */
	map-block.GoogleMap.prototype.getMaxZoom = function()
	{
		return parseInt(this.settings.max_zoom);
	}
	
	/**
	 * Sets the min zoom of the map
	 * @return void
	 */
	map-block.GoogleMap.prototype.setMaxZoom = function(value)
	{
		this.googleMap.setOptions({
			minZoom: this.getMinZoom(),
			maxZoom: value
		});
	}
	
	map-block.GoogleMap.prototype.latLngToPixels = function(latLng)
	{
		var map = this.googleMap;
		var nativeLatLng = new google.maps.LatLng({
			lat: parseFloat(latLng.lat),
			lng: parseFloat(latLng.lng)
		});
		var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
		var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
		var scale = Math.pow(2, map.getZoom());
		var worldPoint = map.getProjection().fromLatLngToPoint(nativeLatLng);
		return {
			x: (worldPoint.x - bottomLeft.x) * scale, 
			y: (worldPoint.y - topRight.y) * scale
		};
	}
	
	map-block.GoogleMap.prototype.pixelsToLatLng = function(x, y)
	{
		if(y == undefined)
		{
			if("x" in x && "y" in x)
			{
				y = x.y;
				x = x.x;
			}
			else
				console.warn("Y coordinate undefined in pixelsToLatLng (did you mean to pass 2 arguments?)");
		}
		
		var map = this.googleMap;
		var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
		var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
		var scale = Math.pow(2, map.getZoom());
		var worldPoint = new google.maps.Point(x / scale + bottomLeft.x, y / scale + topRight.y);
		var latLng = map.getProjection().fromPointToLatLng(worldPoint);
		return {
			lat: latLng.lat(),
			lng: latLng.lng()
		};
	}
	
	/**
	 * Handle the map element resizing
	 * @return void
	 */
	map-block.GoogleMap.prototype.onElementResized = function(event)
	{
		if(!this.googleMap)
			return;
		google.maps.event.trigger(this.googleMap, "resize");
	}
	
});