/**
 * @namespace map-block
 * @module OLModernStoreLocator
 * @requires map-block.ModernStoreLocator
 */
jQuery(function($) {
	
	map-block.OLModernStoreLocator = function(map_id)
	{
		var element;
		
		map-block.ModernStoreLocator.call(this, map_id);
		
		if(map-block.isProVersion())
			element = $(".map-block_map[data-map-id='" + map_id + "']");
		else
			element = $("#map-block_map");
		
		element.append(this.element);
	}
	
	map-block.OLModernStoreLocator.prototype = Object.create(map-block.ModernStoreLocator);
	map-block.OLModernStoreLocator.prototype.constructor = map-block.OLModernStoreLocator;
	
});