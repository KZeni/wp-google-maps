<?php

namespace map-block;

class OLLoader
{
	private static $olAPILoadCalled = false;
	
	/**
	 * Enqueue scripts
	 * @return void
	 */
	public function enqueueScripts()
	{
		global $map-block;
		
		$this->loadOpenLayer();
	}
	
	public function loadOpenLayers()
	{
		global $map-block;
		
		//if(Plugin::$settings->remove_api)
			//return;
		
		if(OLLoader::$olAPILoadCalled)
			return;
		
		wp_enqueue_style('map-block-ol-base-style', plugin_dir_url(dirname(__DIR__)) . 'lib/ol.css');
		wp_enqueue_style('map-block-ol-style', plugin_dir_url(dirname(__DIR__)) . 'css/open-layers.css');
		
		// TODO: Fix this, don't use this handle, use map-block_api_call. For some reason it won't enqueue using that. I suspect something else is using this handle. Whatever it is isn't in wpGoogleMaps.php
		wp_enqueue_script('map-block_ol_api_call', plugin_dir_url(dirname(__DIR__)) . 'lib/' . ($map-block->isUsingMinifiedScripts() ? 'ol.js' : 'ol-debug.js'));
		//wp_enqueue_script('map-block_api_call', plugin_dir_url(dirname(__DIR__)) . 'lib/' . ($map-block->isUsingMinifiedScripts() ? 'ol.js' : 'ol-debug.js'));
	}
}

