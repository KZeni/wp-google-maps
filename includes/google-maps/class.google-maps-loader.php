<?php

namespace map-block;

// TODO: Extend Factory
class GoogleMapsLoader
{
	private static $googleAPILoadCalled = false;
	
	public static function _createInstance()
	{
		return new GoogleMapsLoader();
	}
	
	public static function createInstance()
	{
		return static::_createInstance();
	}
	
	/**
	 * Gets the parameters to be sent to the Google Maps API load call
	 * @return array
	 */
	protected function getGoogleMapsAPIParams()
	{
		global $map-block;
		
		// Locale
		$locale = get_locale();
		$suffix = '.com';
		
		switch($locale)
		{
			case 'he_IL':
				// Hebrew correction
				$locale = 'iw';
				break;
			
			case 'zh_CN':
				// Chinese integration
				$suffix = '.cn';
				break;
		}
		
		
		$locale = substr($locale, 0, 2);
		
		// Default params for google maps
		$params = array(
			'v' 		=> '3.29',
			'language'	=> $locale,
			'suffix'	=> $suffix
		);
		
		// API Version
		/*if(!empty(Plugin::$settings->api_version))
		{
			// Force 3.28 if the user has a setting below this
			if(version_compare(Plugin::$settings->api_version, '3.29', '<'))
			{
				$params['v'] = '3.29';
				
				// Force greedy gesture behaviour (the default before 3.27) if the user had this set
				if(version_compare(Plugin::$settings->api_version, '3.27', '<'))
					Plugin::$settings->force_greedy_gestures = true;
			}
			else
				$params['v'] = Plugin::$settings->api_version;
		}
		
		*/
		
		// API Key
		//if(!empty($map-block->settings->google_maps_api_key))
			//$params['key'] = $map-block->settings->google_maps_api_key;
		
		//if($map-block->getCurrentPage() == 'map-edit')
			//$params['libraries'] = 'drawing';
		
		$key = get_option('map-block_google_maps_api_key');
		if(!empty($key))
			$params['key'] = $key;

		$params = apply_filters( 'map-block_google_maps_api_params', $params );
		
		return $params;
	}
	
	/**
	 * This function loads the Google API if it hasn't been called already
	 * @return void
	 */
	public function loadGoogleMaps()
	{
		global $map-block;
		
		if(GoogleMapsLoader::$googleAPILoadCalled)
			return;
		
		$apiLoader = new GoogleMapsAPILoader();
		if(!$apiLoader->isIncludeAllowed())
			return;
		
		$params = $this->getGoogleMapsAPIParams();
		
		$suffix = $params['suffix'];
		unset($params['suffix']);
		
		$url = '//maps.google' . $suffix . '/maps/api/js?' . http_build_query($params);
		
		wp_enqueue_script('map-block_api_call', $url);
		
		GoogleMapsLoader::$googleAPILoadCalled = true;
		
		add_filter('script_loader_tag', array($this, 'preventOtherGoogleMapsTag'), 9999999, 3);
	}
	
	public function preventOtherGoogleMapsTag($tag, $handle, $src)
	{
		if(preg_match('/maps\.google/i', $src))
		{
			if($handle != 'map-block_api_call') {
				return '';
			}
			
			if(!preg_match('/\?.+$/', $src))
				return str_replace($src, $src . '?' . http_build_query($this->getGoogleMapsAPIParams()), $tag);
		}

		return $tag;
	}
	
}

