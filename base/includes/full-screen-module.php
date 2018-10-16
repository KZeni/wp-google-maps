<?php
/*
Full screen module
 */

if(!defined('ABSPATH'))
	exit;
 
/**
 * Add the style sheet to the top of the page
 * @author Nick Duncan <nick@codecabin.co.za>
 * @since  1.0.0
 * @return void
 */
add_action("wpgooglemaps_hook_user_styles","wpgooglemaps_full_screen_hook_control_user_styles",10);
function wpgooglemaps_full_screen_hook_control_user_styles() {
	global $map-block_version;
}



/**
 * Add relevant settings to the main Map Block Settings page
 * @param  string $ret             Current table output
 * @param  array  $map-block_settings General settings array
 * @since  1.0.0
 * @author Nick Duncan <nick@codecabin.co.za>
 * @return string
 */
add_filter("wpgooglemaps_map_settings_output_bottom","wpgooglemaps_full_screen_filter_control_map_settings_output_bottom",10,2);
function wpgooglemaps_full_screen_filter_control_map_settings_output_bottom($ret,$map-block_settings) {
    if (isset($map-block_settings['map-block_fs_enabled']) && $map-block_settings['map-block_fs_enabled'] == '1') { $map-block_fs_enabled = "checked='checked'"; } else { $map-block_fs_enabled = ''; }
    if (isset($map-block_settings['map-block_fs_string1'])) { $map-block_fs_string1 = $map-block_settings['map-block_fs_string1']; } else { $map-block_fs_string1 = __("Full screen","map-block"); }
    if (isset($map-block_settings['map-block_fs_string2'])) { $map-block_fs_string2 = $map-block_settings['map-block_fs_string2']; } else { $map-block_fs_string2 = __("Close full screen","map-block"); }

    $ret .= "            <table class='form-table'>";
    $ret .= "               <tr>";
    $ret .= "                        <td width='200' valign='top'>".__("Enable Full Screen Option","map-block").":</td>";
    $ret .= "                     <td>";
    $ret .= "                           <div class='switch'><input name='map-block_fs_enabled' type='checkbox' class='cmn-toggle cmn-toggle-yes-no' id='map-block_fs_enabled' value='1' $map-block_fs_enabled /> <label for='map-block_fs_enabled' data-on='".__("Yes", "map-block")."' data-off='".__("No", "map-block")."'></label></div><br />";
    $ret .= "                    </td>";
    $ret .= "                </tr>";
    $ret .= "               <tr>";
    $ret .= "                        <td width='200' valign='top'>".__("Open Full Screen String","map-block").":</td>";
    $ret .= "                     <td>";
    $ret .= "                           <input name='map-block_fs_string1' type='text' id='map-block_fs_string1' value='$map-block_fs_string1' />";
    $ret .= "                    </td>";
    $ret .= "                </tr>";
    $ret .= "               <tr>";
    $ret .= "                        <td width='200' valign='top'>".__("Close Full Screen String","map-block").":</td>";
    $ret .= "                     <td>";
    $ret .= "                           <input name='map-block_fs_string2' type='text' id='map-block_fs_string2' value='$map-block_fs_string2' />";
    $ret .= "                    </td>";
    $ret .= "                </tr>";
    $ret .= "             </table>";



	return $ret;

}

add_filter("wpgooglemaps_filter_save_settings","wpgooglemaps_full_screen_filter_control_save_settings",10,1);
function wpgooglemaps_full_screen_filter_control_save_settings($map-block_data) {
    if (isset($_POST['map-block_fs_enabled'])) { $map-block_data['map-block_fs_enabled'] = sanitize_text_field($_POST['map-block_fs_enabled']); } else { $map-block_data['map-block_fs_enabled'] = 0; }
    if (isset($_POST['map-block_fs_string1'])) { $map-block_data['map-block_fs_string1'] = sanitize_text_field($_POST['map-block_fs_string1']); } else { $map-block_data['map-block_fs_string1'] = __("Full screen","map-block"); }
    if (isset($_POST['map-block_fs_string2'])) { $map-block_data['map-block_fs_string2'] = sanitize_text_field($_POST['map-block_fs_string2']); } else { $map-block_data['map-block_fs_string2'] = __("Close full screen","map-block"); }
	return $map-block_data;
}



add_action("wpgooglemaps_hook_user_js_after_core","wpgooglemaps_full_screen_hook_control_user_js_after_core",10);
function wpgooglemaps_full_screen_hook_control_user_js_after_core() {
    if (!function_exists("map-blockaps_pro_activate")) {
        global $map-block_version;
        $map-block_settings = get_option("map-block_OTHER_SETTINGS");
        if (isset($map-block_settings['map-block_fs_enabled']) && $map-block_settings['map-block_fs_enabled'] == '1') { 
            wp_register_style( 'map-block-full-screen', plugins_url('css/map-block-full-screen-map.css', dirname(dirname(__FILE__))),array(),$map-block_version);
            wp_enqueue_style( 'map-block-full-screen' );
            wp_register_script('map-block-full-screen-js', plugins_url('/js/map-block-full-screen-map.js',dirname(dirname(__FILE__))), array(), $map-block_version, false);
            wp_enqueue_script('map-block-full-screen-js');
        }
    }
}

add_action("wpgooglemaps_hook_user_js_after_localize","wpgooglemaps_full_screen_hook_control_user_js_after_localize");
function wpgooglemaps_full_screen_hook_control_user_js_after_localize() {
	$map-block_settings = get_option("map-block_OTHER_SETTINGS");
    if (isset($map-block_settings['map-block_fs_string1']) && $map-block_settings['map-block_fs_string1'] != '') { $map-block_fs_string1 = $map-block_settings['map-block_fs_string1']; } else { $map-block_fs_string1 = __("Full screen","map-block"); }
    if (isset($map-block_settings['map-block_fs_string2']) && $map-block_settings['map-block_fs_string2'] != '') { $map-block_fs_string2 = $map-block_settings['map-block_fs_string2']; } else { $map-block_fs_string2 = __("Close full screen","map-block"); }


	wp_localize_script( 'map-block-full-screen-js', 'map-blockaps_full_screen_string_1', $map-block_fs_string1);
	wp_localize_script( 'map-block-full-screen-js', 'map-blockaps_full_screen_string_2', $map-block_fs_string2);


}