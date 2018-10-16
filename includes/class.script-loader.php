<?php

namespace map-block;

require_once(plugin_dir_path(__FILE__) . 'google-maps/class.google-maps-loader.php');
require_once(plugin_dir_path(__FILE__) . 'open-layers/class.ol-loader.php');

class ScriptLoader
{
	private $proMode = false;
	private $logStarted = false;
	
	public $scripts;
	
	public function __construct($proMode)
	{
		$this->proMode = $proMode;
		
		if($this->proMode)
			$this->scriptsFileLocation = plugin_dir_path(map-block_PRO_FILE) . 'js/v8/pro-scripts.json';
		else
			$this->scriptsFileLocation = plugin_dir_path(__DIR__) . 'js/v8/scripts.json';
	}
	
	protected function log($str)
	{
		$dest = __DIR__ . '/build.log';
		
		if(!$this->logStarted)
			file_put_contents($dest, "");
		
		$this->logStarted = true;
		file_put_contents($dest, date("Y-m-d H:i:s :-\t") . $str . "\r\n", FILE_APPEND);
	}
	
	protected function rglob($pattern, $flags = 0)
	{
		$files = glob($pattern, $flags); 
		
		foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir) {
			
			$files = array_merge($files, $this->rglob($dir.'/'.basename($pattern), $flags));
			
		}
		
		return $files;
	}
	
	protected function getHandleFromModuleName($module)
	{
		return trim(preg_replace('/^map-block\./', 'map-block-',
			strtolower(
				preg_replace('/(?<=[A-Za-z])(?=[A-Z][a-z])|(?<=[a-z0-9])(?=[0-9]?[A-Z])/', '-', $module)
			)
		));
	}
	
	protected function getLibraryScripts()
	{
		global $map-block;
		
		$plugin_dir_url = plugin_dir_url(__DIR__);
		
		$libraryDependencies = array(
			'datatables'		=> $plugin_dir_url . 'js/jquery.dataTables.min.js',
			'jquery-cookie'		=> $plugin_dir_url . 'lib/jquery-cookie.js',
			// 'modernizr-custom'	=> $plugin_dir_url . 'lib/modernizr-custom.js',
			'remodal'			=> $plugin_dir_url . 'lib/' . ($map-block->isUsingMinifiedScripts() ? 'remodal.min.js' : 'remodal.js'),
			// 'resize-sensor'		=> $plugin_dir_url . 'lib/ResizeSensor.js',
			'spectrum'			=> $plugin_dir_url . 'lib/spectrum.js'
		);
		
		/*if($map-block->isProVersion())
		{
			$pro_dir = plugin_dir_url(map-block_PRO_FILE);
			
			$libraryDependencies = array_merge($libraryDependencies, array(
				'jstree'				=> $pro_dir . ($map-block->isUsingMinifiedScripts() ? 'lib/jstree.min.js' : 'lib/jstree.js'),
				'jszip'					=> $pro_dir . 'lib/jszip.min.js',
				'jquery-multiselect'	=> $pro_dir . 'lib/jquery.multiselect.js',
				'owl-carousel'			=> $pro_dir . 'lib/owl.carousel.min.js'
			));
		}*/
		
		if($map-block->getCurrentPage() && is_admin())
		{
			wp_enqueue_script('jquery-ui-core');
			wp_enqueue_script('jquery-ui-dialog');
			wp_enqueue_script('jquery-ui-slider');
			wp_enqueue_script('jquery-ui-tabs');
			wp_enqueue_script('jquery-ui-progressbar');
			wp_enqueue_script('jquery-ui-accordion');
			wp_enqueue_script('jquery-ui-sortable');
			wp_enqueue_script('jquery-ui-draggable');
		}
		
		return apply_filters('map-block-get-library-dependencies', $libraryDependencies);
	}
	
	protected function getScanDirectories()
	{
		$result = array(
			plugin_dir_path(__DIR__) . 'js/v8' => plugin_dir_url(__DIR__) . 'js/v8'
		);
		
		if($this->proMode)
			$result[plugin_dir_path(map-block_PRO_FILE) . 'js/v8'] = plugin_dir_url(map-block_PRO_FILE) . 'js/v8';
		
		return $result;
	}
	
	protected function scanDependencies()
	{
		$this->scripts = array();
		
		$directories = $this->getScanDirectories();
		
		$files = array();
		$this->dependenciesByHandle = array();
		
		$this->log("Scanning dependencies");
		
		foreach($directories as $dir => $path)
		{
			$pro_directory = (preg_match('/-pro/', $dir) ? true : false);
			$files = $this->rglob("$dir/*.js");
		
			foreach($files as $file)
			{
				if(preg_match('/combined\.js|min\.js$/', $file))
					continue;
				
				$this->log("Reading $file");
				
				$contents = file_get_contents($file);
				
				if(!preg_match('/\/\*\*.+?\*\//s', $contents, $m))
					continue;
				
				$header = $m[0];
				
				// Read module name
				if(!preg_match('/@module\s+(.+)/', $header, $m))
					continue;
				
				$module = trim($m[1]);
				
				$handle = $this->getHandleFromModuleName($module);
				if($handle != 'map-block')
					$handle = 'map-block-' . $handle;
				
				$dependencies = array();
				
				$this->log("Found $handle");
				
				if(preg_match_all('/@(pro-)?requires (.+)/', $header, $m))
				{
					$len = count($m[0]);
					
					for($i = 0; $i < $len; $i++)
					{
						$pro = !empty($m[1][$i]);

						$dependencyModule = $m[2][$i];
						
						$dependencyHandle = preg_replace('/^map-block\./',
							'map-block-',
							$this->getHandleFromModuleName($dependencyModule)
						);
						
						if(!$pro)
						{
							$this->log("Adding dependency $dependencyHandle");
							$dependencies[] = $dependencyHandle;
						}
						else if($this->proMode)
						{
							$this->log("Adding Pro dependency $dependencyHandle");
							$dependencies[] = $dependencyHandle;
						}
					}
				}
				
				$src = str_replace($dir, 'js/v8', $file);
				
				if(empty($this->dependenciesByHandle[$handle]))
					$this->dependenciesByHandle[$handle] = array();
				
				$this->dependenciesByHandle[$handle][] = $file;
				
				$this->scripts[$handle] = (object)array(
					'src'			=> $src,
					'pro'			=> $pro_directory,
					'dependencies'	=> $dependencies
				);
			}
		}
		
		file_put_contents($this->scriptsFileLocation, json_encode($this->scripts, JSON_PRETTY_PRINT));
	}
	
	public function getCombineOrder()
	{
		if(!$this->scripts)
			$this->scanDependencies();
		
		$iterations = 0;
		$scripts = (array)(clone (object)$this->scripts);
		$includedHandles = array();
		$combineOrder = array();
		
		$ignoreDependencyHandles = array(
			'map-block_api_call'
		);
		$unresolvedDependencyHandles = array();
		
		while(!empty($scripts))
		{
			if(++$iterations > 100000)
			{
				//echo "Dumping included handles\r\n";
				//var_dump($includedHandles);
				
				//echo "Dumping remaining scripts\r\n\r\n";
				//var_dump($scripts);
				
				echo "<pre>";
				echo "Dumping unresolved dependencies\r\n\r\n";
				//var_dump(array_keys($unresolvedDependencyHandles));
				
				foreach($unresolvedDependencyHandles as $handle => $unused)
				{
					echo "$handle (in " . implode(', ', $this->dependenciesByHandle[$handle]) . ")\r\n";
				}
				
				echo "</pre>";
				
				throw new \Exception('Iteration limit hit possibly due to dependency recusion or unresolved dependencies');
			}
			
			foreach($scripts as $handle => $script)
			{
				// echo "\r\nLooking at $handle\r\n";
				
				foreach($script->dependencies as $dependency)
				{
					// Ignored handles (eg API call)
					if(array_search($dependency, $ignoreDependencyHandles) !== false)
					{
						//echo "Ignoring dependency $dependency\r\n";
						continue;
					}
					
					// Already included handles
					if(array_search($dependency, $includedHandles) !== false)
					{
						//echo "Already included $dependency\r\n";
						continue;
					}
					
					// External handles not handled by us. This module only handles internal dependencies
					if(!preg_match('/^map-block-/i', $dependency) && $dependency != 'map-block')
					{
						//echo "Ignoring external handle $dependency\r\n";
						continue;
					}
					
					$unresolvedDependencyHandles[$handle] = true;
					
					//echo "$dependency not yet included, skipping\r\n";
					continue 2;
				}
				
				//echo "Adding $handle ({$script->src})\r\n";
				
				$combineOrder[] = $script->src;
				$includedHandles[] = $handle;
				
				unset($scripts[$handle]);
				unset($unresolvedDependencyHandles[$handle]);
				
				break;
			}
		}
		
		return $combineOrder;
	}
	
	public function buildCombinedFile()
	{
		global $map-block;
		
		$order = $this->getCombineOrder();
		
		$combined = array();
		$dest = plugin_dir_path(($this->proMode ? map-block_PRO_FILE : __DIR__)) . 'js/v8/map-block' . ($this->proMode ? '-pro' : '') . '.combined.js';
		
		foreach($order as $file)
		{
			if(preg_match('/\.(combined|min)\.js$/', $file))
				continue;

			$src = plugin_dir_path(__DIR__) . $file;
			
			if(!file_exists($src))
				$src = plugin_dir_path(map-block_PRO_FILE) . $file;
			
			$contents = "\r\n// $file\r\n" . file_get_contents($src);
			$combined[] = $contents;
		}
		
		$combined = implode("\r\n", $combined);
		
		// TODO: Uncomment and test
		//if(file_exists($dest) && md5(file_get_contents($dest)) == md5($combined))
			//return;	// No changes, no need to build
		
		file_put_contents($dest, $combined);
	}
	
	public function build()
	{
		$this->scanDependencies();
		$this->buildCombinedFile();
	}
	
	public function enqueueStyles()
	{	
		global $map-block;
	
		// wp_enqueue_style('map-block-color-picker', plugin_dir_url(__DIR__) . 'lib/spectrum.css');
		// wp_enqueue_style('datatables', '//cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css');
		
		wp_enqueue_style('remodal', plugin_dir_url(__DIR__) . 'lib/remodal.css');
		wp_enqueue_style('remodal-default-theme', plugin_dir_url(__DIR__) . 'lib/remodal-default-theme.css');
	}
	
	/**
	 * Returns an array of objects representing all scripts used by the plugin
	 * @return array
	 */
	public function getPluginScripts()
	{
		global $map-block;
		
		if($map-block->isUsingMinifiedScripts())
		{
			$dir = ($this->proMode ? plugin_dir_path(map-block_PRO_FILE) : plugin_dir_path(__DIR__));
			
			$combined = 'js/v8/map-block' . ($this->proMode ? '-pro' : '') . '.combined.js';
			$minified = 'js/v8/map-block' . ($this->proMode ? '-pro' : '') . '.min.js';
			
			$src = $minified;
			
			$minified_file_exists = file_exists($dir . $minified);
			
			if($minified_file_exists)
				$delta = filemtime($dir . $combined) - filemtime($dir . $minified);
			
			if(!$minified_file_exists || $delta > 0)
				$src = $combined;
			
			// TODO: Remove this, fix errors
			// $src = $combined;
			
			$scripts = array('map-block' => 
				(object)array(
					'src'	=> $src,
					'pro'	=> $this->proMode
				)
			);
		}
		else
		{
			// Enqueue core object with library dependencies
			$scripts = (array)json_decode(file_get_contents($this->scriptsFileLocation));
		}
		
		return $scripts;
	}
	
	public function enqueueScripts()
	{
		global $map-block;
		
		// Get library scripts
		$libraries = $this->getLibraryScripts();
		
		// Enqueue Google API call if necessary
		switch($map-block->settings->engine)
		{
			case 'google-maps':
				$loader = ($map-block->isProVersion() ? new GoogleProMapsLoader() : new GoogleMapsLoader());
				$loader->loadGoogleMaps();
				break;
				
			default:
				$loader = new OLLoader();
				$loader->loadOpenLayers();
				break;
		}
		
		// Enqueue library scripts first
		foreach($libraries as $handle => $src)
		{
			wp_enqueue_script($handle, $src, array('jquery'));
		}
		
		// FontAwesome?
		$version = (empty($map-block->settings->use_fontawesome) ? '4.*' : $map-block->settings->use_fontawesome);
		
		switch($version)
		{
			case 'none':
				break;
				
			case '5.*':
				wp_enqueue_style('fontawesome', 'https://use.fontawesome.com/releases/v5.0.9/css/all.css');
				
				// If we're not in admin, break. If we are, continue and enqueue FA 4 which is used by the map edit page
				if(!is_admin())
					break;
				
			default:
				wp_enqueue_style('fontawesome', plugin_dir_url(__DIR__) . 'css/font-awesome.min.css');
				break;
		}
		
		// Scripts
		$this->scripts = $this->getPluginScripts();
		
		// Give the core script library dependencies
		$dependencies = array_keys($libraries);
		
		// Sometimes we need to load the plugin JS files but not the maps API. The following code stops the API being loaded as a dependency of the plugin JS files when that is the case.
		$apiLoader = new GoogleMapsAPILoader();
		if($apiLoader->isIncludeAllowed())
			$dependencies[] = 'map-block_api_call';
		
		$this->scripts['map-block']->dependencies = $dependencies;
		
		$version_string = $map-block->getBasicVersion();
		if(method_exists($map-block, 'getProVersion'))
			$version_string .= '+pro-' . $map-block->getProVersion();
		
		// Enqueue other scripts
		foreach($this->scripts as $handle => $script)
		{
			$fullpath = plugin_dir_url(($script->pro ? map-block_PRO_FILE : __DIR__)) . $script->src;
			
			wp_enqueue_script($handle, $fullpath, $script->dependencies, $version_string);
		}
		
		// Enqueue localized data
		$this->enqueueLocalizedData();
		//$this->enqueueTourData();
		//$this->enqueueCustomJavascript();
	}
	
	public function enqueueLocalizedData()
	{
		global $map-block;
		
		$data = $map-block->getLocalizedData();
		
		wp_localize_script('map-block', 'map-block_localized_data', (array)$data);
	}
}
