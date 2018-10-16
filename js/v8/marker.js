/**
 * @namespace map-block
 * @module Marker
 * @requires map-block
 */
jQuery(function($) {
	/**
	 * Constructor
	 * @param json to load (optional)
	 */
	map-block.Marker = function(row)
	{
		var self = this;
		
		map-block.assertInstanceOf(this, "Marker");
		
		this.lat = "36.778261";
		this.lng = "-119.4179323999";
		this.address = "California";
		this.title = null;
		this.description = "";
		this.link = "";
		this.icon = "";
		this.approved = 1;
		this.pic = null;
		
		map-block.MapObject.apply(this, arguments);
		
		if(row && row.heatmap)
			return; // Don't listen for these events on heatmap markers.
		
		if(row)
			this.on("init", function(event) {
				if(row.position)
					this.setPosition(row.position);
				
				if(row.map)
					row.map.addMarker(this);
			});
		
		this.addEventListener("added", function(event) {
			self.onAdded(event);
		});
	}
	
	map-block.Marker.prototype = Object.create(map-block.MapObject.prototype);
	map-block.Marker.prototype.constructor = map-block.Marker;
	
	/**
	 * Gets the constructor. You can use this instead of hard coding the parent class when inheriting,
	 * which is helpful for making subclasses that work with Basic only, Pro, Google, OL or a 
	 * combination of the four.
	 * @return function
	 */
	map-block.Marker.getConstructor = function()
	{
		switch(map-block.settings.engine)
		{
			case "open-layers":
				if(map-block.isProVersion())
					return map-block.OLProMarker;
				return map-block.OLMarker;
				break;
				
			default:
				if(map-block.isProVersion())
					return map-block.GoogleProMarker;
				return map-block.GoogleMarker;
				break;
		}
	}
	
	map-block.Marker.createInstance = function(row)
	{
		var constructor = map-block.Marker.getConstructor();
		return new constructor(row);
	}
	
	map-block.Marker.ANIMATION_NONE			= "0";
	map-block.Marker.ANIMATION_BOUNCE			= "1";
	map-block.Marker.ANIMATION_DROP			= "2";
	
	map-block.Marker.prototype.onAdded = function(event)
	{
		var self = this;
		
		// this.infoWindow = map-block.InfoWindow.createInstance(this);
		
		this.addEventListener("click", function(event) {
			self.onClick(event);
		});
		
		this.addEventListener("mouseover", function(event) {
			self.onMouseOver(event);
		});
		
		this.addEventListener("select", function(event) {
			self.onSelect(event);
		});
		
		if(this.map.settings.marker == this.id)
			self.trigger("select");
	}
	
	/**
	 * This function will hide the last info the user interacted with
	 * @return void
	 */
	map-block.Marker.prototype.hidePreviousInteractedInfoWindow = function()
	{
		if(!this.map.lastInteractedMarker)
			return;
		
		this.map.lastInteractedMarker.infoWindow.close();
	}
	
	map-block.Marker.prototype.openInfoWindow = function()
	{
		//this.hidePreviousInteractedInfoWindow();
		//this.infoWindow.open(this.map, this);
		//this.map.lastInteractedMarker = this;
	}
	
	map-block.Marker.prototype.onClick = function(event)
	{
		
	}
	
	map-block.Marker.prototype.onSelect = function(event)
	{
		this.openInfoWindow();
	}
	
	map-block.Marker.prototype.onMouseOver = function(event)
	{
		if(this.map.settings.info_window_open_by == map-block.InfoWindow.OPEN_BY_HOVER)
			this.openInfoWindow();
	}
	
	map-block.Marker.prototype.getIcon = function()
	{
		function stripProtocol(url)
		{
			if(typeof url != "string")
				return url;
			
			return url.replace(/^http(s?):/, "");
		}
		
		return stripProtocol(map-block.settings.default_marker_icon);
	}
	
	/**
	 * Gets the position of the marker
	 * @return object
	 */
	map-block.Marker.prototype.getPosition = function()
	{
		return {
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		};
	}
	
	/**
	 * Sets the position of the marker
	 * @return void
	 */
	map-block.Marker.prototype.setPosition = function(latLng)
	{
		if(latLng instanceof map-block.LatLng)
		{
			this.lat = latLng.lat;
			this.lng = latLng.lng;
		}
		else
		{
			this.lat = parseFloat(latLng.lat);
			this.lng = parseFloat(latLng.lng);
		}
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	map-block.Marker.prototype.getAnimation = function(animation)
	{
		return this.settings.animation;
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	map-block.Marker.prototype.setAnimation = function(animation)
	{
		this.settings.animation = animation;
	}
	
	/**
	 * Get the marker visibility
	 * @return void
	 */
	map-block.Marker.prototype.getVisible = function(visible)
	{
		
	}
	
	/**
	 * Set the marker visibility. This is used by the store locator etc. and is not a setting
	 * @return void
	 */
	map-block.Marker.prototype.setVisible = function(visible)
	{
		if(!visible && this.infoWindow)
			this.infoWindow.close();
	}
	
	map-block.Marker.prototype.setMap = function(map)
	{
		if(!map)
		{
			if(this.map)
				this.map.removeMarker(this);
			
			return;
		}
		
		map.addMarker(this);
	}
	
	map-block.Marker.prototype.getDraggable = function()
	{
		
	}
	
	map-block.Marker.prototype.setDraggable = function(draggable)
	{
		
	}
	
	map-block.Marker.prototype.setOptions = function()
	{
		
	}
	
	map-block.Marker.prototype.panIntoView = function()
	{
		if(!this.map)
			throw new Error("Marker hasn't been added to a map");
		
		this.map.setCenter(this.getPosition());
	}
	
	/**
	 * Returns the marker as a JSON object
	 * @return object
	 */
	map-block.Marker.prototype.toJSON = function()
	{
		var result = map-block.MapObject.prototype.toJSON.call(this);
		var position = this.getPosition();
		
		$.extend(result, {
			lat: position.lat,
			lng: position.lng,
			address: this.address,
			title: this.title,
			description: this.description,
			link: this.link,
			icon: this.icon,
			pic: this.pic,
			approved: this.approved
		});
		
		return result;
	}
	
	
});