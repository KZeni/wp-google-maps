<?php

namespace map-block;

class NominatimGeocodeCache
{
	public function __construct()
	{
		global $wpdb;
		
		$this->table = $wpdb->prefix . "map-block_nominatim_geocode_cache";
		
		if(!$wpdb->get_var("SHOW TABLES LIKE '{$this->table}'"))
		{
			require_once(ABSPATH . '/wp-admin/includes/upgrade.php');
			
			\dbDelta("CREATE TABLE {$this->table} (
				id int(11) NOT NULL AUTO_INCREMENT,
				query VARCHAR(512),
				response TEXT,
				PRIMARY KEY  (id)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1");
		}
	}
	
	public function get($query)
	{
		global $wpdb;
		
		// Check the cache first, as per the nominatim usage policy
		$stmt = $wpdb->prepare("SELECT response FROM {$this->table} WHERE query=%s LIMIT 1", array($query));
		
		$stmt = apply_filters( 'map-block_ol_nomination_cache_query_get', $stmt, $query );

		$string = $wpdb->get_var($stmt);
		$json = null;
		
		if(!empty($string))
			$json = json_decode(stripslashes($string));
		
		return $json;
	}
	
	public function set($query, $response)
	{
		global $wpdb;
		
		if(empty($query))
			throw new \Exception("First argument cannot be empty");
				
		$stmt = $wpdb->prepare("INSERT INTO {$this->table} (query, response) VALUES (%s, %s)", array(
			$query,
			$response
		));

		$stmt = apply_filters( 'map-block_ol_nomination_cache_query_set', $stmt, $query, $response );

		$wpdb->query($stmt);
	}
}

function query_nominatim_cache()
{
	
	$cache = new NominatimGeocodeCache();
	$record = $cache->get($_GET['query']);
	
	if(!$record)
		$record = array();

	wp_send_json($record);
	exit;
}

function store_nominatim_cache()
{
	$cache = new NominatimGeocodeCache();
	$cache->set($_POST['query'], $_POST['response']);
	
	wp_send_json(array(
		'success' => 1
	));
	exit;
}

add_action('wp_ajax_map-block_query_nominatim_cache', 			'map-block\\query_nominatim_cache');
add_action('wp_ajax_nopriv_map-block_query_nominatim_cache', 	'map-block\\query_nominatim_cache');

add_action('wp_ajax_map-block_store_nominatim_cache', 			'map-block\\store_nominatim_cache');
add_action('wp_ajax_nopriv_map-block_store_nominatim_cache', 	'map-block\\store_nominatim_cache');
