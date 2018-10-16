/**
 * @namespace map-block
 * @module GoogleModernStoreLocatorCircle
 * @requires map-block.ModernStoreLocatorCircle
 */
jQuery(function($) {
	
	map-block.GoogleModernStoreLocatorCircle = function(map, settings)
	{
		var self = this;
		
		map-block.ModernStoreLocatorCircle.call(this, map, settings);
		
		this.intervalID = setInterval(function() {
			
			var mapSize = {
				width: $(self.mapElement).width(),
				height: $(self.mapElement).height()
			};
			
			if(mapSize.width == self.mapSize.width && mapSize.height == self.mapSize.height)
				return;
			
			self.canvasLayer.resize_();
			self.canvasLayer.draw();
			
			self.mapSize = mapSize;
			
		}, 1000);
		
		$(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
			
			self.canvasLayer.resize_();
			self.canvasLayer.draw();
			
		});
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype = Object.create(map-block.ModernStoreLocatorCircle.prototype);
	map-block.GoogleModernStoreLocatorCircle.prototype.constructor = map-block.GoogleModernStoreLocatorCircle;
	
	map-block.GoogleModernStoreLocatorCircle.prototype.initCanvasLayer = function()
	{
		var self = this;
		
		if(this.canvasLayer)
		{
			this.canvasLayer.setMap(null);
			this.canvasLayer.setAnimate(false);
		}
		
		this.canvasLayer = new CanvasLayer({
			map: this.map.googleMap,
			resizeHandler: function(event) {
				self.onResize(event);
			},
			updateHandler: function(event) {
				self.onUpdate(event);
			},
			animate: true,
			resolutionScale: this.getResolutionScale()
        });
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.setOptions = function(options)
	{
		map-block.ModernStoreLocatorCircle.prototype.setOptions.call(this, options);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.setPosition = function(position)
	{
		map-block.ModernStoreLocatorCircle.prototype.setPosition.call(this, position);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.setRadius = function(radius)
	{
		map-block.ModernStoreLocatorCircle.prototype.setRadius.call(this, radius);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		var multiplierAtEquator = 0.006395;
		var spherical = google.maps.geometry.spherical;
		
		var center = this.settings.center;
		var equator = new map-block.LatLng({
			lat: 0.0,
			lng: 0.0
		});
		var latitude = new map-block.LatLng({
			lat: center.lat,
			lng: 0.0
		});
		
		var offsetAtEquator = spherical.computeOffset(equator.toGoogleLatLng(), km * 1000, 90);
		var offsetAtLatitude = spherical.computeOffset(latitude.toGoogleLatLng(), km * 1000, 90);
		
		var factor = offsetAtLatitude.lng() / offsetAtEquator.lng();
		var result = km * multiplierAtEquator * factor;
		
		if(isNaN(result))
			throw new Error("here");
		
		return result;
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		return {
			width: this.canvasLayer.canvas.width,
			height: this.canvasLayer.canvas.height
		};
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.getWorldOriginOffset = function()
	{
		var projection = this.map.googleMap.getProjection();
		var position = projection.fromLatLngToPoint(this.canvasLayer.getTopLeft());
		
		return {
			x: -position.x,
			y: -position.y
		};
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.getCenterPixels = function()
	{
		var center = new map-block.LatLng(this.settings.center);
		var projection = this.map.googleMap.getProjection();
		return projection.fromLatLngToPoint(center.toGoogleLatLng());
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		return this.canvasLayer.canvas.getContext("2d");
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.getScale = function()
	{
		return Math.pow(2, this.map.getZoom()) * this.getResolutionScale();
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.setVisible = function(visible)
	{
		map-block.ModernStoreLocatorCircle.prototype.setVisible.call(this, visible);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.destroy = function()
	{
		this.canvasLayer.setMap(null);
		this.canvasLayer = null;
		
		clearInterval(this.intervalID);
	}
	
});