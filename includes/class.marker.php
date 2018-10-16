<?php

namespace WPGMZA;

require_once(plugin_dir_path(__FILE__) . '/class.crud.php');

class Marker extends Crud implements \JsonSerializable
{
	const DEFAULT_ICON = "//maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png";
	
	protected $custom_fields;
	
	public function __construct($id_or_fields=-1)
	{
		global $wpdb;
		
		Crud::__construct("{$wpdb->prefix}wpgmza", $id_or_fields);
		
		if(class_exists('WPGMZA\\CustomMarkerFields'))
			$this->custom_fields = apply_filters('wpgmza_get_marker_custom_fields', $this->id);
	}
	
	public static function create_instance($id_or_fields=-1)
	{
		return apply_filters('wpgmza_create_marker_instance', $id_or_fields);
	}
	
	public static function get_table_name_static()
	{
		global $wpdb;
		return "{$wpdb->prefix}wpgmza";
	}
	
	public function jsonSerialize()
	{
		$json = Crud::jsonSerialize();
		
		unset($json['latlng']);
		
		$json['custom_field_data'] = $this->custom_fields;
		
		return $json;
	}
	
	protected function get_placeholder_by_type($type)
	{
		global $wpgmza;
		
		if($type == 'point')
			return "{$wpgmza->spatialFunctionPrefix}GeomFromText(%s)";
		
		return Crud::get_placeholder_by_type($type);
	}
	
	protected function get_column_parameter($name)
	{
		if($name == 'latlng')
			return "POINT(" . floatval($this->lat) . " " . floatval($this->lng) . ")";
		
		return Crud::get_column_parameter($name);
	}
	
	protected function get_arbitrary_data_column_name()
	{
		return 'other_data';
	}
	
	public function update()
	{
		Crud::update();
		
		// TODO: Update markers-has-categories
	}
	
	protected function update_latlng()
	{
		global $wpdb;
		global $wpgmza;
		
		$params = array(
			$this->lat,
			$this->lng,
			$this->get_column_parameter('latlng'),
			$this->id
		);
		
		$stmt = $wpdb->prepare("UPDATE " . $this->get_table_name() . " SET lat=%s, lng=%s, latlng={$wpgmza->spatialFunctionPrefix}GeomFromText(%s) WHERE id=%d", $params);
		
		$wpdb->query($stmt);
	}
	
	public function __set($name, $value)
	{
		Crud::__set($name, $value);
		
		switch($name)
		{
			case 'lat':
			case 'lng':
			case 'latlng':
				$this->update_latlng();
				break;
		}
	}
}

// You can remove this filter and add your own delegate to subclass Marker
add_filter('wpgmza_create_marker_instance', 'WPGMZA\\create_marker_instance_delegate', 10, 1);

function create_marker_instance_delegate($id)
{
	return new Marker($id);
}
