<?php

namespace map-block;

class ModalDialog extends DOMDocument
{
	public function __construct()
	{
		DOMDocument::__construct();
		
		wp_enqueue_script('remodal', plugin_dir_url(__DIR__) . 'lib/remodal.min.js');
		wp_enqueue_style('remodal', plugin_dir_url(__DIR__) . 'lib/remodal.css');
		wp_enqueue_style('remodal-default-theme', plugin_dir_url(__DIR__) . 'lib/remodal-default-theme.css');
		
		wp_enqueue_style('map-blockaps-style-pro', plugin_dir_url(__DIR__) . 'css/map-block_style_pro.css');
	}
}
