/**
 * @namespace map-block
 * @module GoogleUICompatibility
 * @requires map-block
 */ 
jQuery(function($) {
	
	map-block.GoogleUICompatibility = function()
	{
		var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
				   navigator.userAgent &&
				   navigator.userAgent.indexOf('CriOS') == -1 &&
				   navigator.userAgent.indexOf('FxiOS') == -1;
		
		if(!isSafari)
		{
			var style = $("<style id='map-block-google-ui-compatiblity-fix'/>");
			style.html(".map-block_map img:not(button img) { padding:0 !important; }");
			$(document.head).append(style);
		}
	}
	
	map-block.googleUICompatibility = new map-block.GoogleUICompatibility();
	
});