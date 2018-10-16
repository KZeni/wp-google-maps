/**
 * @namespace map-block
 * @module GoogleModernStoreLocator
 * @requires map-block.ModernStoreLocator
 */
jQuery(function($) {
	
	map-block.GoogleModernStoreLocator = function(map_id)
	{
		map-block.ModernStoreLocator.call(this, map_id);
		
		var googleMap;
		
		if(map-block.isProVersion())
			googleMap = MYMAP[map_id].map.googleMap;
		else
			googleMap = MYMAP.map.googleMap;
		
		googleMap.controls[google.maps.ControlPosition.TOP_CENTER].push(this.element);
	}
	
	map-block.GoogleModernStoreLocator.prototype = Object.create(map-block.ModernStoreLocator.prototype);
	map-block.GoogleModernStoreLocator.prototype.constructor = map-block.GoogleModernStoreLocator;
	
});