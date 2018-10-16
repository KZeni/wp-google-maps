
// js/v8/core.js
/**
 * @module map-block
 * @summary This is the core Javascript module. Some code exists in ../core.js, the functionality there will slowly be handed over to this module.
 */
jQuery(function($) {
	var core = {
		maps: [],
		events: null,
		settings: null,
		
		loadingHTML: '<div class="map-block-preloader"><div class="map-block-loader">...</div></div>',
		
		/**
		 * Override this method to add a scroll offset when using animated scroll
		 * @return number
		 */
		getScrollAnimationOffset: function() {
			return (map-block.settings.scroll_animation_offset || 0);
		},
		
		/**
		 * Animated scroll, accounts for animation settings and fixed header height
		 * @return void
		 */
		animateScroll: function(element, milliseconds) {
			
			var offset = map-block.getScrollAnimationOffset();
			
			if(!milliseconds)
			{
				if(map-block.settings.scroll_animation_milliseconds)
					milliseconds = map-block.settings.scroll_animation_milliseconds;
				else
					milliseconds = 500;
			}
			
			$("html, body").animate({
				scrollTop: $(element).offset().top - offset
			}, milliseconds);
			
		},
		
		/**
		 * @function guid
		 * @summary Utility function returns a GUID
		 * @static
		 * @return {string} The GUID
		 */
		guid: function() { // Public Domain/MIT
		  var d = new Date().getTime();
			if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
				d += performance.now(); //use high-precision timer if available
			}
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = (d + Math.random() * 16) % 16 | 0;
				d = Math.floor(d / 16);
				return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
			});
		},
		
		/**
		 * @function hexOpacityToRGBA
		 * @summary Takes a hex string and opacity value and converts it to Openlayers RGBA format
		 * @param {string} colour The hex color string
		 * @param {number} opacity The opacity from 0.0 - 1.0
		 * @static
		 * @return {array} RGBA where color components are 0 - 255 and opacity is 0.0 - 1.0
		 */
		hexOpacityToRGBA: function(colour, opacity)
		{
			hex = parseInt(colour.replace(/^#/, ""), 16);
			return [
				(hex & 0xFF0000) >> 16,
				(hex & 0xFF00) >> 8,
				hex & 0xFF,
				parseFloat(opacity)
			];
		},
		
		latLngRegexp: /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/,
		
		/**
		 * @function isLatLngString
		 * @summary Utility function returns true is string is a latitude and longitude
		 * @param str {string} The string to attempt to parse as coordinates
		 * @static
		 * @return {array} the matched latitude and longitude or null if no match
		 */
		isLatLngString: function(str)
		{
			if(typeof str != "string")
				return null;
			
			// Remove outer brackets
			if(str.match(/^\(.+\)$/))
				str = str.replace(/^\(|\)$/, "");
			
			var m = str.match(map-block.latLngRegexp);
			
			if(!m)
				return null;
			
			return {
				lat: parseFloat(m[1]),
				lng: parseFloat(m[3])
			};
		},
		
		/**
		 * @function stringToLatLng
		 * @summary Utility function returns a latLng literal given a valid latLng string
		 * @param str {string} The string to attempt to parse as coordinates
		 * @static
		 * @return {object} LatLng literal
		 */
		stringToLatLng: function(str)
		{
			var result = map-block.isLatLngString(str);
			
			if(!result)
				throw new Error("Not a valid latLng");
			
			return result;
		},
		
		/**
		 * @function stringToLatLng
		 * @summary Utility function returns a latLng literal given a valid latLng string
		 * @param str {string} The string to attempt to parse as coordinates
		 * @static
		 * @return {object} LatLng literal
		 */
		isHexColorString: function(str)
		{
			if(typeof str != "string")
				return false;
			
			return (str.match(/#[0-9A-F]{6}/i) ? true : false);
		},
		
		/**
		 * @function getImageDimensions
		 * @summary Utility function to get the dimensions of an image, caches results for best performance
		 * @param src {string} Image source URL
		 * @param callback {function} Callback to recieve image dimensions
		 * @static
		 * @return {void}
		 */
		imageDimensionsCache: {},
		getImageDimensions: function(src, callback)
		{
			if(map-block.imageDimensionsCache[src])
			{
				callback(map-block.imageDimensionsCache[src]);
				return;
			}
			
			var img = document.createElement("img");
			img.onload = function(event) {
				var result = {
					width: image.width,
					height: image.height
				};
				map-block.imageDimensionsCache[src] = result;
				callback(result);
			};
			img.src = src;
		},
		
		/**
		 * @function isDeveloperMode
		 * @summary Returns true if developer mode is set
		 * @static 
		 * @return {boolean} True if developer mode is on
		 */
		isDeveloperMode: function()
		{
			return this.developer_mode || (window.Cookies && window.Cookies.get("map-block-developer-mode"));
		},
		
		/**
		 * @function isProVersion
		 * @summary Returns true if the Pro add-on is active
		 * @static
		 * @return {boolean} True if the Pro add-on is active
		 */
		isProVersion: function()
		{
			return (this._isProVersion == "1");
		},
		
		/**
		 * @function openMediaDialog
		 * @summary Opens the WP media dialog and returns the result to a callback
		 * @param {function} callback Callback to recieve the attachment ID as the first parameter and URL as the second
		 * @static
		 * @return {void}
		 */
		openMediaDialog: function(callback) {
			// Media upload
			var file_frame;
			
			// If the media frame already exists, reopen it.
			if ( file_frame ) {
				// Set the post ID to what we want
				file_frame.uploader.uploader.param( 'post_id', set_to_post_id );
				// Open frame
				file_frame.open();
				return;
			}
			
			// Create the media frame.
			file_frame = wp.media.frames.file_frame = wp.media({
				title: 'Select a image to upload',
				button: {
					text: 'Use this image',
				},
				multiple: false	// Set to true to allow multiple files to be selected
			});
			
			// When an image is selected, run a callback.
			file_frame.on( 'select', function() {
				// We set multiple to false so only get one image from the uploader
				attachment = file_frame.state().get('selection').first().toJSON();
				
				callback(attachment.id, attachment.url);
			});
			
			// Finally, open the modal
			file_frame.open();
		},
		
		/**
		 * @function getCurrentPosition
		 * @summary This function will get the users position, it first attempts to get
		 * high accuracy position (mobile with GPS sensors etc.), if that fails
		 * (desktops will time out) then it tries again without high accuracy
		 * enabled
		 * @static
		 * @return {object} The users position as a LatLng literal
		 */
		getCurrentPosition: function(callback)
		{
			if(!navigator.geolocation)
			{
				console.warn("No geolocation available on this device");
				return;
			}
			
			var options = {
				enableHighAccuracy: true
			};
			
			navigator.geolocation.getCurrentPosition(function(position) {
				if(callback)
					callback(position);
				
				map-block.events.trigger("userlocationfound");
			},
			function(error) {
				
				options.enableHighAccuracy = false;
				
				navigator.geolocation.getCurrentPosition(function(position) {
					if(callback)
						callback(position);
					
					map-block.events.trigger("userlocationfound");
				},
				function(error) {
					console.warn(error.code, error.message);
				},
				options);
				
			},
			options);
		},
		
		/**
		 * @function runCatchableTask
		 * @summary Runs a catchable task and displays a friendly error if the function throws an error
		 * @param {function} callback The function to run
		 * @param {HTMLElement} friendlyErrorContainer The container element to hold the error
		 * @static
		 * @return {void}
		 */
		runCatchableTask: function(callback, friendlyErrorContainer) {
			
			if(map-block.isDeveloperMode())
				callback();
			else
				try{
					callback();
				}catch(e) {
					var friendlyError = new map-block.FriendlyError(e);
					$(friendlyErrorContainer).html("");
					$(friendlyErrorContainer).append(friendlyError.element);
					$(friendlyErrorContainer).show();
				}
		},
		
		/**
		 * @function assertInstanceOf
		 * @summary
		 * This function is for checking inheritence has been setup correctly.
		 * For objects that have engine and Pro specific classes, it will automatically
		 * add the engine and pro prefix to the supplied string and if such an object
		 * exists it will test against that name rather than the un-prefix argument
		 * supplied.
		 *
		 * For example, if we are running the Pro addon with Google maps as the engine,
		 * if you supply Marker as the instance name the function will check to see
		 * if instance is an instance of GoogleProMarker
		 * @param {object} instance The object to check
		 * @param {string} instanceName The class name as a string which this object should be an instance of
		 * @static
		 * @return {void}
		 */
		assertInstanceOf: function(instance, instanceName) {
			var engine, fullInstanceName, assert;
			var pro = map-block.isProVersion() ? "Pro" : "";
			
			switch(map-block.settings.engine)
			{
				case "open-layers":
					engine = "OL";
					break;
				
				default:
					engine = "Google";
					break;
			}
			
			if(map-block[engine + pro + instanceName])
				fullInstanceName = engine + pro + instanceName;
			else if(map-block[pro + instanceName])
				fullInstanceName = pro + instanceName;
			else if(map-block[engine + instanceName])
				fullInstanceName = engine + instanceName;
			else
				fullInstanceName = instanceName;
			
			assert = instance instanceof map-block[fullInstanceName];
			
			if(!assert)
				throw new Error("Object must be an instance of " + fullInstanceName + " (did you call a constructor directly, rather than createInstance?)");
		},
		
		/**
		 * @function getMapByID
		 * @param {mixed} id The ID of the map to retrieve
		 * @static
		 * @return {object} The map object, or null if no such map exists
		 */
		getMapByID: function(id) {
			for(var i = 0; i < map-block.maps.length; i++) {
				if(map-block.maps[i].id == id)
					return map-block.maps[i];
			}
			
			return null;
		},
		
		/**
		 * @function isGoogleAutocompleteSupported
		 * @summary Shorthand function to determine if the Places Autocomplete is available
		 * @static
		 * @return {boolean}
		 */
		isGoogleAutocompleteSupported: function() {
			return typeof google === 'object' && typeof google.maps === 'object' && typeof google.maps.places === 'object' && typeof google.maps.places.Autocomplete === 'function';
		},
		
		googleAPIStatus: window.map-block_google_api_status,
		
		isDeviceiOS: function() {
			
			return (
			
				(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
				
				||
				
				(!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform))
			
			);
			
		}
	};
	
	if(window.map-block)
		window.map-block = $.extend(window.map-block, core);
	else
		window.map-block = core;
	
	for(var key in map-block_localized_data)
	{
		var value = map-block_localized_data[key];
		map-block[key] = value;
	}
	
	jQuery(function($) {
		
		// Combined script warning
		if($("script[src*='map-block.combined.js'], script[src*='map-block-pro.combined.js']").length)
			console.warn("Minified script is out of date, using combined script instead.");
		
		// Check for multiple jQuery versions
		var elements = $("script").filter(function() {
			return this.src.match(/(^|\/)jquery\.(min\.)?js(\?|$)/i);
		});

		if(elements.length > 1)
			console.warn("Multiple jQuery versions detected: ", elements);
		
		// Rest API
		map-block.restAPI = map-block.RestAPI.createInstance();
		
		// TODO: Move to map edit page JS
		$(document).on("click", ".map-block_edit_btn", function() {
			
			map-block.animateScroll("#map-blockaps_tabs_markers");
			
		});
		
	});
	
	$(window).on("load", function(event) {
		
		// Geolocation warnings
		if(window.location.protocol != 'https:')
		{
			var warning = '<div class="notice notice-warning"><p>' + map-block.localized_strings.unsecure_geolocation + "</p></div>";
			
			$(".map-block-geolocation-setting").each(function(index, el) {
				$(el).after( $(warning) );
			});
		}
		
	});
	
	
	
});

// js/v8/compatibility.js
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

// js/v8/css-escape.js
/**
 * @module map-block.CSS
 * @namespace map-block
 * @requires map-block
 * @summary Polyfill for CSS.escape, with thanks to @mathias
 */

/*! https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
;(function(root, factory) {
	// https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports == 'object') {
		// For Node.js.
		module.exports = factory(root);
	} else if (typeof define == 'function' && define.amd) {
		// For AMD. Register as an anonymous module.
		define([], factory.bind(root, root));
	} else {
		// For browser globals (not exposing the function separately).
		factory(root);
	}
}(typeof global != 'undefined' ? global : this, function(root) {

	if (root.CSS && root.CSS.escape) {
		return root.CSS.escape;
	}

	// https://drafts.csswg.org/cssom/#serialize-an-identifier
	var cssEscape = function(value) {
		if (arguments.length == 0) {
			throw new TypeError('`CSS.escape` requires an argument.');
		}
		var string = String(value);
		var length = string.length;
		var index = -1;
		var codeUnit;
		var result = '';
		var firstCodeUnit = string.charCodeAt(0);
		while (++index < length) {
			codeUnit = string.charCodeAt(index);
			// Note: there’s no need to special-case astral symbols, surrogate
			// pairs, or lone surrogates.

			// If the character is NULL (U+0000), then the REPLACEMENT CHARACTER
			// (U+FFFD).
			if (codeUnit == 0x0000) {
				result += '\uFFFD';
				continue;
			}

			if (
				// If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
				// U+007F, […]
				(codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
				// If the character is the first character and is in the range [0-9]
				// (U+0030 to U+0039), […]
				(index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
				// If the character is the second character and is in the range [0-9]
				// (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
				(
					index == 1 &&
					codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
					firstCodeUnit == 0x002D
				)
			) {
				// https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
				result += '\\' + codeUnit.toString(16) + ' ';
				continue;
			}

			if (
				// If the character is the first character and is a `-` (U+002D), and
				// there is no second character, […]
				index == 0 &&
				length == 1 &&
				codeUnit == 0x002D
			) {
				result += '\\' + string.charAt(index);
				continue;
			}

			// If the character is not handled by one of the above rules and is
			// greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
			// is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
			// U+005A), or [a-z] (U+0061 to U+007A), […]
			if (
				codeUnit >= 0x0080 ||
				codeUnit == 0x002D ||
				codeUnit == 0x005F ||
				codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
				codeUnit >= 0x0041 && codeUnit <= 0x005A ||
				codeUnit >= 0x0061 && codeUnit <= 0x007A
			) {
				// the character itself
				result += string.charAt(index);
				continue;
			}

			// Otherwise, the escaped character.
			// https://drafts.csswg.org/cssom/#escape-a-character
			result += '\\' + string.charAt(index);

		}
		return result;
	};

	if (!root.CSS) {
		root.CSS = {};
	}

	root.CSS.escape = cssEscape;
	return cssEscape;

}));

// js/v8/distance.js
/**
 * @namespace map-block
 * @module Distance
 * @requires map-block
 */
jQuery(function($) {
	
	map-block.Distance = {
		
		MILES:					true,
		KILOMETERS:				false,
		
		MILES_PER_KILOMETER:	0.621371,
		KILOMETERS_PER_MILE:	1.60934,
		
		// TODO: Implement map-block.settings.distance_units
		
		/**
		 * Converts a UI distance (eg from a form control) to meters,
		 * accounting for the global units setting
		 */
		uiToMeters: function(uiDistance)
		{
			return parseFloat(uiDistance) / (map-block.settings.distance_units == map-block.Distance.MILES ? map-block.Distance.MILES_PER_KILOMETER : 1) * 1000;
		},
		
		/**
		 * Converts a UI distance (eg from a form control) to kilometers,
		 * accounting for the global units setting
		 */
		uiToKilometers: function(uiDistance)
		{
			return map-block.Distance.uiToMeters(uiDistance) * 0.001;
		},
		
		/**
		 * Converts a UI distance (eg from a form control) to miles,
		 * accounting for the global units setting
		 */
		uiToMiles: function(uiDistance)
		{
			return map-block.Distance.uiToKilometers(uiDistance) * map-block.Distance.MILES_PER_KILOMETER;
		},
		
		kilometersToUI: function(km)
		{
			if(map-block.settings.distance_units == map-block.Distance.MILES)
				return km * map-block.Distance.MILES_PER_KILOMETER;
			return km;
		}
		
	};
	
});

// js/v8/event-dispatcher.js
/**
 * @namespace map-block
 * @module EventDispatcher
 * @requires map-block
 */
jQuery(function($) {
	
	map-block.EventDispatcher = function()
	{
		map-block.assertInstanceOf(this, "EventDispatcher");
		
		this._listenersByType = [];
	}

	map-block.EventDispatcher.prototype.addEventListener = function(type, listener, thisObject, useCapture)
	{
		var arr;
		
		var types = type.split(/\s+/);
		if(types.length > 1)
		{
			for(var i = 0; i < types.length; i++)
				this.addEventListener(types[i], listener, thisObject, useCapture);
			
			return;
		}
		
		if(!(listener instanceof Function))
			throw new Error("Listener must be a function");

		if(!(arr = this._listenersByType[type]))
			arr = this._listenersByType[type] = [];
			
		var obj = {
			listener: listener,
			thisObject: (thisObject ? thisObject : this),
			useCapture: (useCapture ? true : false)
			};
			
		arr.push(obj);
	}

	map-block.EventDispatcher.prototype.on = map-block.EventDispatcher.prototype.addEventListener;

	map-block.EventDispatcher.prototype.removeEventListener = function(type, listener, thisObject, useCapture)
	{
		var arr, index, obj;

		if(!(arr = this._listenersByType[type]))
			return;
			
		if(!thisObject)
			thisObject = this;
			
		useCapture = (useCapture ? true : false);
		
		for(var i = 0; i < arr.length; i++)
		{
			obj = arr[i];
		
			if(obj.listener == listener && obj.thisObject == thisObject && obj.useCapture == useCapture)
			{
				arr.splice(i, 1);
				return;
			}
		}
	}

	map-block.EventDispatcher.prototype.off = map-block.EventDispatcher.prototype.removeEventListener;

	map-block.EventDispatcher.prototype.hasEventListener = function(type)
	{
		return (_listenersByType[type] ? true : false);
	}

	map-block.EventDispatcher.prototype.dispatchEvent = function(event)
	{
		if(!(event instanceof map-block.Event))
		{
			if(typeof event == "string")
				event = new map-block.Event(event);
			else
			{
				var src = event;
				event = new map-block.Event();
				for(var name in src)
					event[name] = src[name];
			}
		}

		event.target = this;
			
		var path = [];
		for(var obj = this.parent; obj != null; obj = obj.parent)
			path.unshift(obj);
		
		event.phase = map-block.Event.CAPTURING_PHASE;
		for(var i = 0; i < path.length && !event._cancelled; i++)
			path[i]._triggerListeners(event);
			
		if(event._cancelled)
			return;
			
		event.phase = map-block.Event.AT_TARGET;
		this._triggerListeners(event);
			
		event.phase = map-block.Event.BUBBLING_PHASE;
		for(i = path.length - 1; i >= 0 && !event._cancelled; i--)
			path[i]._triggerListeners(event);
		
		if(this.element)
		{
			var customEvent = {};
			
			for(var key in event)
			{
				var value = event[key];
				
				if(key == "type")
					value += ".map-block";
				
				customEvent[key] = value;
			}
			
			$(this.element).trigger(customEvent);
		}
	}

	map-block.EventDispatcher.prototype.trigger = map-block.EventDispatcher.prototype.dispatchEvent;

	map-block.EventDispatcher.prototype._triggerListeners = function(event)
	{
		var arr, obj;
		
		if(!(arr = this._listenersByType[event.type]))
			return;
			
		for(var i = 0; i < arr.length; i++)
		{
			obj = arr[i];
			
			if(event.phase == map-block.Event.CAPTURING_PHASE && !obj.useCapture)
				continue;
				
			obj.listener.call(arr[i].thisObject, event);
		}
	}

	map-block.events = new map-block.EventDispatcher();

});

// js/v8/event.js
/**
 * @namespace map-block
 * @module Event
 * @requires map-block
 */ 
jQuery(function($) {
		
	map-block.Event = function(options)
	{
		if(typeof options == "string")
			this.type = options;
		
		this.bubbles		= true;
		this.cancelable		= true;
		this.phase			= map-block.Event.PHASE_CAPTURE;
		this.target			= null;
		
		this._cancelled = false;
		
		if(typeof options == "object")
			for(var name in options)
				this[name] = options[name];
	}

	map-block.Event.CAPTURING_PHASE		= 0;
	map-block.Event.AT_TARGET				= 1;
	map-block.Event.BUBBLING_PHASE			= 2;

	map-block.Event.prototype.stopPropagation = function()
	{
		this._cancelled = true;
	}
	
});

// js/v8/friendly-error.js
/**
 * @namespace map-block
 * @module FriendlyError
 * @requires map-block
 */
jQuery(function($) {
	
	/*var template = '\
		<div class="notice notice-error"> \
			<p> \
			' + map-block.localized_strings.friendly_error + ' \
			</p> \
			<pre style="white-space: pre-line;"></pre> \
		<div> \
		';
	
	map-block.FriendlyError = function(nativeError)
	{
		if(!map-block.is_admin)
		{
			this.element = $(map-block.preloaderHTML);
			$(this.element).removeClass("animated");
			return;
		}
		
		$("#map-block-map-edit-page>.map-block-preloader").remove();
		
		this.element = $(template);
		this.element.find("pre").html(nativeError.message + "\r\n" + nativeError.stack + "\r\n\r\n on " + window.location.href);
	}*/
	
});

// js/v8/geocoder.js
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

// js/v8/google-api-error-handler.js
/**
 * @namespace map-block
 * @module GoogleAPIErrorHandler
 * @requires map-block
 */
jQuery(function($) { 

	map-block.GoogleAPIErrorHandler = function() {
		
		var self = this;
		
		// Don't do anything if Google isn't the selected API
		if(map-block.settings.engine != "google-maps")
			return;
		
		// Only allow on the map edit page, or front end if user has administrator role
		if(!(map-block.currentPage == "map-edit" || (map-block.is_admin == 0 && map-block.userCanAdministrator == 1)))
			return;
		
		this.element = $(map-block.html.googleMapsAPIErrorDialog);
		
		if(map-block.is_admin == 1)
			this.element.find(".map-block-front-end-only").remove();
		
		this.errorMessageList = this.element.find("#map-block-google-api-error-list");
		this.templateListItem = this.element.find("li.template").remove();
		
		this.messagesAlreadyDisplayed = {};
		
		if(map-block.settings.developer_mode)
			return;
		
		// Override error function
		var _error = console.error;
		
		console.error = function(message)
		{
			self.onErrorMessage(message);
			
			_error.apply(this, arguments);
		}
	}
	
	map-block.GoogleAPIErrorHandler.prototype.onErrorMessage = function(message)
	{
		var m;
		var regexURL = /http(s)?:\/\/[^\s]+/gm;
		
		if((m = message.match(/You have exceeded your (daily )?request quota for this API/)) || (m = message.match(/This API project is not authorized to use this API/)))
		{
			var urls = message.match(regexURL);
			this.addErrorMessage(m[0], urls);
		}
		else if(m = message.match(/^Google Maps.+error: (.+)\s+(http(s?):\/\/.+)/m))
		{
			this.addErrorMessage(m[1].replace(/([A-Z])/g, " $1"), [m[2]]);
		}
	}
	
	map-block.GoogleAPIErrorHandler.prototype.addErrorMessage = function(message, urls)
	{
		if(this.messagesAlreadyDisplayed[message])
			return;
		
		var li = this.templateListItem.clone();
		$(li).find(".map-block-message").html(message);
		
		var buttonContainer = $(li).find(".map-block-documentation-buttons");
		
		var buttonTemplate = $(li).find(".map-block-documentation-buttons>a");
		buttonTemplate.remove();
		
		if(urls && urls.length)
		{
			for(var i = 0; i < urls.length; i++)
			{
				var url = urls[i];
				var button = buttonTemplate.clone();
				var icon = "fa-external-link";
				var text = map-block.localized_strings.documentation;
				
				button.attr("href", urls[i]);
				
				if(url.match(/google.+documentation/))
				{
					icon = "fa-google";
				}
				else if(url.match(/maps-no-account/))
				{
					icon = "fa-wrench"
					text = map-block.localized_strings.verify_project;
				}
				else if(url.match(/console\.developers\.google/))
				{
					icon = "fa-wrench";
					text = map-block.localized_strings.api_dashboard;
				}
				
				$(button).find("i").addClass(icon);
				$(button).append(text);
			}
			
			buttonContainer.append(button);
		}
		
		$(this.errorMessageList).append(li);
		
		if(!this.dialog)
			this.dialog = $(this.element).remodal();
		
		switch(this.dialog.getState())
		{
			case "open":
			case "opened":
			case "opening":
				break;
				
			default:
				this.dialog.open();
				break;
		}
		
		this.messagesAlreadyDisplayed[message] = true;
	}
	
	map-block.googleAPIErrorHandler = new map-block.GoogleAPIErrorHandler();

});

// js/v8/info-window.js
/**
 * @namespace map-block
 * @module InfoWindow
 * @requires map-block.EventDispatcher
 */
jQuery(function($) {
	
	map-block.InfoWindow = function(mapObject)
	{
		var self = this;
		
		map-block.EventDispatcher.call(this);
		
		map-block.assertInstanceOf(this, "InfoWindow");
		
		if(!mapObject)
			return;
		
		this.mapObject = mapObject;
		
		if(mapObject.map)
		{
			// This has to be slightly delayed so the map initialization won't overwrite the infowindow element
			setTimeout(function() {
				self.onMapObjectAdded(event);
			}, 100);
		}
		else
			mapObject.addEventListener("added", function(event) { 
				self.onMapObjectAdded(event);
			});		
	}
	
	map-block.InfoWindow.prototype = Object.create(map-block.EventDispatcher.prototype);
	map-block.InfoWindow.prototype.constructor = map-block.InfoWindow;
	
	map-block.InfoWindow.OPEN_BY_CLICK = 1;
	map-block.InfoWindow.OPEN_BY_HOVER = 2;
	
	map-block.InfoWindow.getConstructor = function()
	{
		switch(map-block.settings.engine)
		{
			case "open-layers":
				if(map-block.isProVersion())
					return map-block.OLProInfoWindow;
				return map-block.OLInfoWindow;
				break;
			
			default:
				if(map-block.isProVersion())
					return map-block.GoogleProInfoWindow;
				return map-block.GoogleInfoWindow;
				break;
		}
	}
	
	map-block.InfoWindow.createInstance = function(mapObject)
	{
		var constructor = this.getConstructor();
		return new constructor(mapObject);
	}
	
	/**
	 * Gets the content for the info window and passes it to the specified callback - this allows for delayed loading (eg AJAX) as well as instant content
	 * @return void
	 */
	map-block.InfoWindow.prototype.getContent = function(callback)
	{
		var html = "";
		
		if(this.mapObject instanceof map-block.Marker)
			html = this.mapObject.address;
		
		callback(html);
	}
	
	/**
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	map-block.InfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		this.mapObject = mapObject;
		
		if(map-block.settings.disable_infowindows)
			return false;
		
		return true;
	}
	
	map-block.InfoWindow.prototype.close = function()
	{
		
	}
	
	map-block.InfoWindow.prototype.setContent = function(options)
	{
		
	}
	
	map-block.InfoWindow.prototype.setOptions = function(options)
	{
		
	}
	
	/**
	 * Event listener for when the map object is added. This will cause the info window to open if the map object has infoopen set
	 * @return void
	 */
	map-block.InfoWindow.prototype.onMapObjectAdded = function()
	{
		if(this.mapObject.settings.infoopen == 1)
			this.open();
	}
	
});

// js/v8/latlng.js
/**
 * @namespace map-block
 * @module LatLng
 * @requires map-block
 */
jQuery(function($) {

	/**
	 * Constructor
	 * @param mixed A latLng literal, or latitude
	 * @param mixed The latitude, where arg is a longitude
	 */
	map-block.LatLng = function(arg, lng)
	{
		this._lat = 0;
		this._lng = 0;
		
		if(arguments.length == 0)
			return;
		
		if(arguments.length == 1)
		{
			// TODO: Support latlng string
			
			if(typeof arg == "string")
			{
				var m;
				
				if(!(m = arg.match(map-block.LatLng.REGEXP)))
					throw new Error("Invalid LatLng string");
				
				arg = {
					lat: m[1],
					lng: m[3]
				};
			}
			
			if(typeof arg != "object" || !("lat" in arg && "lng" in arg))
				throw new Error("Argument must be a LatLng literal");
			
			this.lat = arg.lat;
			this.lng = arg.lng;
		}
		else
		{
			this.lat = arg;
			this.lng = lng;
		}
	}
	
	map-block.LatLng.REGEXP = /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/;
	
	map-block.LatLng.isValid = function(obj)
	{
		if(typeof obj != "object")
			return false;
		
		if(!("lat" in obj && "lng" in obj))
			return false;
		
		return true;
	}
	
	Object.defineProperty(map-block.LatLng.prototype, "lat", {
		get: function() {
			return this._lat;
		},
		set: function(val) {
			if(!$.isNumeric(val))
				throw new Error("Latitude must be numeric");
			this._lat = parseFloat( val );
		}
	});
	
	Object.defineProperty(map-block.LatLng.prototype, "lng", {
		get: function() {
			return this._lng;
		},
		set: function(val) {
			if(!$.isNumeric(val))
				throw new Error("Longitude must be numeric");
			this._lng = parseFloat( val );
		}
	});
	
	map-block.LatLng.prototype.toString = function()
	{
		return this._lat + ", " + this._lng;
	}
	
	map-block.LatLng.fromGoogleLatLng = function(googleLatLng)
	{
		return new map-block.LatLng(
			googleLatLng.lat(),
			googleLatLng.lng()
		);
	}
	
	map-block.LatLng.prototype.toGoogleLatLng = function()
	{
		return new google.maps.LatLng({
			lat: this.lat,
			lng: this.lng
		});
	}
	
	/**
	 * @function moveByDistance
	 * @summary Moves this latLng by the specified kilometers along the given heading
	 * @return void
	 * With many thanks to Hu Kenneth - https://gis.stackexchange.com/questions/234473/get-a-lonlat-point-by-distance-or-between-2-lonlat-points
	 */
	map-block.LatLng.prototype.moveByDistance = function(kilometers, heading)
	{
		var radius 		= 6371;
		
		var delta 		= parseFloat(kilometers) / radius;
		var theta 		= parseFloat(heading) / 180 * Math.PI;
		
		var phi1 		= this.lat / 180 * Math.PI;
		var lambda1 	= this.lng / 180 * Math.PI;
		
		var sinPhi1 	= Math.sin(phi1), cosPhi1 = Math.cos(phi1);
		var sinDelta	= Math.sin(delta), cosDelta = Math.cos(delta);
		var sinTheta	= Math.sin(theta), cosTheta = Math.cos(theta);
		
		var sinPhi2		= sinPhi1 * cosDelta + cosPhi1 * sinDelta * cosTheta;
		var phi2		= Math.asin(sinPhi2);
		var y			= sinTheta * sinDelta * cosPhi1;
		var x			= cosDelta - sinPhi1 * sinPhi2;
		var lambda2		= lambda1 + Math.atan2(y, x);
		
		this.lat		= phi2 * 180 / Math.PI;
		this.lng		= lambda2 * 180 / Math.PI;
	}
	
});

// js/v8/latlngbounds.js
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


// js/v8/map-object.js
/**
 * @namespace map-block
 * @module MapObject
 * @requires map-block.EventDispatcher
 */
jQuery(function($) {
	
	map-block.MapObject = function(row)
	{
		var self = this;
		
		map-block.assertInstanceOf(this, "MapObject");
		
		map-block.EventDispatcher.call(this);
		
		this.id = -1;
		this.guid = map-block.guid();
		this.modified = true;
		this.settings = {};
		
		if(row)
		{
			for(var name in row)
			{
				if(name == "settings")
				{
					if(row["settings"] == null)
						this["settings"] = {};
					else switch(typeof row["settings"]) {
						case "string":
							this["settings"] = JSON.parse(row[name]);
							break;
						case "object":
							this["settings"] = row[name];
							break;
						default:
							throw new Error("Don't know how to interpret settings")
							break;
					}
					
					for(var name in this.settings)
					{
						var value = this.settings[name];
						if(String(value).match(/^-?\d+$/))
							this.settings[name] = parseInt(value);
					}
				}
				else
					this[name] = row[name];
			}
		}		
	}
	
	map-block.MapObject.prototype = Object.create(map-block.EventDispatcher.prototype);
	map-block.MapObject.prototype.constructor = map-block.MapObject;
	
	map-block.MapObject.prototype.parseGeometry = function(string)
	{
		var stripped, pairs, coords, results = [];
		stripped = string.replace(/[^ ,\d\.\-+e]/g, "");
		pairs = stripped.split(",");
		
		for(var i = 0; i < pairs.length; i++)
		{
			coords = pairs[i].split(" ");
			results.push({
				lat: parseFloat(coords[1]),
				lng: parseFloat(coords[0])
			});
		}
				
		return results;
	}
	
	map-block.MapObject.prototype.toJSON = function()
	{
		return {
			id: this.id,
			guid: this.guid,
			settings: this.settings
		};
	}
	
});

// js/v8/circle.js
/**
 * @namespace map-block
 * @module Circle
 * @requires map-block.MapObject
 */
jQuery(function($) {
	
	var Parent = map-block.MapObject;
	
	/**
	 * @class Circle
	 * @summary Represents a generic circle. <b>Please do not instantiate this object directly, use createInstance</b>
	 * @return {map-block.Circle}
	 */
	map-block.Circle = function(options, engineCircle)
	{
		var self = this;
		
		map-block.assertInstanceOf(this, "Circle");
		
		this.center = new map-block.LatLng();
		this.radius = 100;
		
		Parent.apply(this, arguments);
	}
	
	map-block.Circle.prototype = Object.create(Parent.prototype);
	map-block.Circle.prototype.constructor = map-block.Circle;
	
	/**
	 * @function createInstance
	 * @summary Creates an instance of a circle, <b>please always use this function rather than calling the constructor directly</b>
	 * @param {object} options Options for the object (optional)
	 */
	map-block.Circle.createInstance = function(options)
	{
		var constructor;
		
		if(map-block.settings.engine == "google-maps")
			constructor = map-block.GoogleCircle;
		else
			constructor = map-block.OLCircle;
		
		return new constructor(options);
	}
	
	/**
	 * @function getCenter
	 * @returns {map-block.LatLng}
	 */
	map-block.Circle.prototype.getCenter = function()
	{
		return this.center.clone();
	}
	
	/**
	 * @function setCenter
	 * @param {object|map-block.LatLng} latLng either a literal or as a map-block.LatLng
	 * @returns {void}
	 */
	map-block.Circle.prototype.setCenter = function(latLng)
	{
		this.center.lat = latLng.lat;
		this.center.lng = latLng.lng;
	}
	
	/**
	 * @function getRadius
	 * @summary Returns the circles radius in kilometers
	 * @returns {map-block.LatLng}
	 */
	map-block.Circle.prototype.getRadius = function()
	{
		return this.radius;
	}
	
	/**
	 * @function setRadius
	 * @param {number} The radius
	 * @returns {void}
	 */
	map-block.Circle.prototype.setRadius = function(radius)
	{
		this.radius = radius;
	}
	
	/**
	 * @function getMap
	 * @summary Returns the map that this circle is being displayed on
	 * @return {map-block.Map}
	 */
	map-block.Circle.prototype.getMap = function()
	{
		return this.map;
	}
	
	/**
	 * @function setMap
	 * @param {map-block.Map} The target map
	 * @summary Puts this circle on a map
	 * @return {void}
	 */
	map-block.Circle.prototype.setMap = function(map)
	{
		if(this.map)
			this.map.removeCircle(this);
		
		if(map)
			map.addCircle(this);
			
	}
	
});

// js/v8/map-settings-page.js
/**
 * @namespace map-block
 * @module MapSettingsPage
 * @requires map-block
 */
jQuery(function($) {
	
	map-block.MapSettingsPage = function()
	{
		var self = this;
		
		this.updateEngineSpecificControls();
		this.updateGDPRControls();
		
		$("select[name='map-block_maps_engine']").on("change", function(event) {
			self.updateEngineSpecificControls();
		});
		
		$("input[name='map-block_gdpr_require_consent_before_load'], input[name='map-block_gdpr_require_consent_before_vgm_submit'], input[name='map-block_gdpr_override_notice']").on("change", function(event) {
			self.updateGDPRControls();
		});
	}
	
	map-block.MapSettingsPage.prototype.updateEngineSpecificControls = function()
	{
		var engine = $("select[name='map-block_maps_engine']").val();
		
		$("[data-required-maps-engine][data-required-maps-engine!='" + engine + "']").hide();
		$("[data-required-maps-engine='" + engine + "']").show();
	}
	
	map-block.MapSettingsPage.prototype.updateGDPRControls = function()
	{
		var showNoticeControls = $("input[name='map-block_gdpr_require_consent_before_load']").prop("checked");
		
		var vgmCheckbox = $("input[name='map-block_gdpr_require_consent_before_vgm_submit']");
		
		if(vgmCheckbox.length)
			showNoticeControls = showNoticeControls || vgmCheckbox.prop("checked");
		
		var showOverrideTextarea = showNoticeControls && $("input[name='map-block_gdpr_override_notice']").prop("checked");
		
		if(showNoticeControls)
		{
			$("#map-block-gdpr-compliance-notice").show("slow");
		}
		else
		{
			$("#map-block-gdpr-compliance-notice").hide("slow");
		}
		
		if(showOverrideTextarea)
		{
			$("#map-block_gdpr_override_notice_text").show("slow");
		}
		else
		{
			$("#map-block_gdpr_override_notice_text").hide("slow");
		}
	}
	
	jQuery(function($) {
		
		if(!window.location.href.match(/map-block-menu-settings/))
			return;
		
		map-block.mapSettingsPage = new map-block.MapSettingsPage();
		
	});
	
});

// js/v8/map-settings.js
/**
 * @namespace map-block
 * @module MapSettings
 * @requires map-block
 */
jQuery(function($) {
	
	map-block.MapSettings = function(element)
	{
		var str = element.getAttribute("data-settings");
		var json = JSON.parse(str);
		
		//var id = $(element).attr("data-map-id");
		//var json = JSON.parse(window["map-block_map_settings_" + id]);
		
		map-block.assertInstanceOf(this, "MapSettings");
		
		for(var key in map-block.settings)
		{
			var value = map-block.settings[key];
			
			this[key] = value;
		}
		
		for(var key in json)
		{
			var value = json[key];
			
			if(String(value).match(/^-?\d+$/))
				value = parseInt(value);
				
			this[key] = value;
		}
	}
	
	map-block.MapSettings.prototype.toOLViewOptions = function()
	{
		var options = {
			center: ol.proj.fromLonLat([-119.4179, 36.7783]),
			zoom: 4
		};
		
		function empty(name)
		{
			if(typeof self[name] == "object")
				return false;
			
			return !self[name] || !self[name].length;
		}
		
		// Start location
		if(typeof this.start_location == "string")
		{
			var coords = this.start_location.replace(/^\(|\)$/g, "").split(",");
			if(map-block.isLatLngString(this.start_location))
				options.center = ol.proj.fromLonLat([
					parseFloat(coords[1]),
					parseFloat(coords[0])
				]);
			else
				console.warn("Invalid start location");
		}
		
		if(this.center)
		{
			options.center = ol.proj.fromLonLat([
				parseFloat(this.center.lng),
				parseFloat(this.center.lat)
			]);
		}
		
		// Start zoom
		if(this.zoom)
			options.zoom = parseInt(this.zoom);
		
		if(this.start_zoom)
			options.zoom = parseInt(this.start_zoom);
		
		// Zoom limits
		// TODO: This matches the Google code, so some of these could be potentially put on a parent class
		if(!empty("min_zoom"))
			options.minZoom = parseInt(this.min_zoom);
		if(!empty("max_zoom"))
			options.maxZoom = parseInt(this.max_zoom);
		
		return options;
	}
	
	map-block.MapSettings.prototype.toGoogleMapsOptions = function()
	{
		var self = this;
		var latLngCoords = (this.start_location && this.start_location.length ? this.start_location.split(",") : [36.7783, -119.4179]);
		
		function empty(name)
		{
			if(typeof self[name] == "object")
				return false;
			
			return !self[name] || !self[name].length;
		}
		
		function formatCoord(coord)
		{
			if($.isNumeric(coord))
				return coord;
			return parseFloat( String(coord).replace(/[\(\)\s]/, "") );
		}
		
		var latLng = new google.maps.LatLng(
			formatCoord(latLngCoords[0]),
			formatCoord(latLngCoords[1])
		);
		
		var zoom = (this.start_zoom ? parseInt(this.start_zoom) : 4);
		
		if(!this.start_zoom && this.zoom)
			zoom = parseInt( this.zoom );
		
		var options = {
			zoom:			zoom,
			center:			latLng
		};
		
		if(!empty("center"))
			options.center = new google.maps.LatLng({
				lat: parseFloat(this.center.lat),
				lng: parseFloat(this.center.lng)
			});
		
		if(!empty("min_zoom"))
			options.minZoom = parseInt(this.min_zoom);
		if(!empty("max_zoom"))
			options.maxZoom = parseInt(this.max_zoom);
		
		// These settings are all inverted because the checkbox being set means "disabled"
		options.zoomControl				= !(this.map-block_settings_map_zoom == 'yes');
        options.panControl				= !(this.map-block_settings_map_pan == 'yes');
        options.mapTypeControl			= !(this.map-block_settings_map_type == 'yes');
        options.streetViewControl		= !(this.map-block_settings_map_streetview == 'yes');
        options.fullscreenControl		= !(this.map-block_settings_map_full_screen_control == 'yes');
        
        options.draggable				= !(this.map-block_settings_map_draggable == 'yes');
        options.disableDoubleClickZoom	= !(this.map-block_settings_map_clickzoom == 'yes');
        options.scrollwheel				= !(this.map-block_settings_map_scroll == 'yes');
		
		if(this.map-block_force_greedy_gestures == "greedy" || this.map-block_force_greedy_gestures == "yes")
			options.gestureHandling = "greedy";
		else
			options.gestureHandling = "cooperative";
		
		switch(parseInt(this.map_type))
		{
			case 2:
				options.mapTypeId = google.maps.MapTypeId.SATELLITE;
				break;
			
			case 3:
				options.mapTypeId = google.maps.MapTypeId.HYBRID;
				break;
			
			case 4:
				options.mapTypeId = google.maps.MapTypeId.TERRAIN;
				break;
				
			default:
				options.mapTypeId = google.maps.MapTypeId.ROADMAP;
				break;
		}
		
		if(this.theme_data && this.theme_data.length > 0)
		{
			try{
				options.styles = JSON.parse(this.theme_data);
			}catch(e) {
				alert("Your theme data is not valid JSON and has been ignored");
			}
		}
		
		return options;
	}
});

// js/v8/map.js
/**
 * @namespace map-block
 * @module Map
 * @requires map-block.EventDispatcher
 */
jQuery(function($) {
	
	/**
	 * Constructor
	 * @param element to contain map
	 */
	map-block.Map = function(element, options)
	{
		var self = this;
		
		map-block.assertInstanceOf(this, "Map");
		
		map-block.EventDispatcher.call(this);
		
		if(!(element instanceof HTMLElement))
			throw new Error("Argument must be a HTMLElement");
		
		this.id = element.getAttribute("data-map-id");
		if(!/\d+/.test(this.id))
			throw new Error("Map ID must be an integer");
		
		map-block.maps.push(this);
		this.element = element;
		this.element.map-blockMap = this;
		
		this.engineElement = element;
		
		this.markers = [];
		this.polygons = [];
		this.polylines = [];
		this.circles = [];
		
		this.loadSettings(options);
	}
	
	map-block.Map.prototype = Object.create(map-block.EventDispatcher.prototype);
	map-block.Map.prototype.constructor = map-block.Map;
	
	map-block.Map.getConstructor = function()
	{
		switch(map-block.settings.engine)
		{
			case "open-layers":
				if(map-block.isProVersion())
					return map-block.OLProMap;
				
				return map-block.OLMap;
				break;
			
			default:
				if(map-block.isProVersion())
					return map-block.GoogleProMap;
				
				return map-block.GoogleMap;
				break;
		}
	}
	
	map-block.Map.createInstance = function(element, options)
	{
		var constructor = map-block.Map.getConstructor();
		return new constructor(element, options);
	}
	
	/**
	 * Loads the maps settings and sets some defaults
	 * @return void
	 */
	map-block.Map.prototype.loadSettings = function(options)
	{
		var settings = new map-block.MapSettings(this.element);
		var other_settings = settings.other_settings;
		
		delete settings.other_settings;
		
		if(other_settings)
			for(var key in other_settings)
				settings[key] = other_settings[key];
			
		if(options)
			for(var key in options)
				settings[key] = options[key];
			
		this.settings = settings;
	}
	
	/**
	 * This override should automatically dispatch a .map-block scoped event on the element
	 * TODO: Implement
	 */
	/*map-block.Map.prototype.trigger = function(event)
	{
		
	}*/
	
	/**
	 * Sets options in bulk on map
	 * @return void
	 */
	map-block.Map.prototype.setOptions = function(options)
	{
		for(var name in options)
			this.settings[name] = options[name];
	}
	
	/**
	 * Gets the distance between two latLngs in kilometers
	 * NB: Static function
	 * @return number
	 */
	var earthRadiusMeters = 6371;
	var piTimes360 = Math.PI / 360;
	
	function deg2rad(deg) {
	  return deg * (Math.PI/180)
	};
	
	/**
	 * This gets the distance in kilometers between two latitude / longitude points
	 * TODO: Move this to the distance class, or the LatLng class
	 * @return void
	 */
	map-block.Map.getGeographicDistance = function(lat1, lon1, lat2, lon2)
	{
		var dLat = deg2rad(lat2-lat1);
		var dLon = deg2rad(lon2-lon1); 
		
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
			
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = earthRadiusMeters * c; // Distance in km
		
		return d;
	}
	
	map-block.Map.prototype.setCenter = function(latLng)
	{
		if(!("lat" in latLng && "lng" in latLng))
			throw new Error("Argument is not an object with lat and lng");
	}
	
	/**
	 * Sets the dimensions of the map
	 * @return void
	 */
	map-block.Map.prototype.setDimensions = function(width, height)
	{
		$(this.element).css({
			width: width
		});
		
		$(this.engineElement).css({
			width: "100%",
			height: height
		});
	}
	
	/**
	 * Adds the specified marker to this map
	 * @return void
	 */
	map-block.Map.prototype.addMarker = function(marker)
	{
		if(!(marker instanceof map-block.Marker))
			throw new Error("Argument must be an instance of map-block.Marker");
		
		marker.map = this;
		marker.parent = this;
		
		this.markers.push(marker);
		this.dispatchEvent({type: "markeradded", marker: marker});
		marker.dispatchEvent({type: "added"});
	}
	
	/**
	 * Removes the specified marker from this map
	 * @return void
	 */
	map-block.Map.prototype.removeMarker = function(marker)
	{
		if(!(marker instanceof map-block.Marker))
			throw new Error("Argument must be an instance of map-block.Marker");
		
		if(marker.map !== this)
			throw new Error("Wrong map error");
		
		marker.map = null;
		marker.parent = null;
		
		this.markers.splice(this.markers.indexOf(marker), 1);
		this.dispatchEvent({type: "markerremoved", marker: marker});
		marker.dispatchEvent({type: "removed"});
	}
	
	map-block.Map.prototype.getMarkerByID = function(id)
	{
		for(var i = 0; i < this.markers.length; i++)
		{
			if(this.markers[i].id == id)
				return this.markers[i];
		}
		
		return null;
	}
	
	map-block.Map.prototype.removeMarkerByID = function(id)
	{
		var marker = this.getMarkerByID(id);
		
		if(!marker)
			return;
		
		this.removeMarker(marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @return void
	 */
	map-block.Map.prototype.addPolygon = function(polygon)
	{
		if(!(polygon instanceof map-block.Polygon))
			throw new Error("Argument must be an instance of map-block.Polygon");
		
		polygon.map = this;
		
		this.polygons.push(polygon);
		this.dispatchEvent({type: "polygonadded", polygon: polygon});
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	map-block.Map.prototype.deletePolygon = function(polygon)
	{
		if(!(polygon instanceof map-block.Polygon))
			throw new Error("Argument must be an instance of map-block.Polygon");
		
		if(polygon.map !== this)
			throw new Error("Wrong map error");
		
		polygon.map = null;
		
		this.polygons.splice(this.polygons.indexOf(polygon), 1);
		this.dispatchEvent({type: "polygonremoved", polygon: polygon});
	}
	
	map-block.Map.prototype.getPolygonByID = function(id)
	{
		for(var i = 0; i < this.polygons.length; i++)
		{
			if(this.polygons[i].id == id)
				return this.polygons[i];
		}
		
		return null;
	}
	
	map-block.Map.prototype.deletePolygonByID = function(id)
	{
		var polygon = this.getPolygonByID(id);
		
		if(!polygon)
			return;
		
		this.deletePolygon(polygon);
	}
	
	/**
	 * Gets a polyline by ID
	 * @return void
	 */
	map-block.Map.prototype.getPolylineByID = function(id)
	{
		for(var i = 0; i < this.polylines.length; i++)
		{
			if(this.polylines[i].id == id)
				return this.polylines[i];
		}
		
		return null;
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @return void
	 */
	map-block.Map.prototype.addPolyline = function(polyline)
	{
		if(!(polyline instanceof map-block.Polyline))
			throw new Error("Argument must be an instance of map-block.Polyline");
		
		polyline.map = this;
		
		this.polylines.push(polyline);
		this.dispatchEvent({type: "polylineadded", polyline: polyline});
	}
	
	/**
	 * Removes the specified polyline from this map
	 * @return void
	 */
	map-block.Map.prototype.deletePolyline = function(polyline)
	{
		if(!(polyline instanceof map-block.Polyline))
			throw new Error("Argument must be an instance of map-block.Polyline");
		
		if(polyline.map !== this)
			throw new Error("Wrong map error");
		
		polyline.map = null;
		
		this.polylines.splice(this.polylines.indexOf(polyline), 1);
		this.dispatchEvent({type: "polylineremoved", polyline: polyline});
	}
	
	map-block.Map.prototype.getPolylineByID = function(id)
	{
		for(var i = 0; i < this.polylines.length; i++)
		{
			if(this.polylines[i].id == id)
				return this.polylines[i];
		}
		
		return null;
	}
	
	map-block.Map.prototype.deletePolylineByID = function(id)
	{
		var polyline = this.getPolylineByID(id);
		
		if(!polyline)
			return;
		
		this.deletePolyline(polyline);
	}
	
	/**
	 * Adds the specified circle to this map
	 * @return void
	 */
	map-block.Map.prototype.addCircle = function(circle)
	{
		if(!(circle instanceof map-block.Circle))
			throw new Error("Argument must be an instance of map-block.Circle");
		
		circle.map = this;
		
		this.circles.push(circle);
		this.dispatchEvent({type: "circleadded", circle: circle});
	}
	
	/**
	 * Removes the specified circle from this map
	 * @return void
	 */
	map-block.Map.prototype.removeCircle = function(circle)
	{
		if(!(circle instanceof map-block.Circle))
			throw new Error("Argument must be an instance of map-block.Circle");
		
		if(circle.map !== this)
			throw new Error("Wrong map error");
		
		circle.map = null;
		
		this.circles.splice(this.circles.indexOf(circle), 1);
		this.dispatchEvent({type: "circleremoved", circle: circle});
	}
	
	map-block.Map.prototype.getCircleByID = function(id)
	{
		for(var i = 0; i < this.circles.length; i++)
		{
			if(this.circles[i].id == id)
				return this.circles[i];
		}
		
		return null;
	}
	
	map-block.Map.prototype.deleteCircleByID = function(id)
	{
		var circle = this.getCircleByID(id);
		
		if(!circle)
			return;
		
		this.deleteCircle(circle);
	}
	
	/**
	 * Nudges the map viewport by the given pixel coordinates
	 * @return void
	 */
	map-block.Map.prototype.nudge = function(x, y)
	{
		var pixels = this.latLngToPixels(this.getCenter());
		
		pixels.x += parseFloat(x);
		pixels.y += parseFloat(y);
		
		if(isNaN(pixels.x) || isNaN(pixels.y))
			throw new Error("Invalid coordinates supplied");
		
		var latLng = this.pixelsToLatLng(pixels);
		
		this.setCenter(latLng);
	}
	
	/**
	 * Triggered when the window resizes
	 * @return void
	 */
	map-block.Map.prototype.onWindowResize = function(event)
	{
		
	}
	
	/**
	 * Listener for when the engine map div is resized
	 * @return void
	 */
	map-block.Map.prototype.onElementResized = function(event)
	{
		
	}
	
	map-block.Map.prototype.onBoundsChanged = function(event)
	{
		// Native events
		this.trigger("boundschanged");
		
		// Google / legacy compatibility events
		this.trigger("bounds_changed");
	}
	
	map-block.Map.prototype.onIdle = function(event)
	{
		$(this.element).trigger("idle");
	}
	
	/*$(document).ready(function() {
		function createMaps()
		{
			// TODO: Test that this works for maps off screen (which borks google)
			$(".map-block-map").each(function(index, el) {
				if(!el.map-blockMap)
				{
					map-block.runCatchableTask(function() {
						map-block.Map.createInstance(el);
					}, el);
				}
			});
		}
		
		createMaps();
		
		// Call again each second to load AJAX maps
		setInterval(createMaps, 1000);
	});*/
});

// js/v8/maps-engine-dialog.js
/**
 * @namespace map-block
 * @module MapsEngineDialog
 * @requires map-block
 */
jQuery(function($) {
	
	map-block.MapsEngineDialog = function(element)
	{
		var self = this;
		
		this.element = element;
		
		if(window.map-blockUnbindSaveReminder)
			window.map-blockUnbindSaveReminder();
		
		$(element).show();
		$(element).remodal().open();
		
		$(element).find("input:radio").on("change", function(event) {
			
			$("#map-block-confirm-engine").prop("disabled", false);
			
		});
		
		$("#map-block-confirm-engine").on("click", function(event) {
			
			self.onButtonClicked(event);
			
		});
	}
	
	map-block.MapsEngineDialog.prototype.onButtonClicked = function(event)
	{
		$(event.target).prop("disabled", true);
		
		$.ajax(map-block.ajaxurl, {
			method: "POST",
			data: {
				action: "map-block_maps_engine_dialog_set_engine",
				engine: $("[name='map-block_maps_engine']:checked").val()
			},
			success: function(response, status, xhr) {
				window.location.reload();
			}
		});
	}
	
	$(window).on("load", function(event) {
		
		var element = $("#map-block-maps-engine-dialog");
		
		if(!element.length)
			return;
		
		if(map-block.settings.map-block_maps_engine_dialog_done)
			return;
		
		map-block.mapsEngineDialog = new map-block.MapsEngineDialog(element);
		
	});
	
});

// js/v8/marker.js
/**
 * @namespace map-block
 * @module Marker
 * @requires map-block
 */
jQuery(function($) {
	/**
	 * Constructor
	 * @param json to load (optional)
	 */
	map-block.Marker = function(row)
	{
		var self = this;
		
		map-block.assertInstanceOf(this, "Marker");
		
		this.lat = "36.778261";
		this.lng = "-119.4179323999";
		this.address = "California";
		this.title = null;
		this.description = "";
		this.link = "";
		this.icon = "";
		this.approved = 1;
		this.pic = null;
		
		map-block.MapObject.apply(this, arguments);
		
		if(row && row.heatmap)
			return; // Don't listen for these events on heatmap markers.
		
		if(row)
			this.on("init", function(event) {
				if(row.position)
					this.setPosition(row.position);
				
				if(row.map)
					row.map.addMarker(this);
			});
		
		this.addEventListener("added", function(event) {
			self.onAdded(event);
		});
	}
	
	map-block.Marker.prototype = Object.create(map-block.MapObject.prototype);
	map-block.Marker.prototype.constructor = map-block.Marker;
	
	/**
	 * Gets the constructor. You can use this instead of hard coding the parent class when inheriting,
	 * which is helpful for making subclasses that work with Basic only, Pro, Google, OL or a 
	 * combination of the four.
	 * @return function
	 */
	map-block.Marker.getConstructor = function()
	{
		switch(map-block.settings.engine)
		{
			case "open-layers":
				if(map-block.isProVersion())
					return map-block.OLProMarker;
				return map-block.OLMarker;
				break;
				
			default:
				if(map-block.isProVersion())
					return map-block.GoogleProMarker;
				return map-block.GoogleMarker;
				break;
		}
	}
	
	map-block.Marker.createInstance = function(row)
	{
		var constructor = map-block.Marker.getConstructor();
		return new constructor(row);
	}
	
	map-block.Marker.ANIMATION_NONE			= "0";
	map-block.Marker.ANIMATION_BOUNCE			= "1";
	map-block.Marker.ANIMATION_DROP			= "2";
	
	map-block.Marker.prototype.onAdded = function(event)
	{
		var self = this;
		
		// this.infoWindow = map-block.InfoWindow.createInstance(this);
		
		this.addEventListener("click", function(event) {
			self.onClick(event);
		});
		
		this.addEventListener("mouseover", function(event) {
			self.onMouseOver(event);
		});
		
		this.addEventListener("select", function(event) {
			self.onSelect(event);
		});
		
		if(this.map.settings.marker == this.id)
			self.trigger("select");
	}
	
	/**
	 * This function will hide the last info the user interacted with
	 * @return void
	 */
	map-block.Marker.prototype.hidePreviousInteractedInfoWindow = function()
	{
		if(!this.map.lastInteractedMarker)
			return;
		
		this.map.lastInteractedMarker.infoWindow.close();
	}
	
	map-block.Marker.prototype.openInfoWindow = function()
	{
		//this.hidePreviousInteractedInfoWindow();
		//this.infoWindow.open(this.map, this);
		//this.map.lastInteractedMarker = this;
	}
	
	map-block.Marker.prototype.onClick = function(event)
	{
		
	}
	
	map-block.Marker.prototype.onSelect = function(event)
	{
		this.openInfoWindow();
	}
	
	map-block.Marker.prototype.onMouseOver = function(event)
	{
		if(this.map.settings.info_window_open_by == map-block.InfoWindow.OPEN_BY_HOVER)
			this.openInfoWindow();
	}
	
	map-block.Marker.prototype.getIcon = function()
	{
		function stripProtocol(url)
		{
			if(typeof url != "string")
				return url;
			
			return url.replace(/^http(s?):/, "");
		}
		
		return stripProtocol(map-block.settings.default_marker_icon);
	}
	
	/**
	 * Gets the position of the marker
	 * @return object
	 */
	map-block.Marker.prototype.getPosition = function()
	{
		return {
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		};
	}
	
	/**
	 * Sets the position of the marker
	 * @return void
	 */
	map-block.Marker.prototype.setPosition = function(latLng)
	{
		if(latLng instanceof map-block.LatLng)
		{
			this.lat = latLng.lat;
			this.lng = latLng.lng;
		}
		else
		{
			this.lat = parseFloat(latLng.lat);
			this.lng = parseFloat(latLng.lng);
		}
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	map-block.Marker.prototype.getAnimation = function(animation)
	{
		return this.settings.animation;
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	map-block.Marker.prototype.setAnimation = function(animation)
	{
		this.settings.animation = animation;
	}
	
	/**
	 * Get the marker visibility
	 * @return void
	 */
	map-block.Marker.prototype.getVisible = function(visible)
	{
		
	}
	
	/**
	 * Set the marker visibility. This is used by the store locator etc. and is not a setting
	 * @return void
	 */
	map-block.Marker.prototype.setVisible = function(visible)
	{
		if(!visible && this.infoWindow)
			this.infoWindow.close();
	}
	
	map-block.Marker.prototype.setMap = function(map)
	{
		if(!map)
		{
			if(this.map)
				this.map.removeMarker(this);
			
			return;
		}
		
		map.addMarker(this);
	}
	
	map-block.Marker.prototype.getDraggable = function()
	{
		
	}
	
	map-block.Marker.prototype.setDraggable = function(draggable)
	{
		
	}
	
	map-block.Marker.prototype.setOptions = function()
	{
		
	}
	
	map-block.Marker.prototype.panIntoView = function()
	{
		if(!this.map)
			throw new Error("Marker hasn't been added to a map");
		
		this.map.setCenter(this.getPosition());
	}
	
	/**
	 * Returns the marker as a JSON object
	 * @return object
	 */
	map-block.Marker.prototype.toJSON = function()
	{
		var result = map-block.MapObject.prototype.toJSON.call(this);
		var position = this.getPosition();
		
		$.extend(result, {
			lat: position.lat,
			lng: position.lng,
			address: this.address,
			title: this.title,
			description: this.description,
			link: this.link,
			icon: this.icon,
			pic: this.pic,
			approved: this.approved
		});
		
		return result;
	}
	
	
});

// js/v8/modern-store-locator-circle.js
/**
 * @namespace map-block
 * @module ModernStoreLocatorCircle
 * @requires map-block
 */
jQuery(function($) {
	
	/**
	 * This module is the modern store locator circle
	 * @constructor
	 */
	map-block.ModernStoreLocatorCircle = function(map_id, settings) {
		var self = this;
		var map;
		
		if(map-block.isProVersion())
			map = this.map = MYMAP[map_id].map;
		else
			map = this.map = MYMAP.map;
		
		this.map_id = map_id;
		this.mapElement = map.element;
		this.mapSize = {
			width:  $(this.mapElement).width(),
			height: $(this.mapElement).height()
		};
			
		this.initCanvasLayer();
		
		this.settings = {
			center: new map-block.LatLng(0, 0),
			radius: 1,
			color: "#63AFF2",
			
			shadowColor: "white",
			shadowBlur: 4,
			
			centerRingRadius: 10,
			centerRingLineWidth: 3,

			numInnerRings: 9,
			innerRingLineWidth: 1,
			innerRingFade: true,
			
			numOuterRings: 7,
			
			ringLineWidth: 1,
			
			mainRingLineWidth: 2,
			
			numSpokes: 6,
			spokesStartAngle: Math.PI / 2,
			
			numRadiusLabels: 6,
			radiusLabelsStartAngle: Math.PI / 2,
			radiusLabelFont: "13px sans-serif",
			
			visible: false
		};
		
		if(settings)
			this.setOptions(settings);
	};
	
	map-block.ModernStoreLocatorCircle.createInstance = function(map, settings) {
		
		if(map-block.settings.engine == "google-maps")
			return new map-block.GoogleModernStoreLocatorCircle(map, settings);
		else
			return new map-block.OLModernStoreLocatorCircle(map, settings);
		
	};
	
	map-block.ModernStoreLocatorCircle.prototype.initCanvasLayer = function() {
		
	}
	
	map-block.ModernStoreLocatorCircle.prototype.onResize = function(event) { 
		this.draw();
	};
	
	map-block.ModernStoreLocatorCircle.prototype.onUpdate = function(event) { 
		this.draw();
	};
	
	map-block.ModernStoreLocatorCircle.prototype.setOptions = function(options) {
		for(var name in options)
		{
			var functionName = "set" + name.substr(0, 1).toUpperCase() + name.substr(1);
			
			if(typeof this[functionName] == "function")
				this[functionName](options[name]);
			else
				this.settings[name] = options[name];
		}
	};
	
	map-block.ModernStoreLocatorCircle.prototype.getResolutionScale = function() {
		return window.devicePixelRatio || 1;
	};
	
	map-block.ModernStoreLocatorCircle.prototype.getCenter = function() {
		return this.getPosition();
	};
	
	map-block.ModernStoreLocatorCircle.prototype.setCenter = function(value) {
		this.setPosition(value);
	};
	
	map-block.ModernStoreLocatorCircle.prototype.getPosition = function() {
		return this.settings.center;
	};
	
	map-block.ModernStoreLocatorCircle.prototype.setPosition = function(position) {
		this.settings.center = position;
	};
	
	map-block.ModernStoreLocatorCircle.prototype.getRadius = function() {
		return this.settings.radius;
	};
	
	map-block.ModernStoreLocatorCircle.prototype.setRadius = function(radius) {
		
		if(isNaN(radius))
			throw new Error("Invalid radius");
		
		this.settings.radius = radius;
	};
	
	map-block.ModernStoreLocatorCircle.prototype.getVisible = function(visible) {
		return this.settings.visible;
	};
	
	map-block.ModernStoreLocatorCircle.prototype.setVisible = function(visible) {
		this.settings.visible = visible;
	};
	
	/**
	 * This function transforms a km radius into canvas space
	 * @return number
	 */
	map-block.ModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		throw new Error("Abstract function called");
	}
	
	map-block.ModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		throw new Error("Abstract function called");
	}
	
	map-block.ModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		throw new Error("Abstract function called");
	}
	
	map-block.ModernStoreLocatorCircle.prototype.validateSettings = function()
	{
		if(!map-block.isHexColorString(this.settings.color))
			this.settings.color = "#63AFF2";
	}
	
	map-block.ModernStoreLocatorCircle.prototype.draw = function() {
		
		this.validateSettings();
		
		var settings = this.settings;
		var canvasDimensions = this.getCanvasDimensions();
		
        var canvasWidth = canvasDimensions.width;
        var canvasHeight = canvasDimensions.height;
		
		var map = this.map;
		var resolutionScale = this.getResolutionScale();
		
		context = this.getContext("2d");
        context.clearRect(0, 0, canvasWidth, canvasHeight);

		if(!settings.visible)
			return;
		
		context.shadowColor = settings.shadowColor;
		context.shadowBlur = settings.shadowBlur;
		
		// NB: 2018/02/13 - Left this here in case it needs to be calibrated more accurately
		/*if(!this.testCircle)
		{
			this.testCircle = new google.maps.Circle({
				strokeColor: "#ff0000",
				strokeOpacity: 0.5,
				strokeWeight: 3,
				map: this.map,
				center: this.settings.center
			});
		}
		
		this.testCircle.setCenter(settings.center);
		this.testCircle.setRadius(settings.radius * 1000);*/
		
        // Reset transform
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        var scale = this.getScale();
        context.scale(scale, scale);

		// Translate by world origin
		var offset = this.getWorldOriginOffset();
		context.translate(offset.x, offset.y);

        // Get center and project to pixel space
		var center = new map-block.LatLng(this.settings.center);
		var worldPoint = this.getCenterPixels();
		
		var rgba = map-block.hexToRgba(settings.color);
		var ringSpacing = this.getTransformedRadius(settings.radius) / (settings.numInnerRings + 1);
		
		// TODO: Implement gradients for color and opacity
		
		// Inside circle (fixed?)
        context.strokeStyle = settings.color;
		context.lineWidth = (1 / scale) * settings.centerRingLineWidth;
		
		context.beginPath();
		context.arc(
			worldPoint.x, 
			worldPoint.y, 
			this.getTransformedRadius(settings.centerRingRadius) / scale, 0, 2 * Math.PI
		);
		context.stroke();
		context.closePath();
		
		// Spokes
		var radius = this.getTransformedRadius(settings.radius) + (ringSpacing * settings.numOuterRings) + 1;
		var grad = context.createRadialGradient(0, 0, 0, 0, 0, radius);
		var rgba = map-block.hexToRgba(settings.color);
		var start = map-block.rgbaToString(rgba), end;
		var spokeAngle;
		
		rgba.a = 0;
		end = map-block.rgbaToString(rgba);
		
		grad.addColorStop(0, start);
		grad.addColorStop(1, end);
		
		context.save();
		
		context.translate(worldPoint.x, worldPoint.y);
		context.strokeStyle = grad;
		context.lineWidth = 2 / scale;
		
		for(var i = 0; i < settings.numSpokes; i++)
		{
			spokeAngle = settings.spokesStartAngle + (Math.PI * 2) * (i / settings.numSpokes);
			
			x = Math.cos(spokeAngle) * radius;
			y = Math.sin(spokeAngle) * radius;
			
			context.setLineDash([2 / scale, 15 / scale]);
			
			context.beginPath();
			context.moveTo(0, 0);
			context.lineTo(x, y);
			context.stroke();
		}
		
		context.setLineDash([]);
		
		context.restore();
		
		// Inner ringlets
		context.lineWidth = (1 / scale) * settings.innerRingLineWidth;
		
		for(var i = 1; i <= settings.numInnerRings; i++)
		{
			var radius = i * ringSpacing;
			
			if(settings.innerRingFade)
				rgba.a = 1 - (i - 1) / settings.numInnerRings;
			
			context.strokeStyle = map-block.rgbaToString(rgba);
			
			context.beginPath();
			context.arc(worldPoint.x, worldPoint.y, radius, 0, 2 * Math.PI);
			context.stroke();
			context.closePath();
		}
		
		// Main circle
		context.strokeStyle = settings.color;
		context.lineWidth = (1 / scale) * settings.centerRingLineWidth;
		
		context.beginPath();
		context.arc(worldPoint.x, worldPoint.y, this.getTransformedRadius(settings.radius), 0, 2 * Math.PI);
		context.stroke();
		context.closePath();
		
		// Outer ringlets
		var radius = radius + ringSpacing;
		for(var i = 0; i < settings.numOuterRings; i++)
		{
			if(settings.innerRingFade)
				rgba.a = 1 - i / settings.numOuterRings;
			
			context.strokeStyle = map-block.rgbaToString(rgba);
			
			context.beginPath();
			context.arc(worldPoint.x, worldPoint.y, radius, 0, 2 * Math.PI);
			context.stroke();
			context.closePath();
		
			radius += ringSpacing;
		}
		
		// Text
		if(settings.numRadiusLabels > 0)
		{
			var m;
			var radius = this.getTransformedRadius(settings.radius);
			var clipRadius = (12 * 1.1) / scale;
			var x, y;
			
			if(m = settings.radiusLabelFont.match(/(\d+)px/))
				clipRadius = (parseInt(m[1]) / 2 * 1.1) / scale;
			
			context.font = settings.radiusLabelFont;
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillStyle = settings.color;
			
			context.save();
			
			context.translate(worldPoint.x, worldPoint.y)
			
			for(var i = 0; i < settings.numRadiusLabels; i++)
			{
				var spokeAngle = settings.radiusLabelsStartAngle + (Math.PI * 2) * (i / settings.numRadiusLabels);
				var textAngle = spokeAngle + Math.PI / 2;
				var text = settings.radiusString;
				var width;
				
				if(Math.sin(spokeAngle) > 0)
					textAngle -= Math.PI;
				
				x = Math.cos(spokeAngle) * radius;
				y = Math.sin(spokeAngle) * radius;
				
				context.save();
				
				context.translate(x, y);
				
				context.rotate(textAngle);
				context.scale(1 / scale, 1 / scale);
				
				width = context.measureText(text).width;
				height = width / 2;
				context.clearRect(-width, -height, 2 * width, 2 * height);
				
				context.fillText(settings.radiusString, 0, 0);
				
				context.restore();
			}
			
			context.restore();
		}
	}
	
});

// js/v8/modern-store-locator.js
/**
 * @namespace map-block
 * @module ModernStoreLocator
 * @requires map-block
 */
jQuery(function($) {
	
	/**
	 * The new modern look store locator. It takes the elements
	 * from the default look and moves them into the map, wrapping
	 * in a new element so we can apply new styles.
	 * @return Object
	 */
	map-block.ModernStoreLocator = function(map_id)
	{
		var self = this;
		var original;
		
		map-block.assertInstanceOf(this, "ModernStoreLocator");
		
		if(map-block.isProVersion())
			original = $(".map-block_sl_search_button[mid='" + map_id + "']").closest(".map-block_sl_main_div");
		else
			original = $(".map-block_sl_search_button").closest(".map-block_sl_main_div");
		
		if(!original.length)
			return;
		
		// Build / re-arrange elements
		this.element = $("<div class='map-block-modern-store-locator'><div class='map-block-inner map-block-modern-hover-opaque'/></div>")[0];
		
		var inner = $(this.element).find(".map-block-inner");
		
		var titleSearch = $(original).find("[id='nameInput_" + map_id + "']");
		if(titleSearch.length)
		{
			var placeholder = map-blockaps_localize[map_id].other_settings.store_locator_name_string;
			if(placeholder && placeholder.length)
				titleSearch.attr("placeholder", placeholder);
			inner.append(titleSearch);
		}
		
		var addressInput;
		if(map-block.isProVersion())
			addressInput = $(original).find(".addressInput");
		else
			addressInput = $(original).find("#addressInput");
		
		if(map-blockaps_localize[map_id].other_settings.store_locator_query_string && map-blockaps_localize[map_id].other_settings.store_locator_query_string.length)
			addressInput.attr("placeholder", map-blockaps_localize[map_id].other_settings.store_locator_query_string);
		
		inner.append(addressInput);
		
		inner.append($(original).find("select.map-block_sl_radius_select"));
		// inner.append($(original).find(".map-block_filter_select_" + map_id));
		
		// Buttons
		this.searchButton = $(original).find( ".map-block_sl_search_button" );
		inner.append(this.searchButton);
		
		this.resetButton = $(original).find( ".map-block_sl_reset_button_div" );
		inner.append(this.resetButton);
		
		this.resetButton.on("click", function(event) {
			resetLocations(map_id);
		});
		
		this.resetButton.hide();
		
		if(map-block.isProVersion())
		{
			this.searchButton.on("click", function(event) {
				if($("addressInput_" + map_id).val() == 0)
					return;
				
				self.searchButton.hide();
				self.resetButton.show();
			});
			this.resetButton.on("click", function(event) {
				self.resetButton.hide();
				self.searchButton.show();
			});
		}
		
		// Distance type
		inner.append($("#map-block_distance_type_" + map_id));
		
		// Categories
		var container = $(original).find(".map-block_cat_checkbox_holder");
		var ul = $(container).children("ul");
		var items = $(container).find("li");
		var numCategories = 0;
		
		//$(items).find("ul").remove();
		//$(ul).append(items);
		
		var icons = [];
		
		items.each(function(index, el) {
			var id = $(el).attr("class").match(/\d+/);
			
			for(var category_id in map-block_category_data) {
				
				if(id == category_id) {
					var src = map-block_category_data[category_id].image;
					var icon = $('<div class="map-block-chip-icon"/>');
					
					icon.css({
						"background-image": "url('" + src + "')",
						"width": $("#map-block_cat_checkbox_" + category_id + " + label").height() + "px"
					});
					icons.push(icon);
					
                    if(src != null && src != ""){
					   //$(el).find("label").prepend(icon);
                       $("#map-block_cat_checkbox_" + category_id + " + label").prepend(icon);
                    }
					
					numCategories++;
					
					break;
				}
				
			}
		});

        $(this.element).append(container);

		
		if(numCategories) {
			this.optionsButton = $('<span class="map-block_store_locator_options_button"><i class="fas fa-list"></i></span>');
			$(this.searchButton).before(this.optionsButton);
		}
		
		setInterval(function() {
			
			icons.forEach(function(icon) {
				var height = $(icon).height();
				$(icon).css({"width": height + "px"});
				$(icon).closest("label").css({"padding-left": height + 8 + "px"});
			});
			
			$(container).css("width", $(self.element).find(".map-block-inner").outerWidth() + "px");
			
		}, 1000);
		
		$(this.element).find(".map-block_store_locator_options_button").on("click", function(event) {
			
			if(container.hasClass("map-block-open"))
				container.removeClass("map-block-open");
			else
				container.addClass("map-block-open");
			
		});
		
		// Remove original element
		$(original).remove();
		
		// Event listeners
		$(this.element).find("input, select").on("focus", function() {
			$(inner).addClass("active");
		});
		
		$(this.element).find("input, select").on("blur", function() {
			$(inner).removeClass("active");
		});
	}
	
	map-block.ModernStoreLocator.createInstance = function(map_id)
	{
		if(map-block.settings.engine == "google-maps")
			return new map-block.GoogleModernStoreLocator(map_id);
		else
			return new map-block.OLModernStoreLocator(map_id);
	}
	
});

// js/v8/polygon.js
/**
 * @namespace map-block
 * @module Polygon
 * @requires map-block.MapObject
 */
jQuery(function($) {
	map-block.Polygon = function(row, enginePolygon)
	{
		var self = this;
		
		map-block.assertInstanceOf(this, "Polygon");
		
		this.paths = null;
		this.title = null;
		this.name = null;
		this.link = null;
		
		map-block.MapObject.apply(this, arguments);
	}
	
	map-block.Polygon.prototype = Object.create(map-block.MapObject.prototype);
	map-block.Polygon.prototype.constructor = map-block.Polygon;
	
	map-block.Polygon.getConstructor = function()
	{
		switch(map-block.settings.engine)
		{
			case "open-layers":
				if(map-block.isProVersion())
					return map-block.OLProPolygon;
				return map-block.OLPolygon;
				break;
			
			default:
				if(map-block.isProVersion())
					return map-block.GoogleProPolygon;
				return map-block.GooglePolygon;
				break;
		}
	}
	
	map-block.Polygon.createInstance = function(row, engineObject)
	{
		var constructor = map-block.Polygon.getConstructor();
		return new constructor(row, engineObject);
	}
	
	map-block.Polygon.prototype.toJSON = function()
	{
		var result = map-block.MapObject.prototype.toJSON.call(this);
		
		$.extend(result, {
			name:		this.name,
			title:		this.title,
			link:		this.link,
		});
	
		return result;
	}
	
});

// js/v8/polyline.js
/**
 * @namespace map-block
 * @module Polyline
 * @requires map-block.MapObject
 */
jQuery(function($) {
	map-block.Polyline = function(row, googlePolyline)
	{
		var self = this;
		
		map-block.assertInstanceOf(this, "Polyline");
		
		this.title = null;
		
		map-block.MapObject.apply(this, arguments);
	}
	
	map-block.Polyline.prototype = Object.create(map-block.MapObject.prototype);
	map-block.Polyline.prototype.constructor = map-block.Polyline;
	
	map-block.Polyline.getConstructor = function()
	{
		switch(map-block.settings.engine)
		{
			case "open-layers":
				return map-block.OLPolyline;
				break;
			
			default:
				return map-block.GooglePolyline;
				break;
		}
	}
	
	map-block.Polyline.createInstance = function(row, engineObject)
	{
		var constructor = map-block.Polyline.getConstructor();
		return new constructor(row, engineObject);
	}
	
	map-block.Polyline.prototype.getPoints = function()
	{
		return this.toJSON().points;
	}
	
	map-block.Polyline.prototype.toJSON = function()
	{
		var result = map-block.MapObject.prototype.toJSON.call(this);
		
		result.title = this.title;
		
		return result;
	}
	
	
});

// js/v8/rest-api.js
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

// js/v8/version.js
/**
 * @namespace map-block
 * @module Version
 * @requires map-block
 */
jQuery(function($) {

	function isPositiveInteger(x) {
		// http://stackoverflow.com/a/1019526/11236
		return /^\d+$/.test(x);
	}

	function validateParts(parts) {
		for (var i = 0; i < parts.length; ++i) {
			if (!isPositiveInteger(parts[i])) {
				return false;
			}
		}
		return true;
	}
	
	map-block.Version = function()
	{
		
	}
	
	/**
	 * Compare two software version numbers (e.g. 1.7.1)
	 * Returns:
	 *
	 *  0 if they're identical
	 *  negative if v1 < v2
	 *  positive if v1 > v2
	 *  NaN if they in the wrong format
	 *
	 *  "Unit tests": http://jsfiddle.net/ripper234/Xv9WL/28/
	 *
	 *  Taken from http://stackoverflow.com/a/6832721/11236
	 */
	map-block.Version.compare = function(v1, v2)
	{
		var v1parts = v1.split('.');
		var v2parts = v2.split('.');

		// First, validate both numbers are true version numbers
		if (!validateParts(v1parts) || !validateParts(v2parts)) {
			return NaN;
		}

		for (var i = 0; i < v1parts.length; ++i) {
			if (v2parts.length === i) {
				return 1;
			}

			if (v1parts[i] === v2parts[i]) {
				continue;
			}
			if (v1parts[i] > v2parts[i]) {
				return 1;
			}
			return -1;
		}

		if (v1parts.length != v2parts.length) {
			return -1;
		}

		return 0;
	}

});

// js/v8/3rd-party-integration/integration.js
/**
 * @namespace map-block
 * @module Integration
 * @requires map-block
 */
jQuery(function($) {
	
	map-block.Integration = {};
	map-block.integrationModules = {};
	
});

// js/v8/3rd-party-integration/gutenberg/dist/gutenberg.js
"use strict";

/**
 * @namespace map-block.Integration
 * @module Gutenberg
 * @requires map-block.Integration
 * @requires wp-i18n
 * @requires wp-blocks
 * @requires wp-editor
 * @requires wp-components
 */

/**
 * Internal block libraries
 */
jQuery(function ($) {

	if (!wp || !wp.i18n || !wp.blocks) return;

	var __ = wp.i18n.__;
	var registerBlockType = wp.blocks.registerBlockType;
	var _wp$editor = wp.editor,
	    InspectorControls = _wp$editor.InspectorControls,
	    BlockControls = _wp$editor.BlockControls;
	var _wp$components = wp.components,
	    Dashicon = _wp$components.Dashicon,
	    Toolbar = _wp$components.Toolbar,
	    Button = _wp$components.Button,
	    Tooltip = _wp$components.Tooltip,
	    PanelBody = _wp$components.PanelBody,
	    TextareaControl = _wp$components.TextareaControl,
	    TextControl = _wp$components.TextControl,
	    RichText = _wp$components.RichText;


	map-block.Integration.Gutenberg = function () {
		registerBlockType('gutenberg-map-block/block', this.getBlockDefinition());
	};

	map-block.Integration.Gutenberg.prototype.getBlockTitle = function () {
		return __("Map Block");
	};

	map-block.Integration.Gutenberg.prototype.getBlockInspectorControls = function (props) {
		return React.createElement(
			InspectorControls,
			{ key: "inspector" },
			React.createElement(PanelBody, { title: __('Map Settings') })
		);
	};

	map-block.Integration.Gutenberg.prototype.getBlockAttributes = function () {
		return {};
	};

	map-block.Integration.Gutenberg.prototype.getBlockDefinition = function (props) {
		var _this = this;

		return {

			title: __("Map Block"),
			description: __('The easiest to use Google Maps plugin! Create custom Google Maps with high quality markers containing locations, descriptions, images and links. Add your customized map to your WordPress posts and/or pages quickly and easily with the supplied shortcode. No fuss.'),
			category: 'common',
			icon: 'location-alt',
			keywords: [__('Map'), __('Maps'), __('Google')],
			attributes: this.getBlockAttributes(),

			edit: function edit(props) {
				return [!!props.isSelected && _this.getBlockInspectorControls(props), React.createElement(
					"div",
					{ className: props.className + " map-block-gutenberg-block" },
					React.createElement(Dashicon, { icon: "location-alt" }),
					React.createElement(
						"span",
						{ "class": "map-block-gutenberg-block-title" },
						__("Map Block")
					)
				)];
			},
			// Defining the front-end interface
			save: function save(props) {
				// Rendering in PHP
				return null;
			}

		};
	};

	map-block.Integration.Gutenberg.getConstructor = function () {
		return map-block.Integration.Gutenberg;
	};

	map-block.Integration.Gutenberg.createInstance = function () {
		var constructor = map-block.Integration.Gutenberg.getConstructor();
		return new constructor();
	};

	// Allow the Pro module to extend and create the module, only create here when Pro isn't loaded
	if (!map-block.isProVersion()) map-block.integrationModules.gutenberg = map-block.Integration.Gutenberg.createInstance();
});

// js/v8/compatibility/google-ui-compatibility.js
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

// js/v8/google-maps/google-circle.js
/**
 * @namespace map-block
 * @module GoogleCircle
 * @requires map-block.Circle
 */
jQuery(function($) {
	
	map-block.GoogleCircle = function(options, googleCircle)
	{
		var self = this;
		
		map-block.Circle.call(this, options, googleCircle);
		
		if(googleCircle)
		{
			this.googleCircle = googleCircle;
		}
		else
		{
			this.googleCircle = new google.maps.Circle();
			this.googleCircle.map-blockCircle = this;
		}
		
		google.maps.event.addListener(this.googleCircle, "click", function() {
			self.dispatchEvent({type: "click"});
		});
		
		if(options)
		{
			var googleOptions = {};
			
			googleOptions = $.extend({}, options);
			delete googleOptions.map;
			delete googleOptions.center;
			
			if(options.center)
				googleOptions.center = new google.maps.LatLng({
					lat: options.center.lat,
					lng: options.center.lng
				});
			
			this.googleCircle.setOptions(googleOptions);
			
			if(options.map)
				options.map.addCircle(this);
		}
	}
	
	map-block.GoogleCircle.prototype = Object.create(map-block.Circle.prototype);
	map-block.GoogleCircle.prototype.constructor = map-block.GoogleCircle;
	
});

// js/v8/google-maps/google-geocoder.js
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

// js/v8/google-maps/google-info-window.js
/**
 * @namespace map-block
 * @module GoogleInfoWindow
 * @requires map-block.InfoWindow
 * @pro-requires map-block.ProInfoWindow
 */
jQuery(function($) {
	
	var Parent;
	
	map-block.GoogleInfoWindow = function(mapObject)
	{
		Parent.call(this, mapObject);
		
		this.setMapObject(mapObject);
	}
	
	if(map-block.isProVersion())
		Parent = map-block.ProInfoWindow;
	else
		Parent = map-block.InfoWindow;
	
	map-block.GoogleInfoWindow.prototype = Object.create(Parent.prototype);
	map-block.GoogleInfoWindow.prototype.constructor = map-block.GoogleInfoWindow;
	
	map-block.GoogleInfoWindow.prototype.setMapObject = function(mapObject)
	{
		if(mapObject instanceof map-block.Marker)
			this.googleObject = mapObject.googleMarker;
		else if(mapObject instanceof map-block.Polygon)
			this.googleObject = mapObject.googlePolygon;
		else if(mapObject instanceof map-block.Polyline)
			this.googleObject = mapObject.googlePolyline;
	}
	
	map-block.GoogleInfoWindow.prototype.createGoogleInfoWindow = function()
	{
		if(this.googleInfoWindow)
			return;
		
		this.googleInfoWindow = new google.maps.InfoWindow();
	}
	
	/**
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	map-block.GoogleInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		if(!Parent.prototype.open.call(this, map, mapObject))
			return false;
		
		this.createGoogleInfoWindow();
		this.setMapObject(mapObject);
		
		this.googleInfoWindow.open(
			this.mapObject.map.googleMap,
			this.googleObject
		);
		
		if(this.content)
			this.googleInfoWindow.setContent(this.content);
		
		//this.
		
		/*this.getContent(function(html) {
			
			// Wrap HTML with unique ID
			var guid = map-block.guid();
			var html = "<div id='" + guid + "'>" + html + "</div>";
			var div, intervalID;
			
			self.googleInfoWindow.setContent(html);
			self.googleInfoWindow.open(
				self.mapObject.map.googleMap,
				self.googleObject
			);
			
			intervalID = setInterval(function(event) {
				
				div = $("#" + guid);
				
				if(div.find(".gm-style-iw").length)
				{
					div[0].map-blockMapObject = self.mapObject;
					
					self.dispatchEvent("infowindowopen");
					div.trigger("infowindowopen");
					clearInterval(intervalID);
				}
				
			}, 50);
			
		});*/
		
		return true;
	}
	
	map-block.GoogleInfoWindow.prototype.close = function()
	{
		if(!this.googleInfoWindow)
			return;
		
		map-block.InfoWindow.prototype.close.call(this);
		
		this.googleInfoWindow.close();
	}
	
	map-block.GoogleInfoWindow.prototype.setContent = function(html)
	{
		Parent.prototype.setContent.call(this, html);
		
		this.content = html;
		
		this.createGoogleInfoWindow();
		
		this.googleInfoWindow.setContent(html);
	}
	
	map-block.GoogleInfoWindow.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		this.createGoogleInfoWindow();
		
		this.googleInfoWindow.setOptions(options);
	}
	
});

// js/v8/google-maps/google-map.js
/**
 * @namespace map-block
 * @module GoogleMap
 * @requires map-block.Map
 * @pro-requires map-block.ProMap
 */
jQuery(function($) {
	var Parent;
	
	/**
	 * Constructor
	 * @param element to contain the map
	 */
	map-block.GoogleMap = function(element, options)
	{
		var self = this;
		
		Parent.call(this, element, options);
		
		if(!window.google)
		{
			var status = map-block.googleAPIStatus;
			var message = "Google API not loaded";
			
			if(status && status.message)
				message += " - " + status.message;
			
			if(status.code == "USER_CONSENT_NOT_GIVEN")
			{
				return;
			}
			
			$(element).html("<div class='notice notice-error'><p>" + map-block.localized_strings.google_api_not_loaded + "<pre>" + message + "</pre></p></div>");
			
			throw new Error(message);
		}
		
		this.loadGoogleMap();
		
		if(options)
			this.setOptions(options);

		google.maps.event.addListener(this.googleMap, "click", function(event) {
			var map-blockEvent = new map-block.Event("click");
			map-blockEvent.latLng = {
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			self.dispatchEvent(map-blockEvent);
		});
		
		google.maps.event.addListener(this.googleMap, "rightclick", function(event) {
			var map-blockEvent = new map-block.Event("rightclick");
			map-blockEvent.latLng = {
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			self.dispatchEvent(map-blockEvent);
		});
		
		google.maps.event.addListener(this.googleMap, "dragend", function(event) {
			self.dispatchEvent("dragend");
		});
		
		google.maps.event.addListener(this.googleMap, "zoom_changed", function(event) {
			self.dispatchEvent("zoom_changed");
			self.dispatchEvent("zoomchanged");
		});
		
		// Idle event
		google.maps.event.addListener(this.googleMap, "idle", function(event) {
			self.onIdle(event);
		});
		
		// Dispatch event
		if(!map-block.isProVersion())
		{
			this.dispatchEvent("created");
			map-block.events.dispatchEvent({type: "mapcreated", map: this});
		}
	}
	
	// If we're running the Pro version, inherit from ProMap, otherwise, inherit from Map
	if(map-block.isProVersion())
	{
		Parent = map-block.ProMap;
		map-block.GoogleMap.prototype = Object.create(map-block.ProMap.prototype);
	}
	else
	{
		Parent = map-block.Map;
		map-block.GoogleMap.prototype = Object.create(map-block.Map.prototype);
	}
	map-block.GoogleMap.prototype.constructor = map-block.GoogleMap;
	
	/**
	 * Creates the Google Maps map
	 * @return void
	 */
	map-block.GoogleMap.prototype.loadGoogleMap = function()
	{
		var self = this;
		var options = this.settings.toGoogleMapsOptions();
		
		this.googleMap = new google.maps.Map(this.engineElement, options);
		google.maps.event.addListener(this.googleMap, "bounds_changed", function() { 
			self.onBoundsChanged();
		});
		
		if(this.settings.bicycle == 1)
			this.enableBicycleLayer(true);
		if(this.settings.traffic == 1)
			this.enableTrafficLayer(true);
		if(this.settings.transport == 1)
			this.enablePublicTransportLayer(true);
		this.showPointsOfInterest(this.settings.show_points_of_interest);
		
		// Move the loading wheel into the map element (it has to live outside in the HTML file because it'll be overwritten by Google otherwise)
		$(this.engineElement).append($(this.element).find(".map-block-loader"));
	}
	
	map-block.GoogleMap.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		this.googleMap.setOptions(this.settings.toGoogleMapsOptions());
		
		var clone = $.extend({}, options);
		if(clone.center instanceof map-block.LatLng || typeof clone.center == "object")
			clone.center = {
				lat: parseFloat(clone.center.lat),
				lng: parseFloat(clone.center.lng)
			};
		
		this.googleMap.setOptions(clone);
	}
	
	/**
	 * Adds the specified marker to this map
	 * @return void
	 */
	map-block.GoogleMap.prototype.addMarker = function(marker)
	{
		marker.googleMarker.setMap(this.googleMap);
		
		Parent.prototype.addMarker.call(this, marker);
	}
	
	/**
	 * Removes the specified marker from this map
	 * @return void
	 */
	map-block.GoogleMap.prototype.removeMarker = function(marker)
	{
		marker.googleMarker.setMap(null);
		
		Parent.prototype.removeMarker.call(this, marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @return void
	 */
	map-block.GoogleMap.prototype.addPolygon = function(polygon)
	{
		polygon.googlePolygon.setMap(this.googleMap);
		
		Parent.prototype.addPolygon.call(this, polygon);
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	map-block.GoogleMap.prototype.removePolygon = function(polygon)
	{
		polygon.googlePolygon.setMap(null);
		
		Parent.prototype.removePolygon.call(this, polygon);
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @return void
	 */
	map-block.GoogleMap.prototype.addPolyline = function(polyline)
	{
		polyline.googlePolyline.setMap(this.googleMap);
		
		Parent.prototype.addPolyline.call(this, polyline);
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	map-block.GoogleMap.prototype.removePolyline = function(polyline)
	{
		polyline.googlePolyline.setMap(null);
		
		Parent.prototype.removePolyline.call(this, polyline);
	}
	
	map-block.GoogleMap.prototype.addCircle = function(circle)
	{
		circle.googleCircle.setMap(this.googleMap);
		
		Parent.prototype.addCircle.call(this, circle);
	}
	
	map-block.GoogleMap.prototype.removeCircle = function(circle)
	{
		circle.googleCircle.setMap(null);
		
		Parent.prototype.removeCircle.call(this, circle);
	}
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	map-block.GoogleMap.prototype.getCenter = function()
	{
		var latLng = this.googleMap.getCenter();
		
		return {
			lat: latLng.lat(),
			lng: latLng.lng()
		};
	}
	
	/**
	 * Delegate for google maps setCenter
	 * @return void
	 */
	map-block.GoogleMap.prototype.setCenter = function(latLng)
	{
		map-block.Map.prototype.setCenter.call(this, latLng);
		
		if(latLng instanceof map-block.LatLng)
			this.googleMap.setCenter({
				lat: latLng.lat,
				lng: latLng.lng
			});
		else
			this.googleMap.setCenter(latLng);
	}
	
	/**
	 * Delegate for google maps setPan
	 * @return void
	 */
	map-block.GoogleMap.prototype.panTo = function(latLng)
	{
		if(latLng instanceof map-block.LatLng)
			this.googleMap.panTo({
				lat: latLng.lat,
				lng: latLng.lng
			});
		else
			this.googleMap.panTo(latLng);
	}
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	map-block.GoogleMap.prototype.getZoom = function()
	{
		return this.googleMap.getZoom();
	}
	
	/**
	 * Delegate for google maps getZoom
	 * @return void
	 */
	map-block.GoogleMap.prototype.setZoom = function(value)
	{
		if(isNaN(value))
			throw new Error("Value must not be NaN");
		
		return this.googleMap.setZoom(value);
	}
	
	/**
	 * Gets the bounds
	 * @return object
	 */
	map-block.GoogleMap.prototype.getBounds = function()
	{
		var bounds = this.googleMap.getBounds();
		var northEast = bounds.getNorthEast();
		var southWest = bounds.getSouthWest();
		
		return {
			topLeft: {
				lat: northEast.lat(),
				lng: southWest.lng()
			},
			bottomRight: {
				lat: southWest.lat(),
				lng: northEast.lng()
			}
		};
	}
	
	/**
	 * Fit to given boundaries
	 * @return void
	 */
	map-block.GoogleMap.prototype.fitBounds = function(southWest, northEast)
	{
		if(southWest instanceof map-block.LatLng)
			southWest = {lat: southWest.lat, lng: southWest.lng};
		if(northEast instanceof map-block.LatLng)
			northEast = {lat: northEast.lat, lng: northEast.lng};
		
		this.googleMap.fitBounds(southWest, northEast);
	}
	
	/**
	 * Fit the map boundaries to visible markers
	 * @return void
	 */
	map-block.GoogleMap.prototype.fitBoundsToVisibleMarkers = function()
	{
		var bounds = new google.maps.LatLngBounds();
		for(var i = 0; i < this.markers.length; i++)
		{
			if(markers[i].getVisible())
				bounds.extend(markers[i].getPosition());
		}
		this.googleMap.fitBounds(bounds);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	map-block.GoogleMap.prototype.enableBicycleLayer = function(enable)
	{
		if(!this.bicycleLayer)
			this.bicycleLayer = new google.maps.BicyclingLayer();
		
		this.bicycleLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	map-block.GoogleMap.prototype.enableTrafficLayer = function(enable)
	{
		if(!this.trafficLayer)
			this.trafficLayer = new google.maps.TrafficLayer();
		
		this.trafficLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	map-block.GoogleMap.prototype.enablePublicTransportLayer = function(enable)
	{
		if(!this.publicTransportLayer)
			this.publicTransportLayer = new google.maps.TransitLayer();
		
		this.publicTransportLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Shows / hides points of interest
	 * @param show boolean, enable or not
	 * @return void
	 */
	map-block.GoogleMap.prototype.showPointsOfInterest = function(show)
	{
		// TODO: This will bug the front end because there is textarea with theme data
		var text = $("textarea[name='theme_data']").val();
		
		if(!text)
			return;
		
		var styles = JSON.parse(text);
		
		styles.push({
			featureType: "poi",
			stylers: [
				{
					visibility: (show ? "on" : "off")
				}
			]
		});
		
		this.googleMap.setOptions({styles: styles});
	}
	
	/**
	 * Gets the min zoom of the map
	 * @return int
	 */
	map-block.GoogleMap.prototype.getMinZoom = function()
	{
		return parseInt(this.settings.min_zoom);
	}
	
	/**
	 * Sets the min zoom of the map
	 * @return void
	 */
	map-block.GoogleMap.prototype.setMinZoom = function(value)
	{
		this.googleMap.setOptions({
			minZoom: value,
			maxZoom: this.getMaxZoom()
		});
	}
	
	/**
	 * Gets the min zoom of the map
	 * @return int
	 */
	map-block.GoogleMap.prototype.getMaxZoom = function()
	{
		return parseInt(this.settings.max_zoom);
	}
	
	/**
	 * Sets the min zoom of the map
	 * @return void
	 */
	map-block.GoogleMap.prototype.setMaxZoom = function(value)
	{
		this.googleMap.setOptions({
			minZoom: this.getMinZoom(),
			maxZoom: value
		});
	}
	
	map-block.GoogleMap.prototype.latLngToPixels = function(latLng)
	{
		var map = this.googleMap;
		var nativeLatLng = new google.maps.LatLng({
			lat: parseFloat(latLng.lat),
			lng: parseFloat(latLng.lng)
		});
		var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
		var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
		var scale = Math.pow(2, map.getZoom());
		var worldPoint = map.getProjection().fromLatLngToPoint(nativeLatLng);
		return {
			x: (worldPoint.x - bottomLeft.x) * scale, 
			y: (worldPoint.y - topRight.y) * scale
		};
	}
	
	map-block.GoogleMap.prototype.pixelsToLatLng = function(x, y)
	{
		if(y == undefined)
		{
			if("x" in x && "y" in x)
			{
				y = x.y;
				x = x.x;
			}
			else
				console.warn("Y coordinate undefined in pixelsToLatLng (did you mean to pass 2 arguments?)");
		}
		
		var map = this.googleMap;
		var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
		var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
		var scale = Math.pow(2, map.getZoom());
		var worldPoint = new google.maps.Point(x / scale + bottomLeft.x, y / scale + topRight.y);
		var latLng = map.getProjection().fromPointToLatLng(worldPoint);
		return {
			lat: latLng.lat(),
			lng: latLng.lng()
		};
	}
	
	/**
	 * Handle the map element resizing
	 * @return void
	 */
	map-block.GoogleMap.prototype.onElementResized = function(event)
	{
		if(!this.googleMap)
			return;
		google.maps.event.trigger(this.googleMap, "resize");
	}
	
});

// js/v8/google-maps/google-marker.js
/**
 * @namespace map-block
 * @module GoogleMarker
 * @requires map-block.Marker
 * @pro-requires map-block.ProMarker
 */
jQuery(function($) {
	
	var Parent;
	
	map-block.GoogleMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);
		
		var settings = {};
		if(row)
		{
			for(var name in row)
			{
				if(row[name] instanceof map-block.LatLng)
				{
					settings[name] = row[name].toGoogleLatLng();
				}
				else if(row[name] instanceof map-block.Map)
				{
					// Do nothing (ignore)
				}
				else
					settings[name] = row[name];
			}
		}
		
		this.googleMarker = new google.maps.Marker(settings);
		this.googleMarker.map-blockMarker = this;
		
		this.googleMarker.setPosition(new google.maps.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		}));
			
		this.googleMarker.setLabel(this.settings.label);
		
		if(this.animation)
			this.googleMarker.setAnimation(this.animation);
			
		google.maps.event.addListener(this.googleMarker, "click", function() {
			self.dispatchEvent("click");
			self.dispatchEvent("select");
		});
		
		google.maps.event.addListener(this.googleMarker, "mouseover", function() {
			self.dispatchEvent("mouseover");
		});
		
		google.maps.event.addListener(this.googleMarker, "dragend", function() {
			var googleMarkerPosition = self.googleMarker.getPosition();
			
			self.setPosition({
				lat: googleMarkerPosition.lat(),
				lng: googleMarkerPosition.lng()
			});
			
			self.dispatchEvent({
				type: "dragend",
				latLng: self.getPosition()
			});
		});
		
		this.trigger("init");
	}
	
	if(map-block.isProVersion())
		Parent = map-block.ProMarker;
	else
		Parent = map-block.Marker;
	map-block.GoogleMarker.prototype = Object.create(Parent.prototype);
	map-block.GoogleMarker.prototype.constructor = map-block.GoogleMarker;
	
	map-block.GoogleMarker.prototype.setLabel = function(label)
	{
		if(!label)
		{
			this.googleMarker.setLabel(null);
			return;
		}
		
		this.googleMarker.setLabel({
			text: label
		});
		
		if(!this.googleMarker.getIcon())
			this.googleMarker.setIcon(map-block.settings.default_marker_icon);
	}
	
	/**
	 * Sets the position of the marker
	 * @return void
	 */
	map-block.GoogleMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);
		this.googleMarker.setPosition({
			lat: this.lat,
			lng: this.lng
		});
	}
	
	/**
	 * Sets the position offset of a marker
	 * @return void
	 */
	map-block.GoogleMarker.prototype.setOffset = function(x, y)
	{
		var self = this;
		var icon = this.googleMarker.getIcon();
		var img = new Image();
		var params;
		
		if(typeof icon == "string")
			params = {
				url: icon
			};
		else
			params = icon;
		
		img.onload = function()
		{
			var defaultAnchor = {
				x: img.width / 2,
				y: img.height
			};
			
			params.anchor = new google.maps.Point(defaultAnchor.x - x, defaultAnchor.y - y);
			
			self.googleMarker.setIcon(params);
		}
		
		img.src = params.url;
	}
	
	map-block.GoogleMarker.prototype.setOptions = function(options)
	{
		this.googleMarker.setOptions(options);
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	map-block.GoogleMarker.prototype.setAnimation = function(animation)
	{
		Parent.prototype.setAnimation.call(this, animation);
		this.googleMarker.setAnimation(animation);
	}
	
	/**
	 * Sets the visibility of the marker
	 * @return void
	 */
	map-block.GoogleMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible.call(this, visible);
		
		this.googleMarker.setVisible(visible);
	}
	
	map-block.GoogleMarker.prototype.setDraggable = function(draggable)
	{
		this.googleMarker.setDraggable(draggable);
	}
	
});

// js/v8/google-maps/google-modern-store-locator-circle.js
/**
 * @namespace map-block
 * @module GoogleModernStoreLocatorCircle
 * @requires map-block.ModernStoreLocatorCircle
 */
jQuery(function($) {
	
	map-block.GoogleModernStoreLocatorCircle = function(map, settings)
	{
		var self = this;
		
		map-block.ModernStoreLocatorCircle.call(this, map, settings);
		
		this.intervalID = setInterval(function() {
			
			var mapSize = {
				width: $(self.mapElement).width(),
				height: $(self.mapElement).height()
			};
			
			if(mapSize.width == self.mapSize.width && mapSize.height == self.mapSize.height)
				return;
			
			self.canvasLayer.resize_();
			self.canvasLayer.draw();
			
			self.mapSize = mapSize;
			
		}, 1000);
		
		$(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
			
			self.canvasLayer.resize_();
			self.canvasLayer.draw();
			
		});
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype = Object.create(map-block.ModernStoreLocatorCircle.prototype);
	map-block.GoogleModernStoreLocatorCircle.prototype.constructor = map-block.GoogleModernStoreLocatorCircle;
	
	map-block.GoogleModernStoreLocatorCircle.prototype.initCanvasLayer = function()
	{
		var self = this;
		
		if(this.canvasLayer)
		{
			this.canvasLayer.setMap(null);
			this.canvasLayer.setAnimate(false);
		}
		
		this.canvasLayer = new CanvasLayer({
			map: this.map.googleMap,
			resizeHandler: function(event) {
				self.onResize(event);
			},
			updateHandler: function(event) {
				self.onUpdate(event);
			},
			animate: true,
			resolutionScale: this.getResolutionScale()
        });
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.setOptions = function(options)
	{
		map-block.ModernStoreLocatorCircle.prototype.setOptions.call(this, options);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.setPosition = function(position)
	{
		map-block.ModernStoreLocatorCircle.prototype.setPosition.call(this, position);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.setRadius = function(radius)
	{
		map-block.ModernStoreLocatorCircle.prototype.setRadius.call(this, radius);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		var multiplierAtEquator = 0.006395;
		var spherical = google.maps.geometry.spherical;
		
		var center = this.settings.center;
		var equator = new map-block.LatLng({
			lat: 0.0,
			lng: 0.0
		});
		var latitude = new map-block.LatLng({
			lat: center.lat,
			lng: 0.0
		});
		
		var offsetAtEquator = spherical.computeOffset(equator.toGoogleLatLng(), km * 1000, 90);
		var offsetAtLatitude = spherical.computeOffset(latitude.toGoogleLatLng(), km * 1000, 90);
		
		var factor = offsetAtLatitude.lng() / offsetAtEquator.lng();
		var result = km * multiplierAtEquator * factor;
		
		if(isNaN(result))
			throw new Error("here");
		
		return result;
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		return {
			width: this.canvasLayer.canvas.width,
			height: this.canvasLayer.canvas.height
		};
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.getWorldOriginOffset = function()
	{
		var projection = this.map.googleMap.getProjection();
		var position = projection.fromLatLngToPoint(this.canvasLayer.getTopLeft());
		
		return {
			x: -position.x,
			y: -position.y
		};
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.getCenterPixels = function()
	{
		var center = new map-block.LatLng(this.settings.center);
		var projection = this.map.googleMap.getProjection();
		return projection.fromLatLngToPoint(center.toGoogleLatLng());
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		return this.canvasLayer.canvas.getContext("2d");
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.getScale = function()
	{
		return Math.pow(2, this.map.getZoom()) * this.getResolutionScale();
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.setVisible = function(visible)
	{
		map-block.ModernStoreLocatorCircle.prototype.setVisible.call(this, visible);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	map-block.GoogleModernStoreLocatorCircle.prototype.destroy = function()
	{
		this.canvasLayer.setMap(null);
		this.canvasLayer = null;
		
		clearInterval(this.intervalID);
	}
	
});

// js/v8/google-maps/google-modern-store-locator.js
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

// js/v8/google-maps/google-polygon.js
/**
 * @namespace map-block
 * @module GooglePolygon
 * @requires map-block.Polygon
 * @pro-requires map-block.ProPolygon
 */
jQuery(function($) {
	
	var Parent;
	
	map-block.GooglePolygon = function(row, googlePolygon)
	{
		var self = this;
		
		Parent.call(this, row, googlePolygon);
		
		if(googlePolygon)
		{
			this.googlePolygon = googlePolygon;
		}
		else
		{
			this.googlePolygon = new google.maps.Polygon(this.settings);
			
			if(row && row.points)
			{
				var paths = this.parseGeometry(row.points);
				this.googlePolygon.setOptions({paths: paths});
			}
		}
		
		this.googlePolygon.map-blockPolygon = this;
			
		google.maps.event.addListener(this.googlePolygon, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	if(map-block.isProVersion())
		Parent = map-block.ProPolygon;
	else
		Parent = map-block.Polygon;
		
	map-block.GooglePolygon.prototype = Object.create(Parent.prototype);
	map-block.GooglePolygon.prototype.constructor = map-block.GooglePolygon;
	
	/**
	 * Returns true if the polygon is editable
	 * @return void
	 */
	map-block.GooglePolygon.prototype.getEditable = function()
	{
		return this.googlePolygon.getOptions().editable;
	}
	
	/**
	 * Sets the editable state of the polygon
	 * @return void
	 */
	map-block.GooglePolygon.prototype.setEditable = function(value)
	{
		this.googlePolygon.setOptions({editable: value});
	}
	
	/**
	 * Returns the polygon represented by a JSON object
	 * @return object
	 */
	map-block.GooglePolygon.prototype.toJSON = function()
	{
		var result = map-block.Polygon.prototype.toJSON.call(this);
		
		result.points = [];
		
		// TODO: Support holes using multiple paths
		var path = this.googlePolygon.getPath();
		for(var i = 0; i < path.getLength(); i++)
		{
			var latLng = path.getAt(i);
			result.points.push({
				lat: latLng.lat(),
				lng: latLng.lng()
			});
		}
		
		return result;
	}
	
});

// js/v8/google-maps/google-polyline.js
/**
 * @namespace map-block
 * @module GooglePolyline
 * @requires map-block.Polyline
 */
jQuery(function($) {
	
	map-block.GooglePolyline = function(row, googlePolyline)
	{
		var self = this;
		
		map-block.Polyline.call(this, row, googlePolyline);
		
		if(googlePolyline)
		{
			this.googlePolyline = googlePolyline;
		}
		else
		{
			this.googlePolyline = new google.maps.Polyline(this.settings);			
			this.googlePolyline.map-blockPolyline = this;
			
			if(row && row.points)
			{
				var path = this.parseGeometry(row.points);
				this.setPoints(path);
			}
		}
		
		google.maps.event.addListener(this.googlePolyline, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	map-block.GooglePolyline.prototype = Object.create(map-block.Polyline.prototype);
	map-block.GooglePolyline.prototype.constructor = map-block.GooglePolyline;
	
	map-block.GooglePolyline.prototype.setEditable = function(value)
	{
		this.googlePolyline.setOptions({editable: value});
	}
	
	map-block.GooglePolyline.prototype.setPoints = function(points)
	{
		this.googlePolyline.setOptions({path: points});
	}
	
	map-block.GooglePolyline.prototype.toJSON = function()
	{
		var result = map-block.Polyline.prototype.toJSON.call(this);
		
		result.points = [];
		
		var path = this.googlePolyline.getPath();
		for(var i = 0; i < path.getLength(); i++)
		{
			var latLng = path.getAt(i);
			result.points.push({
				lat: latLng.lat(),
				lng: latLng.lng()
			});
		}
		
		return result;
	}
	
});

// js/v8/google-maps/google-vertex-context-menu.js
/**
 * @namespace map-block
 * @module GoogleVertexContextMenu
 * @requires map-block_api_call
 */
jQuery(function($) {
	
	if(map-block.settings.engine != "google-maps")
		return;
	
	if(map-block.googleAPIStatus && map-block.googleAPIStatus.code == "USER_CONSENT_NOT_GIVEN")
		return;
	
	map-block.GoogleVertexContextMenu = function(mapEditPage)
	{
		var self = this;
		
		this.mapEditPage = mapEditPage;
		
		this.element = document.createElement("div");
		this.element.className = "map-block-vertex-context-menu";
		this.element.innerHTML = "Delete";
		
		google.maps.event.addDomListener(this.element, "click", function(event) {
			self.removeVertex();
			event.preventDefault();
			event.stopPropagation();
			return false;
		});
	}
	
	map-block.GoogleVertexContextMenu.prototype = new google.maps.OverlayView();
	
	map-block.GoogleVertexContextMenu.prototype.onAdd = function()
	{
		var self = this;
		var map = this.getMap();
		
		this.getPanes().floatPane.appendChild(this.element);
		this.divListener = google.maps.event.addDomListener(map.getDiv(), "mousedown", function(e) {
			if(e.target != self.element)
				self.close();
		}, true);
	}
	
	map-block.GoogleVertexContextMenu.prototype.onRemove = function()
	{
		google.maps.event.removeListener(this.divListener);
		this.element.parentNode.removeChild(this.element);
		
		this.set("position");
		this.set("path");
		this.set("vertex");
	}
	
	map-block.GoogleVertexContextMenu.prototype.open = function(map, path, vertex)
	{
		this.set('position', path.getAt(vertex));
		this.set('path', path);
		this.set('vertex', vertex);
		this.setMap(map);
		this.draw();
	}
	
	map-block.GoogleVertexContextMenu.prototype.close = function()
	{
		this.setMap(null);
	}
	
	map-block.GoogleVertexContextMenu.prototype.draw = function()
	{
		var position = this.get('position');
		var projection = this.getProjection();

		if (!position || !projection)
		  return;

		var point = projection.fromLatLngToDivPixel(position);
		this.element.style.top = point.y + 'px';
		this.element.style.left = point.x + 'px';
	}
	
	map-block.GoogleVertexContextMenu.prototype.removeVertex = function()
	{
		var path = this.get('path');
		var vertex = this.get('vertex');

		if (!path || vertex == undefined) {
		  this.close();
		  return;
		}

		path.removeAt(vertex);
		this.close();
	}
	
});

// js/v8/open-layers/ol-circle.js
/**
 * @namespace map-block
 * @module OLCircle
 * @requires map-block.Circle
 */
jQuery(function($) {
	
	var Parent = map-block.Circle;
	
	map-block.OLCircle = function(options, olFeature)
	{
		var self = this;
		
		this.center = {lat: 0, lng: 0};
		this.radius = 0;
		
		Parent.call(this, options, olFeature);
		
		if(!this.settings.fillColor)
		{
			this.settings.fillColor = "#ff0000";
			this.settings.fillOpacity = 0.6;
		}
		
		this.olStyle = new ol.style.Style(this.getStyleFromSettings());
		
		// IMPORTANT: Please note that due to what appears to be a bug in OpenLayers, the following code MUST be exected specifically in this order, or the circle won't appear
		var vectorLayer3857 = new ol.layer.Vector({
			source: new ol.source.Vector(),
			style: this.olStyle
		});
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var wgs84Sphere = new ol.Sphere(6378137);
			var radius = this.radius;
			var x, y;
			
			x = this.center.lng;
			y = this.center.lat;
			
			var circle4326 = ol.geom.Polygon.circular(wgs84Sphere, [x, y], radius, 64);
			var circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
			
			vectorLayer3857.getSource().addFeature(new ol.Feature(circle3857));
		}
		
		this.layer = vectorLayer3857;
		
		options.map.olMap.addLayer(vectorLayer3857);
	}
	
	map-block.OLCircle.prototype = Object.create(Parent.prototype);
	map-block.OLCircle.prototype.constructor = map-block.OLCircle;
	
	map-block.OLCircle.prototype.getStyleFromSettings = function()
	{
		var params = {};
				
		if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: map-block.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity)
			});
		
		if(this.settings.fillOpacity)
			params.fill = new ol.style.Fill({
				color: map-block.hexOpacityToRGBA(this.settings.fillColor, this.settings.fillOpacity)
			});
			
		return params;
	}
	
	map-block.OLCircle.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.olStyle = new ol.style.Style(params);
		this.layer.setStyle(this.olStyle);
	}
	
});

// js/v8/open-layers/ol-geocoder.js
/**
 * @namespace map-block
 * @module OLGeocoder
 * @requires map-block.Geocoder
 */
jQuery(function($) {
	
	/**
	 * @class OLGeocoder
	 * @extends Geocoder
	 * @summary OpenLayers geocoder - uses Nominatim by default
	 */
	map-block.OLGeocoder = function()
	{
		
	}
	
	map-block.OLGeocoder.prototype = Object.create(map-block.Geocoder.prototype);
	map-block.OLGeocoder.prototype.constructor = map-block.OLGeocoder;
	
	/**
	 * @function getResponseFromCache
	 * @access protected
	 * @summary Tries to retrieve cached coordinates from server cache
	 * @param {string} address The street address to geocode
	 * @param {function} callback Where to send the results, as an array
	 * @return {void}
	 */
	map-block.OLGeocoder.prototype.getResponseFromCache = function(address, callback)
	{
		$.ajax(map-block.ajaxurl, {
			data: {
				action: "map-block_query_nominatim_cache",
				query: address
			},
			success: function(response, xhr, status) {
				// Legacy compatibility support
				response.lng = response.lon;
				
				callback(response);
			}
		});
	}
	
	/**
	 * @function getResponseFromNominatim
	 * @access protected
	 * @summary Queries Nominatim on the specified address
	 * @param {object} options An object containing the options for geocoding, address is a mandatory field
	 * @param {function} callback The function to send the results to, as an array
	 */
	map-block.OLGeocoder.prototype.getResponseFromNominatim = function(options, callback)
	{
		var data = {
			q: options.address,
			format: "json"
		};
		
		if(options.country)
			data.countrycodes = options.country;
		
		$.ajax("https://nominatim.openstreetmap.org/search/", {
			data: data,
			success: function(response, xhr, status) {
				callback(response);
			},
			error: function(response, xhr, status) {
				callback(null, map-block.Geocoder.FAIL)
			}
		});
	}
	
	/**
	 * @function cacheResponse
	 * @access protected
	 * @summary Caches a response on the server, usually after it's been returned from Nominatim
	 * @param {string} address The street address
	 * @param {object|array} response The response to cache
	 * @returns {void}
	 */
	map-block.OLGeocoder.prototype.cacheResponse = function(address, response)
	{
		$.ajax(map-block.ajaxurl, {
			data: {
				action: "map-block_store_nominatim_cache",
				query: address,
				response: JSON.stringify(response)
			},
			method: "POST"
		});
	}
	
	map-block.OLGeocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		return map-block.OLGeocoder.prototype.geocode(options, callback);
	}
	
	map-block.OLGeocoder.prototype.getAddressFromLatLng = function(options, callback)
	{
		return map-block.OLGeocoder.prototype.geocode(options, callback);
	}
	
	map-block.OLGeocoder.prototype.geocode = function(options, callback)
	{
		var self = this;
		
		if(!options)
			throw new Error("Invalid options");
		
		if(options.location)
			options.latLng = new map-block.LatLng(options.location);
		
		var finish, location;
		
		if(options.address)
		{
			location = options.address;
			
			finish = function(response, status)
			{
				for(var i = 0; i < response.length; i++)
				{
					response[i].geometry = {
						location: new map-block.LatLng({
							lat: parseFloat(response[i].lat),
							lng: parseFloat(response[i].lon)
						})
					};
					
					response[i].latLng = {
						lat: parseFloat(response[i].lat),
						lng: parseFloat(response[i].lon)
					};
					
					// Backward compatibility with old UGM
					response[i].lng = response[i].lon;
				}
				
				callback(response, status);
			}
		}
		else if(options.latLng)
		{
			location = options.latLng.toString();
			
			finish = function(response, status)
			{
				var address = response[0].display_name;
				callback([address], status);
			}
		}
		else
			throw new Error("You must supply either a latLng or address")
		
		this.getResponseFromCache(location, function(response) {
			if(response.length)
			{
				finish(response, map-block.Geocoder.SUCCESS);
				return;
			}
			
			self.getResponseFromNominatim($.extend(options, {address: location}), function(response, status) {
				if(status == map-block.Geocoder.FAIL)
				{
					callback(null, map-block.Geocoder.FAIL);
					return;
				}
				
				if(response.length == 0)
				{
					callback([], map-block.Geocoder.ZERO_RESULTS);
					return;
				}
				
				finish(response, map-block.Geocoder.SUCCESS);
				
				self.cacheResponse(location, response);
			});
		});
	}
	
});

// js/v8/open-layers/ol-info-window.js
/**
 * @namespace map-block
 * @module OLInfoWindow
 * @requires map-block.InfoWindow
 * @pro-requires map-block.ProInfoWindow
 */
jQuery(function($) {
	
	var Parent;
	
	map-block.OLInfoWindow = function(mapObject)
	{
		var self = this;
		
		Parent.call(this, mapObject);
		
		this.element = $("<div class='ol-info-window-container ol-info-window-plain'></div>")[0];
			
		$(this.element).on("click", ".ol-info-window-close", function(event) {
			self.close();
		});
	}
	
	if(map-block.isProVersion())
		Parent = map-block.ProInfoWindow;
	else
		Parent = map-block.InfoWindow;
	
	map-block.OLInfoWindow.prototype = Object.create(Parent.prototype);
	map-block.OLInfoWindow.prototype.constructor = map-block.OLInfoWindow;
	
	/**
	 * Opens the info window
	 * TODO: This should take a mapObject, not an event
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	map-block.OLInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		var latLng = mapObject.getPosition();
		
		if(!map-block.InfoWindow.prototype.open.call(this, map, mapObject))
			return false;
		
		if(this.overlay)
			this.mapObject.map.olMap.removeOverlay(this.overlay);
			
		this.overlay = new ol.Overlay({
			element: this.element
		});
		
		this.overlay.setPosition(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		self.mapObject.map.olMap.addOverlay(this.overlay);
		
		$(this.element).show();
		
		this.dispatchEvent("infowindowopen");
	}
	
	map-block.OLInfoWindow.prototype.close = function(event)
	{
		// TODO: Why? This shouldn't have to be here. Removing the overlay should hide the element (it doesn't)
		$(this.element).hide();
		
		if(!this.overlay)
			return;
		
		map-block.InfoWindow.prototype.close.call(this);
		
		this.mapObject.map.olMap.removeOverlay(this.overlay);
		this.overlay = null;
	}
	
	map-block.OLInfoWindow.prototype.setContent = function(html)
	{
		$(this.element).html("<i class='fa fa-times ol-info-window-close' aria-hidden='true'></i>" + html);
	}
	
	map-block.OLInfoWindow.prototype.setOptions = function(options)
	{
		if(map-block.settings.developer_mode)
			console.log(options);
		
		if(options.maxWidth)
		{
			$(this.element).css({"max-width": options.maxWidth + "px"});
		}
	}
	
});

// js/v8/open-layers/ol-map.js
/**
 * @namespace map-block
 * @module OLMap
 * @requires map-block.Map
 * @pro-requires map-block.ProMap
 */
jQuery(function($) {
	
	var Parent;
	
	map-block.OLMap = function(element, options)
	{
		var self = this;
		
		Parent.call(this, element);
		
		this.setOptions(options);
		
		var viewOptions = this.settings.toOLViewOptions();
		
		$(this.element).html("");
		
		this.olMap = new ol.Map({
			target: $(element)[0],
			layers: [
				this.getTileLayer()
			],
			view: new ol.View(viewOptions)
		});
		
		// TODO: Re-implement using correct setting names
		// Interactions
		this.olMap.getInteractions().forEach(function(interaction) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(interaction instanceof ol.interaction.DragPan)
				interaction.setActive( (this.settings.map-block_settings_map_draggable == "yes" ? false : true) );
			else if(interaction instanceof ol.interaction.DoubleClickZoom)
				interaction.setActive( (this.settings.map-block_settings_map_clickzoom ? false : true) );
			else if(interaction instanceof ol.interaction.MouseWheelZoom)
				interaction.setActive( (this.settings.map-block_settings_map_scroll == "yes" ? false : true) );
			
		}, this);
		
		// Controls
		this.olMap.getControls().forEach(function(control) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(control instanceof ol.control.Zoom && map-block.settings.map-block_settings_map_zoom == "yes")
				this.olMap.removeControl(control);
			
		}, this);
		
		if(map-block.settings.map-block_settings_map_full_screen_control != "yes")
			this.olMap.addControl(new ol.control.FullScreen());
		
		// Marker layer
		this.markerLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: []
			})
		});
		this.olMap.addLayer(this.markerLayer);
		
		// Listen for drag start
		this.olMap.on("movestart", function(event) {
			self.isBeingDragged = true;
		});
		
		// Listen for end of pan so we can wrap longitude if needs be
		this.olMap.on("moveend", function(event) {
			self.wrapLongitude();
			
			self.isBeingDragged = false;
			self.dispatchEvent("dragend");
			self.onIdle();
		});
		
		// Listen for zoom
		this.olMap.getView().on("change:resolution", function(event) {
			self.dispatchEvent("zoom_changed");
			self.dispatchEvent("zoomchanged");
			self.onIdle();
		});
		
		// Listen for bounds changing
		this.olMap.getView().on("change", function() {
			// Wrap longitude
			self.onBoundsChanged();
		});
		self.onBoundsChanged();
		
		// Store locator center
		var marker;
		if(this.storeLocator && (marker = this.storeLocator.centerPointMarker))
		{
			this.olMap.addOverlay(marker.overlay);
			marker.setVisible(false);
		}
		
		// Right click listener
		$(this.element).on("click contextmenu", function(event) {
			
			var isRight;
			event = event || window.event;
			
			var latLng = self.pixelsToLatLng(event.offsetX, event.offsetY);
			
			if("which" in event)
				isRight = event.which == 3;
			else if("button" in event)
				isRight = event.button == 2;
			
			if(event.which == 1 || event.button == 1)
			{
				if(self.isBeingDragged)
					return;
				
				// Left click
				self.trigger({
					type: "click",
					latLng: latLng
				});
				
				return;
			}
			
			if(!isRight)
				return;
			
			return self.onRightClick(event);
		});
		
		// Dispatch event
		if(!map-block.isProVersion())
		{
			this.dispatchEvent("created");
			map-block.events.dispatchEvent({type: "mapcreated", map: this});
		}
	}

	if(map-block.isProVersion())
		Parent = map-block.ProMap;
	else
		Parent = map-block.Map;
	
	map-block.OLMap.prototype = Object.create(Parent.prototype);
	map-block.OLMap.prototype.constructor = map-block.OLMap;
	
	map-block.OLMap.prototype.getTileLayer = function()
	{
		return new ol.layer.Tile({
			source: new ol.source.OSM()
		});
	}
	
	map-block.OLMap.prototype.wrapLongitude = function()
	{
		var center = this.getCenter();
		
		if(center.lng >= -180 && center.lng <= 180)
			return;
		
		center.lng = center.lng - 360 * Math.floor(center.lng / 360);
		
		if(center.lng > 180)
			center.lng -= 360;
		
		this.setCenter(center);
	}
	
	map-block.OLMap.prototype.getCenter = function()
	{
		var lonLat = ol.proj.toLonLat(
			this.olMap.getView().getCenter()
		);
		return {
			lat: lonLat[1],
			lng: lonLat[0]
		};
	}
	
	map-block.OLMap.prototype.setCenter = function(latLng)
	{
		var view = this.olMap.getView();
		
		map-block.Map.prototype.setCenter.call(this, latLng);
		
		view.setCenter(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		
		this.wrapLongitude();

		this.onBoundsChanged();
	}
	
	map-block.OLMap.prototype.getBounds = function()
	{
		var bounds = this.olMap.getView().calculateExtent(this.olMap.getSize());
		
		var topLeft = ol.proj.toLonLat([bounds[0], bounds[1]]);
		var bottomRight = ol.proj.toLonLat([bounds[2], bounds[3]]);
		
		return {
			topLeft: {
				lat: topLeft[1],
				lng: topLeft[0]
			},
			bottomRight: {
				lat: bottomRight[1],
				lng: bottomRight[0]
			}
		};
	}
	
	/**
	 * Fit to given boundaries
	 * @return void
	 */
	map-block.OLMap.prototype.fitBounds = function(southWest, northEast)
	{
		this.olMap.getView().fitExtent(
			[southWest.lng, southWest.lat, northEast.lng, northEast.lat],
			this.olMap.getSize()
		);
	}
	
	map-block.OLMap.prototype.panTo = function(latLng)
	{
		var view = this.olMap.getView();
		view.animate({
			center: ol.proj.fromLonLat([
				parseFloat(latLng.lng),
				parseFloat(latLng.lat),
			]),
			duration: 500
		});
	}
	
	map-block.OLMap.prototype.getZoom = function()
	{
		return Math.round( this.olMap.getView().getZoom() ) + 1;
	}
	
	map-block.OLMap.prototype.setZoom = function(value)
	{
		this.olMap.getView().setZoom(value);
	}
	
	map-block.OLMap.prototype.getMinZoom = function()
	{
		return this.olMap.getView().getMinZoom();
	}
	
	map-block.OLMap.prototype.setMinZoom = function(value)
	{
		this.olMap.getView().setMinZoom(value);
	}
	
	map-block.OLMap.prototype.getMaxZoom = function()
	{
		return this.olMap.getView().getMaxZoom();
	}
	
	map-block.OLMap.prototype.setMaxZoom = function(value)
	{
		this.olMap.getView().setMaxZoom(value);
	}
	
	map-block.OLMap.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		if(!this.olMap)
			return;
		
		this.olMap.getView().setProperties( this.settings.toOLViewOptions() );
	}
	
	/**
	 * TODO: Consider moving all these functions to their respective classes, same on google map (DO IT!!! It's very misleading having them here)
	 */
	map-block.OLMap.prototype.addMarker = function(marker)
	{
		this.olMap.addOverlay(marker.overlay);
		
		Parent.prototype.addMarker.call(this, marker);
	}
	
	map-block.OLMap.prototype.removeMarker = function(marker)
	{
		this.olMap.removeOverlay(marker.overlay);
		
		Parent.prototype.removeMarker.call(this, marker);
	}
	
	map-block.OLMap.prototype.addPolygon = function(polygon)
	{
		this.olMap.addLayer(polygon.layer);
		
		Parent.prototype.addPolygon.call(this, polygon);
	}
	
	map-block.OLMap.prototype.removePolygon = function(polygon)
	{
		this.olMap.removeLayer(polygon.layer);
		
		Parent.prototype.removePolygon.call(this, polygon);
	}
	
	map-block.OLMap.prototype.addPolyline = function(polyline)
	{
		this.olMap.addLayer(polyline.layer);
		
		Parent.prototype.addPolyline.call(this, polyline);
	}
	
	map-block.OLMap.prototype.removePolyline = function(polyline)
	{
		this.olMap.removeLayer(polyline.layer);
		
		Parent.prototype.removePolyline.call(this, polyline);
	}
	
	map-block.OLMap.prototype.addCircle = function(circle)
	{
		this.olMap.addLayer(circle.layer);
		
		Parent.prototype.addCircle.call(this, circle);
	}
	
	map-block.OLMap.prototype.removeCircle = function(circle)
	{
		this.olMap.removeLayer(circle.layer);
		
		Parent.prototype.removeCircle.call(this, circle);
	}
	
	map-block.OLMap.prototype.pixelsToLatLng = function(x, y)
	{
		if(y == undefined)
		{
			if("x" in x && "y" in x)
			{
				y = x.y;
				x = x.x;
			}
			else
				console.warn("Y coordinate undefined in pixelsToLatLng (did you mean to pass 2 arguments?)");
		}
		
		var coord = this.olMap.getCoordinateFromPixel([x, y]);
		
		if(!coord)
			return {
				x: null,
				y: null
			};
		
		var lonLat = ol.proj.toLonLat(coord);
		return {
			lat: lonLat[1],
			lng: lonLat[0]
		};
	}
	
	map-block.OLMap.prototype.latLngToPixels = function(latLng)
	{
		var coord = ol.proj.fromLonLat([latLng.lng, latLng.lat]);
		var pixel = this.olMap.getPixelFromCoordinate(coord);
		
		if(!pixel)
			return {
				x: null,
				y: null
			};
		
		return {
			x: pixel[0],
			y: pixel[1]
		};
	}
	
	map-block.OLMap.prototype.enableBicycleLayer = function(value)
	{
		if(value)
		{
			if(!this.bicycleLayer)
				this.bicycleLayer = new ol.layer.Tile({
					source: new ol.source.OSM({
						url: "http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"
					})
				});
				
			this.olMap.addLayer(this.bicycleLayer);
		}
		else
		{
			if(!this.bicycleLayer)
				return;
			
			this.olMap.removeLayer(this.bicycleLayer);
		}
	}
	
	map-block.OLMap.prototype.onElementResized = function(event)
	{
		this.olMap.updateSize();
	}
	
	map-block.OLMap.prototype.onRightClick = function(event)
	{
		if($(event.target).closest(".ol-marker, .map-block_modern_infowindow, .map-block-modern-store-locator").length)
			return true;
		
		var parentOffset = $(this.element).offset();
		var relX = event.pageX - parentOffset.left;
		var relY = event.pageY - parentOffset.top;
		var latLng = this.pixelsToLatLng(relX, relY);
		
		this.trigger({type: "rightclick", latLng: latLng});
		
		// Legacy event compatibility
		$(this.element).trigger({type: "rightclick", latLng: latLng});
		
		// Prevent menu
		event.preventDefault();
		return false;
	}
	
});

// js/v8/open-layers/ol-marker.js
/**
 * @namespace map-block
 * @module OLMarker
 * @requires map-block.Marker
 * @pro-requires map-block.ProMarker
 */
jQuery(function($) {
	
	var Parent;
	
	map-block.OLMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);

		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
		
		this.element = $("<div class='ol-marker'><img src='" + map-block.settings.default_marker_icon + "'/></div>")[0];
		this.element.map-blockMarker = this;
		
		$(this.element).on("mouseover", function(event) {
			self.dispatchEvent("mouseover");
		});
		
		this.overlay = new ol.Overlay({
			element: this.element
		});
		this.overlay.setPosition(origin);
		
		if(this.animation)
			this.setAnimation(this.animation);
		
		this.setLabel(this.settings.label);
		
		if(row)
		{
			if(row.draggable)
				this.setDraggable(true);
		}
		
		this.rebindClickListener();
		
		this.trigger("init");
	}
	
	if(map-block.isProVersion())
		Parent = map-block.ProMarker;
	else
		Parent = map-block.Marker;
	map-block.OLMarker.prototype = Object.create(Parent.prototype);
	map-block.OLMarker.prototype.constructor = map-block.OLMarker;
	
	map-block.OLMarker.prototype.addLabel = function()
	{
		this.setLabel(this.getLabelText());
	}
	
	map-block.OLMarker.prototype.setLabel = function(label)
	{
		if(!label)
		{
			if(this.label)
				$(this.element).find(".ol-marker-label").remove();
			
			return;
		}
		
		if(!this.label)
		{
			this.label = $("<div class='ol-marker-label'/>");
			$(this.element).append(this.label);
		}
		
		this.label.html(label);
	}
	
	map-block.OLMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible(visible);
		
		this.overlay.getElement().style.display = (visible ? "block" : "none");
	}
	
	map-block.OLMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);
		
		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
	
		this.overlay.setPosition(origin);
	}
	
	map-block.OLMarker.prototype.setOffset = function(x, y)
	{
		this.element.style.position = "relative";
		this.element.style.left = x + "px";
		this.element.style.top = y + "px";
	}
	
	map-block.OLMarker.prototype.setAnimation = function(anim)
	{
		Parent.prototype.setAnimation.call(this, anim);
		
		switch(anim)
		{
			case map-block.Marker.ANIMATION_NONE:
				$(this.element).removeAttr("data-anim");
				break;
			
			case map-block.Marker.ANIMATION_BOUNCE:
				$(this.element).attr("data-anim", "bounce");
				break;
			
			case map-block.Marker.ANIMATION_DROP:
				$(this.element).attr("data-anim", "drop");
				break;
		}
	}
	
	map-block.OLMarker.prototype.setDraggable = function(draggable)
	{
		var self = this;
		
		if(draggable)
		{
			var options = {
				disabled: false
			};
			
			if(!this.jQueryDraggableInitialized)
			{
				options.start = function(event) {
					self.onDragStart(event);
				}
				
				options.stop = function(event) {
					self.onDragEnd(event);
				};
			}
			
			$(this.element).draggable(options);
			this.jQueryDraggableInitialized = true;
			
			this.rebindClickListener();
		}
		else
			$(this.element).draggable({disabled: true});
	}
	
	map-block.OLMarker.prototype.onDragStart = function(event)
	{
		this.isBeingDragged = true;
	}
		
	map-block.OLMarker.prototype.onDragEnd = function(event)
	{
		var offset = {
			top:	parseFloat( $(this.element).css("top").match(/-?\d+/)[0] ),
			left:	parseFloat( $(this.element).css("left").match(/-?\d+/)[0] )
		};
		
		$(this.element).css({
			top: 	"0px",
			left: 	"0px"
		});
		
		var currentLatLng 		= this.getPosition();
		var pixelsBeforeDrag 	= this.map.latLngToPixels(currentLatLng);
		var pixelsAfterDrag		= {
			x: pixelsBeforeDrag.x + offset.left,
			y: pixelsBeforeDrag.y + offset.top
		};
		var latLngAfterDrag		= this.map.pixelsToLatLng(pixelsAfterDrag);
		
		this.setPosition(latLngAfterDrag);
		
		this.isBeingDragged = false;
		this.trigger({type: "dragend", latLng: latLngAfterDrag});
	}
	
	map-block.OLMarker.prototype.onElementClick = function(event)
	{
		var self = event.currentTarget.map-blockMarker;
		
		if(self.isBeingDragged)
			return; // Don't dispatch click event after a drag
		
		self.dispatchEvent("click");
		self.dispatchEvent("select");
	}
	
	/**
	 * Binds / rebinds the click listener. This must be bound after draggable is initialized,
	 * this solves the click listener firing before dragend
	 */
	map-block.OLMarker.prototype.rebindClickListener = function()
	{
		$(this.element).off("click", this.onElementClick);
		$(this.element).on("click", this.onElementClick);
	}
	
});

// js/v8/open-layers/ol-modern-store-locator-circle.js
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

// js/v8/open-layers/ol-modern-store-locator.js
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

// js/v8/open-layers/ol-polygon.js
/**
 * @namespace map-block
 * @module OLPolygon
 * @requires map-block.Polygon
 * @pro-requires map-block.ProPolygon
 */
jQuery(function($) {
	
	var Parent;
	
	map-block.OLPolygon = function(row, olFeature)
	{
		var self = this;
		
		Parent.call(this, row, olFeature);
		
		this.olStyle = new ol.style.Style();
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [[]];
			
			if(row && row.points)
			{
				var paths = this.parseGeometry(row.points);
				
				for(var i = 0; i < paths.length; i++)
					coordinates[0].push(ol.proj.fromLonLat([
						parseFloat(paths[i].lng),
						parseFloat(paths[i].lat)
					]));
				
				this.olStyle = new ol.style.Style(this.getStyleFromSettings());
			}
			
			this.olFeature = new ol.Feature({
				geometry: new ol.geom.Polygon(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			}),
			style: this.olStyle
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			map-blockPolygon: this
		});
	}
	
	if(map-block.isProVersion())
		Parent = map-block.ProPolygon;
	else
		Parent = map-block.Polygon;
	
	map-block.OLPolygon.prototype = Object.create(Parent.prototype);
	map-block.OLPolygon.prototype.constructor = map-block.OLPolygon;

	map-block.OLPolygon.prototype.getStyleFromSettings = function()
	{
		var params = {};
				
		if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: map-block.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity)
			});
		
		if(this.settings.fillOpacity)
			params.fill = new ol.style.Fill({
				color: map-block.hexOpacityToRGBA(this.settings.fillColor, this.settings.fillOpacity)
			});
			
		return params;
	}
	
	map-block.OLPolygon.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.olStyle = new ol.style.Style(params);
		this.layer.setStyle(this.olStyle);
	}
	
	map-block.OLPolygon.prototype.setEditable = function(editable)
	{
		
	}
	
	map-block.OLPolygon.prototype.toJSON = function()
	{
		var result = Parent.prototype.toJSON.call(this);
		var coordinates = this.olFeature.getGeometry().getCoordinates()[0];
		
		result.points = [];
		
		for(var i = 0; i < coordinates.length; i++)
		{
			var lonLat = ol.proj.toLonLat(coordinates[i]);
			var latLng = {
				lat: lonLat[1],
				lng: lonLat[0]
			};
			result.points.push(latLng);
		}
		
		return result;
	}
	
});

// js/v8/open-layers/ol-polyline.js
/**
 * @namespace map-block
 * @module OLPolyline
 * @requires map-block.Polyline
 */
jQuery(function($) {
	
	var Parent;
	
	map-block.OLPolyline = function(row, olFeature)
	{
		var self = this;
		
		map-block.Polyline.call(this, row);
		
		this.olStyle = new ol.style.Style();
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [];
			
			if(row && row.points)
			{
				var path = this.parseGeometry(row.points);
				
				for(var i = 0; i < path.length; i++)
					coordinates.push(ol.proj.fromLonLat([
						parseFloat(path[i].lng),
						parseFloat(path[i].lat)
					]));
			}
			
			var params = this.getStyleFromSettings();
			this.olStyle = new ol.style.Style(params);
			
			this.olFeature = new ol.Feature({
				geometry: new ol.geom.LineString(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			}),
			style: this.olStyle
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			map-blockPolyling: this
		});
	}
	
	Parent = map-block.Polyline;
		
	map-block.OLPolyline.prototype = Object.create(Parent.prototype);
	map-block.OLPolyline.prototype.constructor = map-block.OLPolyline;
	
	map-block.OLPolyline.prototype.getStyleFromSettings = function()
	{
		var params = {};
		
		if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: map-block.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity),
				width: parseInt(this.settings.strokeWeight)
			});
			
		return params;
	}
	
	map-block.OLPolyline.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.olStyle = new ol.style.Style(params);
		this.layer.setStyle(this.olStyle);
	}
	
	map-block.OLPolyline.prototype.setEditable = function(editable)
	{
		
	}
	
	map-block.OLPolyline.prototype.setPoints = function(points)
	{
		if(this.olFeature)
			this.layer.getSource().removeFeature(this.olFeature);
		
		var coordinates = [];
		
		for(var i = 0; i < points.length; i++)
			coordinates.push(ol.proj.fromLonLat([
				parseFloat(points[i].lng),
				parseFloat(points[i].lat)
			]));
		
		this.olFeature = new ol.Feature({
			geometry: new ol.geom.LineString(coordinates)
		});
		
		this.layer.getSource().addFeature(this.olFeature);
	}
	
	map-block.OLPolyline.prototype.toJSON = function()
	{
		var result = Parent.prototype.toJSON.call(this);
		var coordinates = this.olFeature.getGeometry().getCoordinates();
		
		result.points = [];
		
		for(var i = 0; i < coordinates.length; i++)
		{
			var lonLat = ol.proj.toLonLat(coordinates[i]);
			var latLng = {
				lat: lonLat[1],
				lng: lonLat[0]
			};
			result.points.push(latLng);
		}
		
		return result;
	}
	
});