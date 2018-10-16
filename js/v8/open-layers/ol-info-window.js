/**
 * @namespace map-block
 * @module OLInfoWindow
 * @requires map-block.InfoWindow
 * @pro-requires map-block.ProInfoWindow
 */
jQuery(function($) {
	
	var Parent;
	
	map-block.OLInfoWindow = function(mapObject)
	{
		var self = this;
		
		Parent.call(this, mapObject);
		
		this.element = $("<div class='ol-info-window-container ol-info-window-plain'></div>")[0];
			
		$(this.element).on("click", ".ol-info-window-close", function(event) {
			self.close();
		});
	}
	
	if(map-block.isProVersion())
		Parent = map-block.ProInfoWindow;
	else
		Parent = map-block.InfoWindow;
	
	map-block.OLInfoWindow.prototype = Object.create(Parent.prototype);
	map-block.OLInfoWindow.prototype.constructor = map-block.OLInfoWindow;
	
	/**
	 * Opens the info window
	 * TODO: This should take a mapObject, not an event
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	map-block.OLInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		var latLng = mapObject.getPosition();
		
		if(!map-block.InfoWindow.prototype.open.call(this, map, mapObject))
			return false;
		
		if(this.overlay)
			this.mapObject.map.olMap.removeOverlay(this.overlay);
			
		this.overlay = new ol.Overlay({
			element: this.element
		});
		
		this.overlay.setPosition(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		self.mapObject.map.olMap.addOverlay(this.overlay);
		
		$(this.element).show();
		
		this.dispatchEvent("infowindowopen");
	}
	
	map-block.OLInfoWindow.prototype.close = function(event)
	{
		// TODO: Why? This shouldn't have to be here. Removing the overlay should hide the element (it doesn't)
		$(this.element).hide();
		
		if(!this.overlay)
			return;
		
		map-block.InfoWindow.prototype.close.call(this);
		
		this.mapObject.map.olMap.removeOverlay(this.overlay);
		this.overlay = null;
	}
	
	map-block.OLInfoWindow.prototype.setContent = function(html)
	{
		$(this.element).html("<i class='fa fa-times ol-info-window-close' aria-hidden='true'></i>" + html);
	}
	
	map-block.OLInfoWindow.prototype.setOptions = function(options)
	{
		if(map-block.settings.developer_mode)
			console.log(options);
		
		if(options.maxWidth)
		{
			$(this.element).css({"max-width": options.maxWidth + "px"});
		}
	}
	
});