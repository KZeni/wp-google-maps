/**
 * @module map-block.RestAPI
 * @namespace map-block
 * @requires map-block
 * @summary Wrapped for the rest API
 */
jQuery(function($) {
	
	map-block.RestAPI = function()
	{
		map-block.RestAPI.URL = map-block.resturl;
	}
	
	map-block.RestAPI.createInstance = function() 
	{
		return new map-block.RestAPI();
	}
	
	map-block.RestAPI.prototype.call = function(route, params)
	{
		if(typeof route != "string" || !route.match(/^\//))
			throw new Error("Invalid route");
		
		if(map-block.RestAPI.URL.match(/\/$/))
			route = route.replace(/^\//, "");
		
		$.ajax(map-block.RestAPI.URL + route, params);
	}
	
});