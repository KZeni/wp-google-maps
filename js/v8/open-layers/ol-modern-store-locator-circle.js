/**
 * @namespace map-block
 * @module OLModernStoreLocatorCircle
 * @requires map-block.ModernStoreLocatorCircle
 */
jQuery(function($) {
	
	map-block.OLModernStoreLocatorCircle = function(map, settings)
	{
		map-block.ModernStoreLocatorCircle.call(this, map, settings);
	}
	
	map-block.OLModernStoreLocatorCircle.prototype = Object.create(map-block.ModernStoreLocatorCircle.prototype);
	map-block.OLModernStoreLocatorCircle.prototype.constructor = map-block.OLModernStoreLocatorCircle;
	
	map-block.OLModernStoreLocatorCircle.prototype.initCanvasLayer = function()
	{
		var self = this;
		var mapElement = $(this.map.element);
		var olViewportElement = mapElement.children(".ol-viewport");
		
		this.canvas = document.createElement("canvas");
		this.canvas.className = "map-block-ol-canvas-overlay";
		mapElement.append(this.canvas);
		
		this.renderFunction = function(event) {
			
			if(self.canvas.width != olViewportElement.width() || self.canvas.height != olViewportElement.height())
			{
				self.canvas.width = olViewportElement.width();
				self.canvas.height = olViewportElement.height();
				
				$(this.canvas).css({
					width: olViewportElement.width() + "px",
					height: olViewportElement.height() + "px"
				});
			}
			
			self.draw();
		};
		
		this.map.olMap.on("postrender", this.renderFunction);
	}

	map-block.OLModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		return this.canvas.getContext(type);
	}
	
	map-block.OLModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		return {
			width: this.canvas.width,
			height: this.canvas.height
		};
	}
	
	map-block.OLModernStoreLocatorCircle.prototype.getCenterPixels = function()
	{
		var center = this.map.latLngToPixels(this.settings.center);
		
		return center;
	}
		
	map-block.OLModernStoreLocatorCircle.prototype.getWorldOriginOffset = function()
	{
		return {
			x: 0,
			y: 0
		};
	}
	
	map-block.OLModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		var center = new map-block.LatLng(this.settings.center);
		var outer = new map-block.LatLng(center);
		
		outer.moveByDistance(km, 90);
		
		var centerPixels = this.map.latLngToPixels(center);
		var outerPixels = this.map.latLngToPixels(outer);
		
		return Math.abs(outerPixels.x - centerPixels.x);

		if(!window.testMarker){
			window.testMarker = map-block.Marker.createInstance({
				position: outer
			});
			map-block.maps[0].addMarker(window.testMarker);
		}
		
		return 100;
	}
	
	map-block.OLModernStoreLocatorCircle.prototype.getScale = function()
	{
		return 1;
	}
	
	map-block.OLModernStoreLocatorCircle.prototype.destroy = function()
	{
		$(this.canvas).remove();
		
		this.map.olMap.un("postrender", this.renderFunction);
		this.map = null;
		this.canvas = null;
	}
	
});