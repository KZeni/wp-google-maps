/**
 * @namespace map-block
 * @module GoogleGeocoder
 * @requires map-block.Geocoder
 */
jQuery(function($) {
	
	map-block.GoogleGeocoder = function()
	{
		
	}
	
	map-block.GoogleGeocoder.prototype = Object.create(map-block.Geocoder.prototype);
	map-block.GoogleGeocoder.prototype.constructor = map-block.GoogleGeocoder;
	
	map-block.GoogleGeocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		if(!options || !options.address)
			throw new Error("No address specified");
		
		if(map-block.isLatLngString(options.address))
			return map-block.Geocoder.prototype.getLatLngFromAddress.call(this, options, callback);
		
		if(options.country)
			options.componentRestrictions = {
				country: options.country
			};
		
		var geocoder = new google.maps.Geocoder();
		
		geocoder.geocode(options, function(results, status) {
			if(status == google.maps.GeocoderStatus.OK)
			{
				var location = results[0].geometry.location;
				var latLng = {
					lat: location.lat(),
					lng: location.lng()
				};
				
				var results = [
					{
						geometry: {
							location: latLng
						},
						latLng: latLng,
						lat: latLng.lat,
						lng: latLng.lng
					}
				];
				
				callback(results, map-block.Geocoder.SUCCESS);
			}
			else
			{
				var nativeStatus = map-block.Geocoder.FAIL;
				
				if(status == google.maps.GeocoderStatus.ZERO_RESULTS)
					nativeStatus = map-block.Geocoder.ZERO_RESULTS;
				
				callback(null, nativeStatus);
			}
		});
	}
	
	map-block.GoogleGeocoder.prototype.getAddressFromLatLng = function(options, callback)
	{
		if(!options || !options.latLng)
			throw new Error("No latLng specified");
		
		var latLng = new map-block.LatLng(options.latLng);
		var geocoder = new google.maps.Geocoder();
		
		var options = $.extend(options, {
			location: {
				lat: latLng.lat,
				lng: latLng.lng
			}
		});
		delete options.latLng;
		
		geocoder.geocode(options, function(results, status) {
			
			if(status !== "OK")
				callback(null, map-block.Geocoder.FAIL);
			
			if(!results || !results.length)
				callback([], map-block.Geocoder.NO_RESULTS);
			
			callback([results[0].formatted_address], map-block.Geocoder.SUCCESS);
			
		});
	}
	
});