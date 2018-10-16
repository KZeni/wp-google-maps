/**
 * @namespace map-block
 * @module GoogleCircle
 * @requires map-block.Circle
 */
jQuery(function($) {
	
	map-block.GoogleCircle = function(options, googleCircle)
	{
		var self = this;
		
		map-block.Circle.call(this, options, googleCircle);
		
		if(googleCircle)
		{
			this.googleCircle = googleCircle;
		}
		else
		{
			this.googleCircle = new google.maps.Circle();
			this.googleCircle.map-blockCircle = this;
		}
		
		google.maps.event.addListener(this.googleCircle, "click", function() {
			self.dispatchEvent({type: "click"});
		});
		
		if(options)
		{
			var googleOptions = {};
			
			googleOptions = $.extend({}, options);
			delete googleOptions.map;
			delete googleOptions.center;
			
			if(options.center)
				googleOptions.center = new google.maps.LatLng({
					lat: options.center.lat,
					lng: options.center.lng
				});
			
			this.googleCircle.setOptions(googleOptions);
			
			if(options.map)
				options.map.addCircle(this);
		}
	}
	
	map-block.GoogleCircle.prototype = Object.create(map-block.Circle.prototype);
	map-block.GoogleCircle.prototype.constructor = map-block.GoogleCircle;
	
});