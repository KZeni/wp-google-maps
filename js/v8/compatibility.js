/**
 * @namespace map-block
 * @module Compatibility
 * @requires map-block
 */
jQuery(function($) {
	
	map-block.Compatibility = function()
	{
		this.preventDocumentWriteGoogleMapsAPI();
	}
	
	map-block.Compatibility.prototype.preventDocumentWriteGoogleMapsAPI = function()
	{
		var old = document.write;
		
		document.write = function(content)
		{
			if(content.match && content.match(/maps\.google/))
				return;
			
			old.call(document, content);
		}
	}
	
	map-block.compatiblityModule = new map-block.Compatibility();
	
});