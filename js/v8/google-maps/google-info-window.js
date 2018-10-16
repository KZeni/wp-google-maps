/**
 * @namespace map-block
 * @module GoogleInfoWindow
 * @requires map-block.InfoWindow
 * @pro-requires map-block.ProInfoWindow
 */
jQuery(function($) {
	
	var Parent;
	
	map-block.GoogleInfoWindow = function(mapObject)
	{
		Parent.call(this, mapObject);
		
		this.setMapObject(mapObject);
	}
	
	if(map-block.isProVersion())
		Parent = map-block.ProInfoWindow;
	else
		Parent = map-block.InfoWindow;
	
	map-block.GoogleInfoWindow.prototype = Object.create(Parent.prototype);
	map-block.GoogleInfoWindow.prototype.constructor = map-block.GoogleInfoWindow;
	
	map-block.GoogleInfoWindow.prototype.setMapObject = function(mapObject)
	{
		if(mapObject instanceof map-block.Marker)
			this.googleObject = mapObject.googleMarker;
		else if(mapObject instanceof map-block.Polygon)
			this.googleObject = mapObject.googlePolygon;
		else if(mapObject instanceof map-block.Polyline)
			this.googleObject = mapObject.googlePolyline;
	}
	
	map-block.GoogleInfoWindow.prototype.createGoogleInfoWindow = function()
	{
		if(this.googleInfoWindow)
			return;
		
		this.googleInfoWindow = new google.maps.InfoWindow();
	}
	
	/**
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	map-block.GoogleInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		if(!Parent.prototype.open.call(this, map, mapObject))
			return false;
		
		this.createGoogleInfoWindow();
		this.setMapObject(mapObject);
		
		this.googleInfoWindow.open(
			this.mapObject.map.googleMap,
			this.googleObject
		);
		
		if(this.content)
			this.googleInfoWindow.setContent(this.content);
		
		//this.
		
		/*this.getContent(function(html) {
			
			// Wrap HTML with unique ID
			var guid = map-block.guid();
			var html = "<div id='" + guid + "'>" + html + "</div>";
			var div, intervalID;
			
			self.googleInfoWindow.setContent(html);
			self.googleInfoWindow.open(
				self.mapObject.map.googleMap,
				self.googleObject
			);
			
			intervalID = setInterval(function(event) {
				
				div = $("#" + guid);
				
				if(div.find(".gm-style-iw").length)
				{
					div[0].map-blockMapObject = self.mapObject;
					
					self.dispatchEvent("infowindowopen");
					div.trigger("infowindowopen");
					clearInterval(intervalID);
				}
				
			}, 50);
			
		});*/
		
		return true;
	}
	
	map-block.GoogleInfoWindow.prototype.close = function()
	{
		if(!this.googleInfoWindow)
			return;
		
		map-block.InfoWindow.prototype.close.call(this);
		
		this.googleInfoWindow.close();
	}
	
	map-block.GoogleInfoWindow.prototype.setContent = function(html)
	{
		Parent.prototype.setContent.call(this, html);
		
		this.content = html;
		
		this.createGoogleInfoWindow();
		
		this.googleInfoWindow.setContent(html);
	}
	
	map-block.GoogleInfoWindow.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		this.createGoogleInfoWindow();
		
		this.googleInfoWindow.setOptions(options);
	}
	
});