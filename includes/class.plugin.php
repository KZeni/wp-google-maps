<?php

namespace map-block;

class Plugin
{
	const PAGE_MAP_LIST			= "map-list";
	const PAGE_MAP_EDIT			= "map-edit";
	const PAGE_SETTINGS			= "map-settings";
	const PAGE_SUPPORT			= "map-support";
	
	const PAGE_CATEGORIES		= "categories";
	const PAGE_ADVANCED			= "advanced";
	const PAGE_CUSTOM_FIELDS	= "custom-fields";
	
	private static $enqueueScriptActions = array(
		'wp_enqueue_scripts',
		'admin_enqueue_scripts',
		'enqueue_block_assets'
	);
	public static $enqueueScriptsFired = false;
	
	public $settings;
	
	protected $scriptLoader;
	protected $restAPI;
	
	private $mysqlVersion = null;
	private $cachedVersion = null;
	private $legacySettings;
	
	public function __construct()
	{
		global $wpdb;
		
		add_filter('load_textdomain_mofile', array($this, 'onLoadTextDomainMOFile'), 10, 2);
		
		$this->mysqlVersion = $wpdb->get_var('SELECT VERSION()');
		
		$this->legacySettings = get_option('map-block_OTHER_SETTINGS');
		if(!$this->legacySettings)
			$this->legacySettings = array();
		
		$settings = $this->getDefaultSettings();
		
		// $temp = GlobalSettings::createInstance();
		
		// Legacy compatibility
		global $map-block_pro_version;
		
		// TODO: This should be in default settings, this code is duplicaetd
		if(!empty($map-block_pro_version) && version_compare(trim($map-block_pro_version), '7.10.00', '<'))
		{
			$self = $this;
			
			$settings['map-block_maps_engine'] = $settings['engine'] = 'google-maps';
			
			add_filter('wpgooglemaps_filter_map_div_output', function($output) use ($self) {
				
				$loader = new GoogleMapsAPILoader();
				$loader->registerGoogleMaps();
				$loader->enqueueGoogleMaps();
				
				$self->loadScripts();
				
				return $output;
				
			});
		}
		
		$this->settings = (object)array_merge($this->legacySettings, $settings);
		
		$this->restAPI = new RestAPI();
		$this->gutenbergIntegration = Integration\Gutenberg::createInstance();
		
		if(!empty($this->settings->map-block_maps_engine))
			$this->settings->engine = $this->settings->map-block_maps_engine;
		
		if(!empty($_COOKIE['map-block-developer-mode']))
			$this->settings->developer_mode = true;
		
		foreach(Plugin::$enqueueScriptActions as $action)
		{
			add_action($action, function() use ($action) {
				Plugin::$enqueueScriptsFired = true;
			}, 1);
		}
			
		if($this->settings->engine == 'open-layers')
			require_once(plugin_dir_path(__FILE__) . 'open-layers/class.nominatim-geocode-cache.php');
	}
	
	public function __get($name)
	{
		switch($name)
		{
			case "spatialFunctionPrefix":
				$result = '';
				
				if(!empty($this->mysqlVersion) && preg_match('/^\d+/', $this->mysqlVersion, $majorVersion) && (int)$majorVersion[0] > 8)
					$result = 'ST_';
				
				return $result;
				break;
				
			case "gdprCompliance":
				// Temporary shim
				global $map-blockGDPRCompliance;
				return $map-blockGDPRCompliance;
				break;
		}
		
		return $this->{$name};
	}
	
	public function loadScripts()
	{
		if(!$this->scriptLoader)
			$this->scriptLoader = new ScriptLoader($this->isProVersion());
		
		if(!empty($this->settings->developer_mode))
			$this->scriptLoader->build();
		
		if(Plugin::$enqueueScriptsFired)
		{
			$this->scriptLoader->enqueueScripts();
			$this->scriptLoader->enqueueStyles();
		}
		else
		{
			foreach(Plugin::$enqueueScriptActions as $action)
			{
				add_action($action, function() {
					$this->scriptLoader->enqueueScripts();
					$this->scriptLoader->enqueueStyles();
				});
			}
		}
	}
	
	public function getDefaultSettings()
	{
		//$defaultEngine = (empty($this->legacySettings['map-block_maps_engine']) || $this->legacySettings['map-block_maps_engine'] != 'google-maps' ? 'open-layers' : 'google-maps');
		$defaultEngine = 'google-maps';
		
		return apply_filters('map-block_plugin_get_default_settings', array(
			'engine' 				=> $defaultEngine,
			'google_maps_api_key'	=> get_option('map-block_google_maps_api_key'),
			'default_marker_icon'	=> "//maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png",
			'developer_mode'		=> !empty($this->legacySettings['developer_mode'])
		));
	}
	
	public function getLocalizedData()
	{
		global $map-blockGDPRCompliance;
		
		$document = new DOMDocument();
		$document->loadPHPFile(plugin_dir_path(__DIR__) . 'html/google-maps-api-error-dialog.html.php');
		$googleMapsAPIErrorDialogHTML = $document->saveInnerBody();
		
		$strings = new Strings();
		
		$settings = clone $this->settings;
		if(isset($settings->map-block_settings_ugm_email_address))
			unset($settings->map-block_settings_ugm_email_address);
		
		return apply_filters('map-block_plugin_get_localized_data', array(
			'ajaxurl' 				=> admin_url('admin-ajax.php'),
			'resturl'				=> get_rest_url(null, 'map-block/v1'),
			
			'html'					=> array(
				'googleMapsAPIErrorDialog' => $googleMapsAPIErrorDialogHTML
			),
			
			'settings' 				=> $settings,
			'currentPage'			=> $this->getCurrentPage(),
			'userCanAdministrator'	=> (current_user_can('administrator') ? 1 : 0),
			
			'localized_strings'		=> $strings->getLocalizedStrings(),
			'api_consent_html'		=> $map-blockGDPRCompliance->getConsentPromptHTML(),
			'basic_version'			=> $this->getBasicVersion(),
			'_isProVersion'			=> $this->isProVersion(),
			'is_admin'				=> (is_admin() ? 1 : 0)
		));
	}
	
	public function getCurrentPage()
	{
		if(!isset($_GET['page']))
			return null;
		
		switch($_GET['page'])
		{
			case 'map-block-menu':
				if(isset($_GET['action']) && $_GET['action'] == 'edit')
					return Plugin::PAGE_MAP_EDIT;
				
				return Plugin::PAGE_MAP_LIST;
				break;
				
			case 'map-block-menu-settings':
				return Plugin::PAGE_SETTINGS;
				break;
				
			case 'map-block-menu-support':
				return Plugin::PAGE_SUPPORT;
				break;
				
			case 'map-block-menu-categories':
				return Plugin::PAGE_CATEGORIES;
				break;
				
			case 'map-block-menu-advanced':
				return Plugin::PAGE_ADVANCED;
				break;
				
			case 'map-block-menu-custom-fields':
				return Plugin::PAGE_CUSTOM_FIELDS;
				break;
		}
		
		return null;
	}
	
	public function isUsingMinifiedScripts()
	{
		return empty($this->settings->developer_mode);
	}
	
	public function isInDeveloperMode()
	{
		return !(empty($this->settings->developer_mode) && !isset($_COOKIE['map-block-developer-mode']));
	}
	
	public function isProVersion()
	{
		return false;
	}
	
	public function getBasicVersion()
	{
		if($this->cachedVersion != null)
			return $this->cachedVersion;
		
		$subject = file_get_contents(plugin_dir_path(__DIR__) . 'wpGoogleMaps.php');
		if(preg_match('/Version:\s*(.+)/', $subject, $m))
			$this->cachedVersion = $m[1];
		
		return $this->cachedVersion;
	}
	
	public function onLoadTextDomainMOFile($mofile, $domain)
	{
		if($domain == 'map-block')
			$mofile = plugin_dir_path(__DIR__) . 'languages/map-block-' . get_locale() . '.mo';
		
		return $mofile;
	}
}

function create_plugin_instance()
{
	if(defined('map-block_PRO_VERSION'))
		return new ProPlugin();
	
	return new Plugin();
}

add_action('plugins_loaded', function() {
	global $map-block;
	add_filter('map-block_create_plugin_instance', 'map-block\\create_plugin_instance', 10, 0);
	$map-block = apply_filters('map-block_create_plugin_instance', null);
});
