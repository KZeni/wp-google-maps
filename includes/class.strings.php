<?php

namespace map-block;

class Strings
{
	public function getLocalizedStrings()
	{
		return apply_filters('map-block_localized_strings', array(
			'unsecure_geolocation' 		=> __('Many browsers are no longer allowing geolocation from unsecured origins. You will need to secure your site with an SSL certificate (HTTPS) or this feature may not work for your visitors', 'map-block'),
			
			'google_api_not_loaded'		=> __('The map cannot be initialized because the Maps API has not been loaded. Please check your settings.', 'map-block'),
			
			'documentation'				=> __('Documentation', 'map-block'),
			'api_dashboard'				=> __('API Dashboard', 'map-block'),
			'verify_project'			=> __('Verify Project', 'map-block')
		));
	}
	
	/**
	 * This function builds a dummy PHP file containing strings from the database,
	 * making these strings scannable by translation software.
	 * TODO: Implement
	 */
	public function buildDynamicStringDummyFile()
	{
		// For each wp_map-block table
		// For each column
		// If column is not text / varchar, continue
		// If column is JSON / serialized, deserialize it
		// Or, if it's plain text, put that in an object
		// Iterate recursively over the object, build PHP file from values
		// Write dummy file
	}
}
