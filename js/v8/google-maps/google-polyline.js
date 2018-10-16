/**
 * @namespace map-block
 * @module GooglePolyline
 * @requires map-block.Polyline
 */
jQuery(function($) {
	
	map-block.GooglePolyline = function(row, googlePolyline)
	{
		var self = this;
		
		map-block.Polyline.call(this, row, googlePolyline);
		
		if(googlePolyline)
		{
			this.googlePolyline = googlePolyline;
		}
		else
		{
			this.googlePolyline = new google.maps.Polyline(this.settings);			
			this.googlePolyline.map-blockPolyline = this;
			
			if(row && row.points)
			{
				var path = this.parseGeometry(row.points);
				this.setPoints(path);
			}
		}
		
		google.maps.event.addListener(this.googlePolyline, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	map-block.GooglePolyline.prototype = Object.create(map-block.Polyline.prototype);
	map-block.GooglePolyline.prototype.constructor = map-block.GooglePolyline;
	
	map-block.GooglePolyline.prototype.setEditable = function(value)
	{
		this.googlePolyline.setOptions({editable: value});
	}
	
	map-block.GooglePolyline.prototype.setPoints = function(points)
	{
		this.googlePolyline.setOptions({path: points});
	}
	
	map-block.GooglePolyline.prototype.toJSON = function()
	{
		var result = map-block.Polyline.prototype.toJSON.call(this);
		
		result.points = [];
		
		var path = this.googlePolyline.getPath();
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