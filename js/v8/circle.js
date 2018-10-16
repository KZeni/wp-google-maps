/**
 * @namespace map-block
 * @module Circle
 * @requires map-block.MapObject
 */
jQuery(function($) {
	
	var Parent = map-block.MapObject;
	
	/**
	 * @class Circle
	 * @summary Represents a generic circle. <b>Please do not instantiate this object directly, use createInstance</b>
	 * @return {map-block.Circle}
	 */
	map-block.Circle = function(options, engineCircle)
	{
		var self = this;
		
		map-block.assertInstanceOf(this, "Circle");
		
		this.center = new map-block.LatLng();
		this.radius = 100;
		
		Parent.apply(this, arguments);
	}
	
	map-block.Circle.prototype = Object.create(Parent.prototype);
	map-block.Circle.prototype.constructor = map-block.Circle;
	
	/**
	 * @function createInstance
	 * @summary Creates an instance of a circle, <b>please always use this function rather than calling the constructor directly</b>
	 * @param {object} options Options for the object (optional)
	 */
	map-block.Circle.createInstance = function(options)
	{
		var constructor;
		
		if(map-block.settings.engine == "google-maps")
			constructor = map-block.GoogleCircle;
		else
			constructor = map-block.OLCircle;
		
		return new constructor(options);
	}
	
	/**
	 * @function getCenter
	 * @returns {map-block.LatLng}
	 */
	map-block.Circle.prototype.getCenter = function()
	{
		return this.center.clone();
	}
	
	/**
	 * @function setCenter
	 * @param {object|map-block.LatLng} latLng either a literal or as a map-block.LatLng
	 * @returns {void}
	 */
	map-block.Circle.prototype.setCenter = function(latLng)
	{
		this.center.lat = latLng.lat;
		this.center.lng = latLng.lng;
	}
	
	/**
	 * @function getRadius
	 * @summary Returns the circles radius in kilometers
	 * @returns {map-block.LatLng}
	 */
	map-block.Circle.prototype.getRadius = function()
	{
		return this.radius;
	}
	
	/**
	 * @function setRadius
	 * @param {number} The radius
	 * @returns {void}
	 */
	map-block.Circle.prototype.setRadius = function(radius)
	{
		this.radius = radius;
	}
	
	/**
	 * @function getMap
	 * @summary Returns the map that this circle is being displayed on
	 * @return {map-block.Map}
	 */
	map-block.Circle.prototype.getMap = function()
	{
		return this.map;
	}
	
	/**
	 * @function setMap
	 * @param {map-block.Map} The target map
	 * @summary Puts this circle on a map
	 * @return {void}
	 */
	map-block.Circle.prototype.setMap = function(map)
	{
		if(this.map)
			this.map.removeCircle(this);
		
		if(map)
			map.addCircle(this);
			
	}
	
});