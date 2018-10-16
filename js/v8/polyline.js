/**
 * @namespace map-block
 * @module Polyline
 * @requires map-block.MapObject
 */
jQuery(function($) {
	map-block.Polyline = function(row, googlePolyline)
	{
		var self = this;
		
		map-block.assertInstanceOf(this, "Polyline");
		
		this.title = null;
		
		map-block.MapObject.apply(this, arguments);
	}
	
	map-block.Polyline.prototype = Object.create(map-block.MapObject.prototype);
	map-block.Polyline.prototype.constructor = map-block.Polyline;
	
	map-block.Polyline.getConstructor = function()
	{
		switch(map-block.settings.engine)
		{
			case "open-layers":
				return map-block.OLPolyline;
				break;
			
			default:
				return map-block.GooglePolyline;
				break;
		}
	}
	
	map-block.Polyline.createInstance = function(row, engineObject)
	{
		var constructor = map-block.Polyline.getConstructor();
		return new constructor(row, engineObject);
	}
	
	map-block.Polyline.prototype.getPoints = function()
	{
		return this.toJSON().points;
	}
	
	map-block.Polyline.prototype.toJSON = function()
	{
		var result = map-block.MapObject.prototype.toJSON.call(this);
		
		result.title = this.title;
		
		return result;
	}
	
	
});