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