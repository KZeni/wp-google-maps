<?php

namespace map-block;

require_once(plugin_dir_path(__FILE__) . 'class.crud.php');

class Map extends Crud
{
	public function __construct($id_or_fields=-1)
	{
		global $wpdb;
		
		Crud::__construct("{$wpdb->prefix}map-block_maps", $id_or_fields);
	}
	
	public static function create_instance($id_or_fields=-1)
	{
		return apply_filters('map-block_create_map_instance', $id_or_fields);
	}
	
	protected function get_arbitrary_data_column_name()
	{
		return "other_settings";
	}
}
