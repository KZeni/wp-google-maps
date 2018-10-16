<?php

namespace map-block\Integration;

class Gutenberg extends \map-block\Factory
{
	public function __construct()
	{
		global $map-block;
		
		add_action('enqueue_block_assets', array(
			$this,
			'onEnqueueBlockAssets'
		));
		
		add_action('init', array(
			$this,
			'onInit'
		));
		
		if(function_exists('register_block_type'))
			register_block_type('gutenberg-map-block/block', array(
				'render_callback' => array(
					$this,
					'onRender'
				)
			));
	}
	
	public function onEnqueueBlockAssets()
	{
		global $map-block;
		
		$map-block->loadScripts();
		
		wp_enqueue_style(
			'map-block-gutenberg-integration', 
			plugin_dir_url(map-block_FILE) . 'css/gutenberg.css', 
			'', 
			map-block_VERSION
		);
	}
	
	public function onInit()
	{
		global $map-block;
		
		if(empty($map-block->settings->developer_mode))
			return;
		
		// Strip out JS module code for browser compatibility
		$filename = plugin_dir_path(map-block_FILE) . 'js/v8/3rd-party-integration/gutenberg/dist/gutenberg.js';
		
		$contents = file_get_contents($filename);
		
		$contents = preg_replace('/Object\.defineProperty\(exports.+?;/s', '', $contents);
		
		$contents = preg_replace('/exports\.default = /', '', $contents);
		
		file_put_contents($filename, $contents);
	}
	
	public function onRender($attr)
	{
		extract($attr);
		
		return '[map-block id="1"]';
	}
}
