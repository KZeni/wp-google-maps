/**
 * @namespace map-block
 * @module Polygon
 * @requires map-block.MapObject
 */
jQuery(function($) {
	map-block.Polygon = function(row, enginePolygon)
	{
		var self = this;
		
		map-block.assertInstanceOf(this, "Polygon");
		
		this.paths = null;
		this.title = null;
		this.name = null;
		this.link = null;
		
		map-block.MapObject.apply(this, arguments);
	}
	
	map-block.Polygon.prototype = Object.create(map-block.MapObject.prototype);
	map-block.Polygon.prototype.constructor = map-block.Polygon;
	
	map-block.Polygon.getConstructor = function()
	{
		switch(map-block.settings.engine)
		{
			case "open-layers":
				if(map-block.isProVersion())
					return map-block.OLProPolygon;
				return map-block.OLPolygon;
				break;
			
			default:
				if(map-block.isProVersion())
					return map-block.GoogleProPolygon;
				return map-block.GooglePolygon;
				break;
		}
	}
	
	map-block.Polygon.createInstance = function(row, engineObject)
	{
		var constructor = map-block.Polygon.getConstructor();
		return new constructor(row, engineObject);
	}
	
	map-block.Polygon.prototype.toJSON = function()
	{
		var result = map-block.MapObject.prototype.toJSON.call(this);
		
		$.extend(result, {
			name:		this.name,
			title:		this.title,
			link:		this.link,
		});
	
		return result;
	}
	
});