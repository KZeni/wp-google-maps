/**
 * @namespace WPGMZA
 * @module MarkerFilter
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.MarkerFilter = function(map)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this.map = map;
	}
	
	WPGMZA.MarkerFilter.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.MarkerFilter.prototype.constructor = WPGMZA.MarkerFilter;
	
	WPGMZA.MarkerFilter.createInstance = function(map)
	{
		return new WPGMZA.MarkerFilter(map);
	}
	
	WPGMZA.MarkerFilter.prototype.getFilteringParameters = function()
	{
		var storeLocatorParameters = this.map.storeLocator.getFilteringParameters();
		
		return $.extend({map_id: this.map.id},
		
			this.map.storeLocator.getFilteringParameters()
		
		);
	}
	
	WPGMZA.MarkerFilter.prototype.update = function()
	{
		// NB: This function takes no action. The client can hide and show markers based on radius without putting load on the server. This function is only used by the ProMarkerFilter module
	}
	
});