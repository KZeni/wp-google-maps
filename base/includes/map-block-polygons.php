<?php
/*
Polygon functionality for Map Block
*/

if(!defined('ABSPATH'))
	exit;

add_action('wp_enqueue_scripts', function() {
	
	map-block_enqueue_fontawesome();
	
});

/**
 * Render polygon editor HTML
 * @param  integer $mid     Map ID
 * @return string           HTML outut
 */
function map-block_b_pro_add_poly($mid) {
    global $map-block_tblname_maps;
    global $wpdb;
    if ($_GET['action'] == "add_poly" && isset($mid)) {

        if( function_exists('google_maps_api_key_warning' ) ){ google_maps_api_key_warning(); }
        
        $mid = sanitize_text_field($mid);
        $res = map-block_get_map_data($mid);
        echo "
            

            
          
           <div class='wrap'>
                <h1>Map Block</h1>
                <div class='wide'>

                    <h2>".__("Add a Polygon","map-block")."</h2>
                    <form action='?page=map-block-menu&action=edit&map_id=".esc_attr($mid)."' method='post' id='map-blockaps_add_poly_form'>
                    <input type='hidden' name='map-blockaps_map_id' id='map-blockaps_map_id' value='".esc_attr($mid)."' />
                    
                    <table class='map-block-listing-comp' style='width:30%;float:left; height:400px;'>
                    <tr>
                        <td>".__("Name","map-block")."</td><td><input type=\"text\" value=\"\" name=\"poly_name\" /></td>
                    </tr>
                    <tr>
                        <td>".__("Title","map-block")."</td><td><input disabled type=\"text\" value=\"".__("Pro version only","map-block")."\" /><i><a href='".map-block_pro_link("http://www.map-blockaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=polygons")."' title='".__("Pro Version","map-block")."'>".__("Get the Pro add-on","map-block")."</a></i></td>
                    </tr>
                    <tr>
                        <td>".__("Link","map-block")."</td><td><input disabled type=\"text\" value=\"pro version only\" /></td> 
                    </tr>
                    <tr>
                        <td>".__("Line Color","map-block")."</td><td><input id=\"poly_line\" name=\"poly_line\" type=\"text\" class=\"color\" value=\"000000\" /></td>   
                    </tr>
                    <tr>
                        <td>".__("Line Opacity","map-block")."</td><td><input id=\"poly_line_opacity\" name=\"poly_line_opacity\" type=\"text\" value=\"0.5\" /> (0 - 1.0) example: 0.5 for 50%</td>   
                    </tr>
                    <tr>
                        <td>".__("Fill Color","map-block")."</td><td><input id=\"poly_fill\" name=\"poly_fill\" type=\"text\" class=\"color\" value=\"66ff00\" /></td>  
                    </tr>
                    <tr>
                        <td>".__("Opacity","map-block")."</td><td><input id=\"poly_opacity\" name=\"poly_opacity\" type=\"text\" value=\"0.5\" /> (0 - 1.0) example: 0.5 for 50%</td>   
                    </tr>
                    <tr>
                        <td>".__("On Hover Line Color","map-block")."</td><td><input disabled type=\"text\" value=\"".__("Pro version only","map-block")."\"/></td>   
                    </tr>
                    <tr>
                        <td>".__("On Hover Fill Color","map-block")."</td><td><input disabled type=\"text\" value=\"".__("Pro version only","map-block")."\"/></td>  
                    </tr>
                    <tr>
                        <td>".__("On Hover Opacity","map-block")."</td><td><input disabled type=\"text\"value=\"".__("Pro version only","map-block")."\" /></td>   
                    </tr>
					
                        
                    </table>

                    <div class='map-block_map_seventy'> 
                        <div id=\"map-block_map\">&nbsp;</div>
                    
                        <p>
                                <ul style=\"list-style:initial;\" class='update-nag update-blue update-slim update-map-overlay'>

                                    <li style=\"margin-left:30px;\">".__("Click on the map to insert a vertex.","map-block")."</li>
                                    <li style=\"margin-left:30px;\">".__("Click on a vertex to remove it.","map-block")."</li>
                                    <li style=\"margin-left:30px;\">".__("Drag a vertex to move it.","map-block")."</li>
                                </ul>
                        </p>
                    </div>

                     <p style='clear: both;'>Polygon data:<br /><textarea name=\"map-block_polygon\" id=\"poly_line_list\" style=\"width:90%; height:100px; border:1px solid #ccc; background-color:#FFF; padding:5px; overflow:auto;\"></textarea>
                     <!-- <p style='clear: both;'>Polygon data:<br /><textarea name=\"map-block_polygon_inner\" id=\"poly_line_list_inner\" style=\"width:90%; height:100px; border:1px solid #ccc; background-color:#FFF; padding:5px; overflow:auto;\"></textarea> -->
                    <p class='submit'><a href='javascript:history.back();' class='button button-secondary' title='".__("Cancel")."'>".__("Cancel")."</a> <input type='submit' name='map-block_save_poly' class='button-primary' value='".__("Save Polygon","map-block")." &raquo;' /></p>

                    </form>
                </div>
            </div>
        ";
    }
}


/**
 * Render polygon editor HTML (edit mode)
 * @param  integer $mid     Map ID
 * @return string           HTML outut
 */
function map-block_b_pro_edit_poly($mid) {
    global $map-block_tblname_maps;
    global $wpdb;

    if ($_GET['action'] == "edit_poly" && isset($mid)) {
        $mid = sanitize_text_field($mid);;
        $res = map-block_get_map_data($mid);
        $pol = map-block_b_return_poly_options(sanitize_text_field($_GET['poly_id']));

        echo "
            

           <div class='wrap'>
                <h1>Map Block</h1>
                <div class='wide'>

                    <h2>".__("Edit Polygon","map-block")."</h2>
                    <form action='?page=map-block-menu&action=edit&map_id=".esc_attr($mid)."' method='post' id='map-blockaps_edit_poly_form'>
                    <input type='hidden' name='map-blockaps_map_id' id='map-blockaps_map_id' value='".esc_attr($mid)."' />
                    <input type='hidden' name='map-blockaps_poly_id' id='map-blockaps_poly_id' value='".esc_attr($_GET['poly_id'])."' />
                        
                    <table class='map-block-listing-comp' style='width:30%;float:left; height:400px;'>
                    <tr>
                        <td>".__("Name","map-block")."</td><td><input type=\"text\" value=\"".esc_attr(stripslashes($pol->polyname))."\" name=\"poly_name\" /></td>
                    </tr>
                    <tr>
                        <td>".__("Title","map-block")."</td><td><input disabled type=\"text\" value=\"".__("Pro version only","map-block")."\" /><i><a href='".map-block_pro_link("http://www.map-blockaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=polygons")."' title='".__("Pro Version","map-block")."'>".__("Get the Pro add-on","map-block")."</a></i></td>
                    </tr>
                    <tr>
                        <td>".__("Link","map-block")."</td><td><input disabled type=\"text\" value=\"pro version only\" /></td> 
                    </tr>
                    <tr>
                        <td>".__("Line Color","map-block")."</td><td><input id=\"poly_line\" name=\"poly_line\" type=\"text\" class=\"color\" value=\"".esc_attr($pol->linecolor)."\" /></td>   
                    </tr>
                    <tr>
                        <td>".__("Line Opacity","map-block")."</td><td><input id=\"poly_line_opacity\" name=\"poly_line_opacity\" type=\"text\" value=\"".esc_attr($pol->lineopacity)."\" /> (0 - 1.0) example: 0.5 for 50%</td>   
                    </tr>
                    <tr>
                        <td>".__("Fill Color","map-block")."</td><td><input id=\"poly_fill\" name=\"poly_fill\" type=\"text\" class=\"color\" value=\"".esc_attr($pol->fillcolor)."\" /></td>  
                    </tr>
                    <tr>
                        <td>".__("Opacity","map-block")."</td><td><input id=\"poly_opacity\" name=\"poly_opacity\" type=\"text\" value=\"".esc_attr($pol->opacity)."\" /> (0 - 1.0) example: 0.5 for 50%</td>   
                    </tr>
                    <tr>
                        <td>".__("On Hover Line Color","map-block")."</td><td><input disabled type=\"text\" value=\"".__("Pro version only","map-block")."\"/></td>   
                    </tr>
                    <tr>
                        <td>".__("On Hover Fill Color","map-block")."</td><td><input disabled type=\"text\" value=\"".__("Pro version only","map-block")."\"/></td>  
                    </tr>
                    <tr>
                        <td>".__("On Hover Opacity","map-block")."</td><td><input disabled type=\"text\"value=\"".__("Pro version only","map-block")."\" /></td>   
                    </tr>
                    <tr>
                        <td>".__("Show Polygon","map-block")."</td>
						<td>
							<button id='fit-bounds-to-shape' 
								class='button button-secondary' 
								type='button' 
								title='" . __('Fit map bounds to shape', 'map-block') . "'
								data-fit-bounds-to-shape='poly'>
								<i class='fas fa-eye'></i>
							</button>
						</td>
                    </tr>    
                    </table>
                    
                    <div class='map-block_map_seventy'>        
                        <div id=\"map-block_map\" >&nbsp;</div>
                        <p>
                            <ul style=\"list-style:initial;\" class='update-nag update-blue update-slim update-map-overlay'>
                               
                                <li style=\"margin-left:30px;\">Click on the map to insert a vertex.</li>
                                <li style=\"margin-left:30px;\">Click on a vertex to remove it.</li>
                                <li style=\"margin-left:30px;\">Drag a vertex to move it.</li>
                            </ul>
                        </p>
                    </div>
                    

                     <p style='clear: both;' >Polygon data:<br /><textarea name=\"map-block_polygon\" id=\"poly_line_list\" style=\"width:90%; height:100px; border:1px solid #ccc; background-color:#FFF; padding:5px; overflow:auto;\"></textarea>
                     <!-- <p style='clear: both;' >Polygon data (inner):<br /><textarea name=\"map-block_polygon_inner\" id=\"poly_line_list_inner\" style=\"width:90%; height:100px; border:1px solid #ccc; background-color:#FFF; padding:5px; overflow:auto;\">".$pol->innerpolydata."</textarea> -->
                    <p class='submit'><a href='javascript:history.back();' class='button button-secondary' title='".__("Cancel")."'>".__("Cancel")."</a> <input type='submit' name='map-block_edit_poly' class='button-primary' value='".__("Save Polygon","map-block")." &raquo;' /></p>

                    </form>
                </div>


            </div>



        ";

    }



}

/**
 * Render polygons JS
 *
 * @todo  This needs to be converted to a native JS file with localized variables
 * 
 * @param  integer $mapid   Map ID
 * 
 * @return void
 */
function map-blockaps_b_admin_add_poly_javascript($mapid) {
        $res = map-block_get_map_data(sanitize_text_field($_GET['map_id']));
        $map-block_settings = get_option("map-block_OTHER_SETTINGS");


        $map-block_lat = $res->map_start_lat;
        $map-block_lng = $res->map_start_lng;
        $map-block_map_type = $res->type;
        $map-block_width = $res->map_width;
        $map-block_height = $res->map_height;
        $map-block_width_type = $res->map_width_type;
        $map-block_height_type = $res->map_height_type;
        if (!$map-block_map_type || $map-block_map_type == "" || $map-block_map_type == "1") { $map-block_map_type = "ROADMAP"; }
        else if ($map-block_map_type == "2") { $map-block_map_type = "SATELLITE"; }
        else if ($map-block_map_type == "3") { $map-block_map_type = "HYBRID"; }
        else if ($map-block_map_type == "4") { $map-block_map_type = "TERRAIN"; }
        else { $map-block_map_type = "ROADMAP"; }
        $start_zoom = $res->map_start_zoom;
        if ($start_zoom < 1 || !$start_zoom) {
            $start_zoom = 5;
        }


        if (isset($res->kml)) { $kml = $res->kml; } else { $kml = false; }

        
        $map-block_settings = get_option("map-block_OTHER_SETTINGS");
        if (isset($map-block_settings['map-block_api_version']) && $map-block_settings['map-block_api_version'] != "") {
            $api_version_string = "v=".$map-block_settings['map-block_api_version']."&";
        } else {
            $api_version_string = "v=3.exp&";
        }


        ?>
        <link rel='stylesheet' id='wpgooglemaps-css'  href='<?php echo map-blockaps_get_plugin_url(); ?>/css/map-block_style.css' type='text/css' media='all' />
        <script type="text/javascript" >
			jQuery(function($) {
                    function map-block_InitMap() {
                        var myLatLng = new google.maps.LatLng(<?php echo $map-block_lat; ?>,<?php echo $map-block_lng; ?>);
                        MYMAP.init('#map-block_map', myLatLng, <?php echo $start_zoom; ?>);
                    }
                    jQuery("#map-block_map").css({
                        height:'<?php echo $map-block_height; ?><?php echo $map-block_height_type; ?>',
                        width:'<?php echo $map-block_width; ?><?php echo $map-block_width_type; ?>'
                    });
                    map-block_InitMap();
                    jQuery("#poly_line").focusout(function() {
                        poly.setOptions({ strokeColor: "#"+jQuery("#poly_line").val() }); 
                    });
                    jQuery("#poly_fill").focusout(function() {
                        poly.setOptions({ fillColor: "#"+jQuery("#poly_fill").val() }); 
                    });
                    jQuery("#poly_line_opacity").focusout(function() {
                        poly.setOptions({ strokeOpacity: jQuery("#poly_line_opacity").val() }); 
                    });
                    jQuery("#poly_opacity").keyup(function() {
                        poly.setOptions({ fillOpacity: jQuery("#poly_opacity").val() }); 
                    });
                    
                    
            });
             // polygons variables
            var poly;
            var poly_markers = [];
            var poly_path = new google.maps.MVCArray;

            var MYMAP = {
                map: null,
                bounds: null
            }
            MYMAP.init = function(selector, latLng, zoom) {
                  var myOptions = {
                    zoom:zoom,
                    center: latLng,
                    zoomControl: true,
                    panControl: true,
                    mapTypeControl: true,
                    streetViewControl: true,
                    mapTypeId: google.maps.MapTypeId.<?php echo $map-block_map_type; ?>
                  }
                this.map = new google.maps.Map(jQuery(selector)[0], myOptions);
                this.bounds = new google.maps.LatLngBounds();
                // polygons
                poly = new google.maps.Polygon({
                  strokeWeight: 3,
                  fillColor: '#66FF00'
                });
                poly.setMap(this.map);
                poly.setPaths(new google.maps.MVCArray([poly_path]));
                google.maps.event.addListener(this.map, 'click', addPoint);
                <?php
                $total_poly_array = map-block_b_return_polygon_id_array(sanitize_text_field($_GET['map_id']));
                if ($total_poly_array > 0) {
                foreach ($total_poly_array as $poly_id) {
                    $polyoptions = map-block_b_return_poly_options($poly_id);
                    $linecolor = $polyoptions->linecolor;
                    $fillcolor = $polyoptions->fillcolor;
                    $fillopacity = $polyoptions->opacity;
                    $lineopacity = $polyoptions->lineopacity;
                    $title = $polyoptions->title;
                    $link = $polyoptions->link;
                    $ohlinecolor = $polyoptions->ohlinecolor;
                    $ohfillcolor = $polyoptions->ohfillcolor;
                    $ohopacity = $polyoptions->ohopacity;
                    if (!$linecolor) { $linecolor = "000000"; }
                    if (!$fillcolor) { $fillcolor = "66FF00"; }
                    if ($fillopacity == "") { $fillopacity = "0.5"; }
                    if ($lineopacity == "") { $lineopacity = "1.0"; }
                    if ($ohlinecolor == "") { $ohlinecolor = $linecolor; }
                    if ($ohfillcolor == "") { $ohfillcolor = $fillcolor; }
                    if ($ohopacity == "") { $ohopacity = $fillopacity; }
                    $linecolor = "#".$linecolor;
                    $fillcolor = "#".$fillcolor;
                    $ohlinecolor = "#".$ohlinecolor;
                    $ohfillcolor = "#".$ohfillcolor;
                    
                    $poly_array = map-block_b_return_polygon_array($poly_id);
                    
                    if (sizeof($poly_array) > 1) { ?>

                        var map-block_PathData_<?php echo $poly_id; ?> = [<?php
                        foreach ($poly_array as $single_poly) {
                            $poly_data_raw = str_replace(" ","",$single_poly);
                            $poly_data_raw = explode(",",$poly_data_raw);
                            $lat = $poly_data_raw[0];
                            $lng = $poly_data_raw[1];
                            ?>
                            new google.maps.LatLng(<?php echo $lat; ?>, <?php echo $lng; ?>),            
                            <?php
                        }
                ?>];
                var map-block_Path_<?php echo $poly_id; ?> = new google.maps.Polygon({
                  path: map-block_PathData_<?php echo $poly_id; ?>,
                  strokeColor: "<?php echo $linecolor; ?>",
                  fillOpacity: "<?php echo $fillopacity; ?>",
                  strokeOpacity: "<?php echo $lineopacity; ?>",
                  fillColor: "<?php echo $fillcolor; ?>",
                  strokeWeight: 2
                });

                map-block_Path_<?php echo $poly_id; ?>.setMap(this.map);
                <?php } } ?>

                <?php } ?>

                
                <?php if ($kml != false) { ?>
                var temp = '<?php echo $kml; ?>';
                arr = temp.split(',');
                arr.forEach(function(entry) {
                    var georssLayer = new google.maps.KmlLayer(entry+'?tstamp=<?php echo time(); ?>',{suppressInfoWindows: true, zindex: 0, clickable : false});
                    georssLayer.setMap(MYMAP.map);

                });
                <?php } ?>

            }
            function addPoint(event) {
                
                    poly_path.insertAt(poly_path.length, event.latLng);

                    var poly_marker = new google.maps.Marker({
                      position: event.latLng,
                      map: MYMAP.map,
                      icon: "<?php echo map-blockaps_get_plugin_url()."/images/marker.png"; ?>",
                      draggable: true
                    });
                    

                    
                    poly_markers.push(poly_marker);
                    poly_marker.setTitle("#" + poly_path.length);

                    google.maps.event.addListener(poly_marker, 'click', function() {
                      poly_marker.setMap(null);
                      for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
                      poly_markers.splice(i, 1);
                      poly_path.removeAt(i);
                      updatePolyPath(poly_path);    
                      }
                    );

                    google.maps.event.addListener(poly_marker, 'dragend', function() {
                      for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
                      poly_path.setAt(i, poly_marker.getPosition());
                      updatePolyPath(poly_path);    
                      }
                    );
                        
                        
                    updatePolyPath(poly_path);    
              }
              
              function updatePolyPath(poly_path) {
                var temp_array;
                temp_array = "";
                poly_path.forEach(function(latLng, index) { 
//                  temp_array = temp_array + " ["+ index +"] => "+ latLng + ", ";
                  temp_array = temp_array + latLng + ",";
                }); 
                jQuery("#poly_line_list").html(temp_array);
              }            


        </script>
        <?php
}

/**
 * Render polygon edit JS
 *
 * @todo  This needs to be converted to a native JS file with localized variables
 * 
 * @param  integer $mapid       Map ID
 * @param  integer $polyid      Polygon ID
 * 
 * @return void
 */
function map-blockaps_b_admin_edit_poly_javascript($mapid,$polyid) {
        $res = map-block_get_map_data($mapid);
        
        $map-block_settings = get_option("map-block_OTHER_SETTINGS");


        $map-block_lat = $res->map_start_lat;
        
        $map-block_lng = $res->map_start_lng;
        $map-block_map_type = $res->type;
        $map-block_width = $res->map_width;
        $map-block_height = $res->map_height;
        $map-block_width_type = $res->map_width_type;
        $map-block_height_type = $res->map_height_type;
        if (!$map-block_map_type || $map-block_map_type == "" || $map-block_map_type == "1") { $map-block_map_type = "ROADMAP"; }
        else if ($map-block_map_type == "2") { $map-block_map_type = "SATELLITE"; }
        else if ($map-block_map_type == "3") { $map-block_map_type = "HYBRID"; }
        else if ($map-block_map_type == "4") { $map-block_map_type = "TERRAIN"; }
        else { $map-block_map_type = "ROADMAP"; }
        $start_zoom = $res->map_start_zoom;
        if ($start_zoom < 1 || !$start_zoom) {
            $start_zoom = 5;
        }
        if (isset($res->kml)) { $kml = $res->kml; } else { $kml = false; }
        
        ?>
        <link rel='stylesheet' id='wpgooglemaps-css'  href='<?php echo map-blockaps_get_plugin_url(); ?>/css/map-block_style.css' type='text/css' media='all' />
        <script type="text/javascript" >
             // polygons variables
            var poly;
            var poly_markers = [];
            var poly_path = new google.maps.MVCArray;
                
            jQuery(function($) {
                
                    function map-block_InitMap() {
                        var myLatLng = new google.maps.LatLng(<?php echo $map-block_lat; ?>,<?php echo $map-block_lng; ?>);
                        MYMAP.init('#map-block_map', myLatLng, <?php echo $start_zoom; ?>);
                    }
                    jQuery("#map-block_map").css({
                        height:'<?php echo $map-block_height; ?><?php echo $map-block_height_type; ?>',
                        width:'<?php echo $map-block_width; ?><?php echo $map-block_width_type; ?>'
                    });
                    map-block_InitMap();
                    
                    
                    jQuery("#poly_line").focusout(function() {
                        poly.setOptions({ strokeColor: "#"+jQuery("#poly_line").val() }); 
                    });
                    jQuery("#poly_fill").focusout(function() {
                        poly.setOptions({ fillColor: "#"+jQuery("#poly_fill").val() }); 
                    });
                    jQuery("#poly_opacity").keyup(function() {
                        poly.setOptions({ fillOpacity: jQuery("#poly_opacity").val() }); 
                    });
                    jQuery("#poly_line_opacity").keyup(function() {
                        poly.setOptions({ strokeOpacity: jQuery("#poly_line_opacity").val() }); 
                    });
            });
            

            var MYMAP = {
                map: null,
                bounds: null
            }
            MYMAP.init = function(selector, latLng, zoom) {
                  var myOptions = {
                    zoom:zoom,
                    center: latLng,
                    zoomControl: true,
                    panControl: true,
                    mapTypeControl: true,
                    streetViewControl: false,
                    mapTypeId: google.maps.MapTypeId.<?php echo $map-block_map_type; ?>
                  }
                this.map = new google.maps.Map(jQuery(selector)[0], myOptions);
                this.bounds = new google.maps.LatLngBounds();
                // polygons
                
                <?php
                $total_poly_array = map-block_b_return_polygon_id_array(sanitize_text_field($_GET['map_id']));
                if ($total_poly_array > 0) {
                foreach ($total_poly_array as $poly_id) {
                    $polyoptions = map-block_b_return_poly_options($poly_id);
                    $linecolor = $polyoptions->linecolor;
                    $fillcolor = $polyoptions->fillcolor;
                    $fillopacity = $polyoptions->opacity;
                    $lineopacity = $polyoptions->lineopacity;
                    $title = $polyoptions->title;
                    $link = $polyoptions->link;
                    $ohlinecolor = $polyoptions->ohlinecolor;
                    $ohfillcolor = $polyoptions->ohfillcolor;
                    $ohopacity = $polyoptions->ohopacity;
                    if (!$linecolor) { $linecolor = "000000"; }
                    if (!$fillcolor) { $fillcolor = "66FF00"; }
                    if ($fillopacity == "") { $fillopacity = "0.5"; }
                    if ($lineopacity == "") { $lineopacity = "1.0"; }
                    if ($ohlinecolor == "") { $ohlinecolor = $linecolor; }
                    if ($ohfillcolor == "") { $ohfillcolor = $fillcolor; }
                    if ($ohopacity == "") { $ohopacity = $fillopacity; }
                    $linecolor = "#".$linecolor;
                    $fillcolor = "#".$fillcolor;
                    $ohlinecolor = "#".$ohlinecolor;
                    $ohfillcolor = "#".$ohfillcolor;
                    
                    $poly_array = map-block_b_return_polygon_array($poly_id);
                    
                    if (sizeof($poly_array) > 1) {
                        if ($polyid != $poly_id) {
                     ?>

                        var map-block_PathData_<?php echo $poly_id; ?> = [<?php
                        foreach ($poly_array as $single_poly) {
                            $poly_data_raw = str_replace(" ","",$single_poly);
                            $poly_data_raw = explode(",",$poly_data_raw);
                            $lat = $poly_data_raw[0];
                            $lng = $poly_data_raw[1];
                            ?>
                            new google.maps.LatLng(<?php echo $lat; ?>, <?php echo $lng; ?>),            
                            <?php
                        } 
                ?>]; 
                var map-block_Path_<?php echo $poly_id; ?> = new google.maps.Polygon({
                  path: map-block_PathData_<?php echo $poly_id; ?>,
                  strokeColor: "<?php echo $linecolor; ?>",
                  fillOpacity: "<?php echo $fillopacity; ?>",
                  strokeOpacity: "<?php echo $lineopacity; ?>",
                  fillColor: "<?php echo $fillcolor; ?>",
                  strokeWeight: 2
                });

                map-block_Path_<?php echo $poly_id; ?>.setMap(this.map);
                <?php } } } ?>

                <?php } ?>


                <?php if ($kml != false) { ?>
                var temp = '<?php echo $kml; ?>';
                arr = temp.split(',');
                arr.forEach(function(entry) {
                    var georssLayer = new google.maps.KmlLayer(entry+'?tstamp=<?php echo time(); ?>',{suppressInfoWindows: true, zindex: 0, clickable : false});
                    georssLayer.setMap(MYMAP.map);

                });
                <?php } ?>


                
                addPolygon();
                

            }
            function addPolygon() {
                <?php
                $poly_array = map-block_b_return_polygon_array($polyid);
                    
                $polyoptions = map-block_b_return_poly_options($polyid);
                $linecolor = $polyoptions->linecolor;
                $lineopacity = $polyoptions->lineopacity;
                $fillcolor = $polyoptions->fillcolor;
                $fillopacity = $polyoptions->opacity;
                if (!$linecolor) { $linecolor = "000000"; }
                if (!$fillcolor) { $fillcolor = "66FF00"; }
                if ($fillopacity == "") { $fillopacity = "0.5"; }
                if ($lineopacity == "") { $lineopacity = "1"; }
                $linecolor = "#".$linecolor;
                $fillcolor = "#".$fillcolor;
                
                foreach ($poly_array as $single_poly) {
                    $poly_data_raw = str_replace(" ","",$single_poly);
                    $poly_data_raw = explode(",",$poly_data_raw);
                    $lat = $poly_data_raw[0];
                    $lng = $poly_data_raw[1];
                    ?>
                    var temp_gps = new google.maps.LatLng(<?php echo $lat; ?>, <?php echo $lng; ?>);
                    addExistingPoint(temp_gps);
                    updatePolyPath(poly_path);
                    
                    
                    
                    <?php
                }
                ?>
                
                poly = new google.maps.Polygon({
                    strokeWeight: 3,
                    strokeColor: "<?php echo $linecolor; ?>",
                    strokeOpacity: "<?php echo $lineopacity; ?>",
                    fillOpacity: "<?php echo $fillopacity; ?>",
                    fillColor: "<?php echo $fillcolor; ?>"
                });
                poly.setMap(MYMAP.map);
                poly.setPaths(poly_path);
                google.maps.event.addListener(MYMAP.map, 'click', addPoint);
				
				setTimeout(function() {
					jQuery("#fit-bounds-to-shape").click();
				}, 500);
            }
            function addExistingPoint(temp_gps) {
                poly_path.insertAt(poly_path.length, temp_gps);
                var poly_marker = new google.maps.Marker({
                  position: temp_gps,
                  map: MYMAP.map,
                  draggable: true
                });
                poly_markers.push(poly_marker);
                poly_marker.setTitle("#" + poly_path.length);
                google.maps.event.addListener(poly_marker, 'click', function() {
                      poly_marker.setMap(null);
                      for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
                      poly_markers.splice(i, 1);
                      poly_path.removeAt(i);
                      updatePolyPath(poly_path);    
                      }
                    );

                    google.maps.event.addListener(poly_marker, 'dragend', function() {
                      for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
                      poly_path.setAt(i, poly_marker.getPosition());
                      updatePolyPath(poly_path);    
                      }
                    );
            }
            function addPoint(event) {
                
                    poly_path.insertAt(poly_path.length, event.latLng);

                    var poly_marker = new google.maps.Marker({
                      position: event.latLng,
                      map: MYMAP.map,
                      icon: "<?php echo map-blockaps_get_plugin_url()."/images/marker.png"; ?>",
                      draggable: true
                    });
                    

                    
                    poly_markers.push(poly_marker);
                    poly_marker.setTitle("#" + poly_path.length);

                    google.maps.event.addListener(poly_marker, 'click', function() {
                      poly_marker.setMap(null);
                      for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
                      poly_markers.splice(i, 1);
                      poly_path.removeAt(i);
                      updatePolyPath(poly_path);    
                      }
                    );

                    google.maps.event.addListener(poly_marker, 'dragend', function() {
                      for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
                      poly_path.setAt(i, poly_marker.getPosition());
                      updatePolyPath(poly_path);    
                      }
                    );
                        
                        
                    updatePolyPath(poly_path);    
              }
              
              function updatePolyPath(poly_path) {
                var temp_array;
                temp_array = "";
                poly_path.forEach(function(latLng, index) { 
//                  temp_array = temp_array + " ["+ index +"] => "+ latLng + ", ";
                  temp_array = temp_array + latLng + ",";
                }); 
                jQuery("#poly_line_list").html(temp_array);
              }            
             

        </script>
        <?php
}

/**
 * Returns the list of polygons displayed in the map editor
 *
 * @todo Build this as a hook or filter instead of a function call
 * 
 * @param  integer  $map_id Map ID
 * @param  boolean  $admin  Identify if user is admin or not
 * @param  string   $width  Width to be used for HTML output
 * @return string           List HTML
 */
function map-block_b_return_polygon_list($map_id,$admin = true,$width = "100%") {
    map-blockaps_debugger("return_marker_start");

    global $wpdb;
    global $map-block_tblname_poly;
    $map-block_tmp = "";

    $results = $wpdb->get_results( $wpdb->prepare("SELECT * FROM $map-block_tblname_poly WHERE `map_id` = %d ORDER BY `id` DESC", intval($map_id)) );
    
    $map-block_tmp .= "
        
        <table id=\"map-block_table_poly\" class=\"display\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:$width;\">
        <thead>
        <tr>
            <th align='left'><strong>".__("ID","map-block")."</strong></th>
            <th align='left'><strong>".__("Name","map-block")."</strong></th>
            <th align='left' style='width:182px;'><strong>".__("Action","map-block")."</strong></th>
        </tr>
        </thead>
        <tbody>
    ";
    $res = map-block_get_map_data($map_id);
    $default_marker = "<img src='".$res->default_marker."' />";
    
    //$map-block_data = get_option('map-block');
    //if ($map-block_data['map_default_marker']) { $default_icon = "<img src='".$map-block_data['map_default_marker']."' />"; } else { $default_icon = "<img src='".map-blockaps_get_plugin_url()."/images/marker.png' />"; }

    foreach ( $results as $result ) {
        unset($poly_data);
        unset($poly_array);
        $poly_data = '';
        $poly_array = map-block_b_return_polygon_array($result->id);
        foreach ($poly_array as $poly_single) {
            $poly_data .= $poly_single.",";
        } 
        if (isset($result->polyname) && $result->polyname != "") { $polygon_name = $result->polyname; } else { $polygon_name = "Polygon".$result->id; }
        
        $map-block_tmp .= "
            <tr id=\"map-block_poly_tr_".$result->id."\">
                <td height=\"40\">".$result->id."</td>
                <td height=\"40\">".esc_attr(stripslashes($polygon_name))."</td>
                <td width='170' align='left'>
                    <a href=\"".get_option('siteurl')."/wp-admin/admin.php?page=map-block-menu&action=edit_poly&map_id=".$map_id."&poly_id=".$result->id."\" title=\"".__("Edit","map-block")."\" class=\"map-block_edit_poly_btn button\" id=\"".$result->id."\"><i class=\"fa fa-edit\"> </i></a> 
                    <a href=\"javascript:void(0);\" title=\"".__("Delete this polygon","map-block")."\" class=\"map-block_poly_del_btn button\" id=\"".$result->id."\"><i class=\"fa fa-times\"> </i></a>
                </td>
            </tr>";
        
    }
    $map-block_tmp .= "</tbody></table>";
    

    return $map-block_tmp;
    
}

/**
 * Retrieve polygon options from DB
 * 
 * @param  integer $poly_id Polygon ID
 * @return array            MYSQL Array
 */
function map-block_b_return_poly_options($poly_id) {
    global $wpdb;
    global $map-block_tblname_poly;
    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $map-block_tblname_poly WHERE `id` = %d LIMIT 1",intval($poly_id)) );
    foreach ( $results as $result ) {
        return $result;
    }
}

/**
 * Return the polygon data in the correct format
 * 
 * @param  integer $poly_id Polygon ID
 * @return array            Poly data array
 */
function map-block_b_return_polygon_array($poly_id) {
    global $wpdb;
    global $map-block_tblname_poly;
	
    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $map-block_tblname_poly WHERE `id` = %d LIMIT 1",intval($poly_id)) );
	
	if(empty($results))
		return null;
	
	$polyline = $results[0];
	$polydata = $polyline->polydata;
	
	$regex = '/-?(\d+)(\.\d+)?,\s*-?(\d+)(\.\d+)?/';
	
	if(!preg_match_all($regex, $polydata, $m))
		return array();
	
	return $m[0];
}

/**
 * Return polygon ID array
 *
 * This is used when creating the JSON array of all the polygons and their unique options
 * 
 * @param  integer  $map_id     Map ID
 * @return array                Array of IDs
 */
function map-block_b_return_polygon_id_array($map_id) {
    global $wpdb;
    global $map-block_tblname_poly;
    $ret = array();
    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $map-block_tblname_poly WHERE `map_id` = %d",intval($map_id)) );
    foreach ( $results as $result ) {
        $current_id = $result->id;
        $ret[] = $current_id;
        
    }
    return $ret;
}