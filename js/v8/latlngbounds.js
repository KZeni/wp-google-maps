/**
 * @namespace map-block
 * @module LatLngBounds
 * @requires map-block
 */
jQuery(function($) {
	
	map-block.LatLngBounds = function(southWest, northEast)
	{
		
	}
	
	map-block.LatLngBounds.prototype.isInInitialState = function()
	{
		return (this.north == undefined && this.south == undefined && this.west == undefined && this.east == undefined);
	}
	
	map-block.LatLngBounds.prototype.extend = function(latLng)
	{
		if(this.isInInitialState())
		{
			this.north = this.south = this.west = this.east = new map-block.LatLng(latLng);
			return;
		}
		
		if(!(latLng instanceof map-block.LatLng))
			latLng = new map-block.LatLng(latLng);
		
		if(latLng.lat < this.north)
			this.north = latLng.lat;
		
		if(latLng.lat > this.south)
			this.south = latLng.lat;
		
		if(latLng.lng < this.west)
			this.west = latLng.lng;
		
		if(latLng.lng > this.east)
			this.east = latLng.lng;
	}
	
});
