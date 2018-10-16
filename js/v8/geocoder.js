/**
 * @namespace map-block
 * @module Geocoder
 * @requires map-block
 */
jQuery(function($) {
	
	map-block.Geocoder = function()
	{
		map-block.assertInstanceOf(this, "Geocoder");
	}
	
	map-block.Geocoder.SUCCESS			= "success";
	map-block.Geocoder.ZERO_RESULTS	= "zero-results";
	map-block.Geocoder.FAIL			= "fail";
	
	map-block.Geocoder.getConstructor = function()
	{
		switch(map-block.settings.engine)
		{
			case "open-layers":
				return map-block.OLGeocoder;
				break;
				
			default:
				return map-block.GoogleGeocoder;
				break;
		}
	}
	
	map-block.Geocoder.createInstance = function()
	{
		var constructor = map-block.Geocoder.getConstructor();
		return new constructor();
	}
	
	map-block.Geocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		if(map-block.isLatLngString(options.address))
		{
			var parts = options.address.split(/,\s*/);
			var latLng = new map-block.LatLng({
				lat: parseFloat(parts[0]),
				lng: parseFloat(parts[1])
			});
			callback([latLng], map-block.Geocoder.SUCCESS);
		}
	}
	
	map-block.Geocoder.prototype.getAddressFromLatLng = function(options, callback)
	{
		var latLng = new map-block.LatLng(options.latLng);
		callback([latLng.toString()], map-block.Geocoder.SUCCESS);
	}
	
	map-block.Geocoder.prototype.geocode = function(options, callback)
	{
		if("address" in options)
			return this.getLatLngFromAddress(options, callback);
		else if("latLng" in options)
			return this.getAddressFromLatLng(options, callback);
		
		throw new Error("You must supply either a latLng or address");
	}
	
});