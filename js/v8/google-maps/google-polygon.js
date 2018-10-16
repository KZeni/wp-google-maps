/**
 * @namespace map-block
 * @module GooglePolygon
 * @requires map-block.Polygon
 * @pro-requires map-block.ProPolygon
 */
jQuery(function($) {
	
	var Parent;
	
	map-block.GooglePolygon = function(row, googlePolygon)
	{
		var self = this;
		
		Parent.call(this, row, googlePolygon);
		
		if(googlePolygon)
		{
			this.googlePolygon = googlePolygon;
		}
		else
		{
			this.googlePolygon = new google.maps.Polygon(this.settings);
			
			if(row && row.points)
			{
				var paths = this.parseGeometry(row.points);
				this.googlePolygon.setOptions({paths: paths});
			}
		}
		
		this.googlePolygon.map-blockPolygon = this;
			
		google.maps.event.addListener(this.googlePolygon, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	if(map-block.isProVersion())
		Parent = map-block.ProPolygon;
	else
		Parent = map-block.Polygon;
		
	map-block.GooglePolygon.prototype = Object.create(Parent.prototype);
	map-block.GooglePolygon.prototype.constructor = map-block.GooglePolygon;
	
	/**
	 * Returns true if the polygon is editable
	 * @return void
	 */
	map-block.GooglePolygon.prototype.getEditable = function()
	{
		return this.googlePolygon.getOptions().editable;
	}
	
	/**
	 * Sets the editable state of the polygon
	 * @return void
	 */
	map-block.GooglePolygon.prototype.setEditable = function(value)
	{
		this.googlePolygon.setOptions({editable: value});
	}
	
	/**
	 * Returns the polygon represented by a JSON object
	 * @return object
	 */
	map-block.GooglePolygon.prototype.toJSON = function()
	{
		var result = map-block.Polygon.prototype.toJSON.call(this);
		
		result.points = [];
		
		// TODO: Support holes using multiple paths
		var path = this.googlePolygon.getPath();
		for(var i = 0; i < path.getLength(); i++)
		{
			var latLng = path.getAt(i);
			result.points.push({
				lat: latLng.lat(),
				lng: latLng.lng()
			});
		}
		
		return result;
	}
	
});