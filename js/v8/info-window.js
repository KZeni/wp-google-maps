/**
 * @namespace map-block
 * @module InfoWindow
 * @requires map-block.EventDispatcher
 */
jQuery(function($) {
	
	map-block.InfoWindow = function(mapObject)
	{
		var self = this;
		
		map-block.EventDispatcher.call(this);
		
		map-block.assertInstanceOf(this, "InfoWindow");
		
		if(!mapObject)
			return;
		
		this.mapObject = mapObject;
		
		if(mapObject.map)
		{
			// This has to be slightly delayed so the map initialization won't overwrite the infowindow element
			setTimeout(function() {
				self.onMapObjectAdded(event);
			}, 100);
		}
		else
			mapObject.addEventListener("added", function(event) { 
				self.onMapObjectAdded(event);
			});		
	}
	
	map-block.InfoWindow.prototype = Object.create(map-block.EventDispatcher.prototype);
	map-block.InfoWindow.prototype.constructor = map-block.InfoWindow;
	
	map-block.InfoWindow.OPEN_BY_CLICK = 1;
	map-block.InfoWindow.OPEN_BY_HOVER = 2;
	
	map-block.InfoWindow.getConstructor = function()
	{
		switch(map-block.settings.engine)
		{
			case "open-layers":
				if(map-block.isProVersion())
					return map-block.OLProInfoWindow;
				return map-block.OLInfoWindow;
				break;
			
			default:
				if(map-block.isProVersion())
					return map-block.GoogleProInfoWindow;
				return map-block.GoogleInfoWindow;
				break;
		}
	}
	
	map-block.InfoWindow.createInstance = function(mapObject)
	{
		var constructor = this.getConstructor();
		return new constructor(mapObject);
	}
	
	/**
	 * Gets the content for the info window and passes it to the specified callback - this allows for delayed loading (eg AJAX) as well as instant content
	 * @return void
	 */
	map-block.InfoWindow.prototype.getContent = function(callback)
	{
		var html = "";
		
		if(this.mapObject instanceof map-block.Marker)
			html = this.mapObject.address;
		
		callback(html);
	}
	
	/**
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	map-block.InfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		this.mapObject = mapObject;
		
		if(map-block.settings.disable_infowindows)
			return false;
		
		return true;
	}
	
	map-block.InfoWindow.prototype.close = function()
	{
		
	}
	
	map-block.InfoWindow.prototype.setContent = function(options)
	{
		
	}
	
	map-block.InfoWindow.prototype.setOptions = function(options)
	{
		
	}
	
	/**
	 * Event listener for when the map object is added. This will cause the info window to open if the map object has infoopen set
	 * @return void
	 */
	map-block.InfoWindow.prototype.onMapObjectAdded = function()
	{
		if(this.mapObject.settings.infoopen == 1)
			this.open();
	}
	
});