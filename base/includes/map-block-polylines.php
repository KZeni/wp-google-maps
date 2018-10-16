<?php
/*
Polylines functionality for Map Block
*/



/**
 * Render polyline editor HTML
 * @param  integer $mid     Map ID
 * @return string           HTML outut
 */
function map-block_b_pro_add_polyline($mid) {
    global $map-block_tblname_maps;
    global $wpdb;
    if ($_GET['action'] == "add_polyline" && isset($mid)) {

        if( function_exists('google_maps_api_key_warning' ) ){ google_maps_api_key_warning(); }

        $res = map-block_get_map_data($mid);
        echo "
            

            
          
           <div class='wrap'>
                <h1>Map Block</h1>
                <div class='wide'>

                    <h2>".__("Add a Polyline","map-block")."</h2>
                    <form action='?page=map-block-menu&action=edit&map_id=".esc_attr($mid)."' method='post' id='map-blockaps_add_polyline_form'>
                    <input type='hidden' name='map-blockaps_map_id' id='map-blockaps_map_id' value='".esc_attr($mid)."' />
                    <table class='map-block-listing-comp' style='width:30%;float:left;'>
                        <tr>
                            <td>
                                ".__("Name","map-block")."
                            </td>
                            <td>
                                <input id=\"poly_line\" name=\"poly_name\" type=\"text\" value=\"\" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Line Color","map-block")."
                            </td>
                            <td>
                                <input id=\"poly_line\" name=\"poly_line\" type=\"text\" class=\"color\" value=\"000000\" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Opacity","map-block")."
                            </td>
                            <td>
                                <input id=\"poly_opacity\" name=\"poly_opacity\" type=\"text\" value=\"0.8\" /> (0 - 1.0) example: 0.8 for 80%
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Line Thickness","map-block")."
                            </td>
                            <td>
                                <input id=\"poly_thickness\" name=\"poly_thickness\" type=\"text\" value=\"4\" /> (0 - 50) example: 4
                            </td>
                                
						</tr>
						
						
						
                    </table>
                    <div class='map-block_map_seventy'> 
                        <div id=\"map-block_map\">&nbsp;</div>
                        <p>

                                <ul style=\"list-style:initial;\" class='update-nag update-blue update-slim update-map-overlay'>
                                    
                                    <li style=\"margin-left:30px;\">Click on the map to insert a vertex.</li>
                                    <li style=\"margin-left:30px;\">Click on a vertex to remove it.</li>
                                    <li style=\"margin-left:30px;\">Drag a vertex to move it.</li>
                                </ul>
                        </p>
                    </div>


                     <p style='clear: both;'>Polyline data:<br /><textarea name=\"map-block_polyline\" id=\"poly_line_list\" style=\"width:90%; height:100px; border:1px solid #ccc; background-color:#FFF; padding:5px; overflow:auto;\"></textarea>
                    <p class='submit'><a href='javascript:history.back();' class='button button-secondary' title='".__("Cancel")."'>".__("Cancel")."</a> <input type='submit' name='map-block_save_polyline' class='button-primary' value='".__("Save Polyline","map-block")." &raquo;' /></p>

                    </form>
                </div>


            </div>



        ";

    }



}


/**
 * Render polyline editor HTML (edit mode)
 * @param  integer $mid     Map ID
 * @return string           HTML outut
 */
function map-block_b_pro_edit_polyline($mid) {
    global $map-block_tblname_maps;
    global $wpdb;
    if ($_GET['action'] == "edit_polyline" && isset($mid)) {
        $res = map-block_get_map_data($mid);
        $pol = map-block_b_return_polyline_options(sanitize_text_field($_GET['poly_id']));

        echo "
            

           <div class='wrap'>
                <h1>Map Block</h1>
                <div class='wide'>

                    <h2>".__("Edit Polyline","map-block")."</h2>
                    <form action='?page=map-block-menu&action=edit&map_id=".esc_attr($mid)."' method='post' id='map-blockaps_edit_poly_form'>
                    <input type='hidden' name='map-blockaps_map_id' id='map-blockaps_map_id' value='".esc_attr($mid)."' />
                    <input type='hidden' name='map-blockaps_poly_id' id='map-blockaps_poly_id' value='".esc_attr($_GET['poly_id'])."' />
                    <table class='map-block-listing-comp' style='width:30%;float:left;'>
                        <tr>
                            <td>
                                ".__("Name","map-block")."
                            </td>
                            <td>
                                <input id=\"poly_line\" name=\"poly_name\" type=\"text\" value=\"".esc_attr(stripslashes($pol->polyname))."\" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Line Color","map-block")."
                            </td>
                            <td>
                                <input id=\"poly_line\" name=\"poly_line\" type=\"text\" class=\"color\" value=\"".esc_attr($pol->linecolor)."\" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Opacity","map-block")."
                            </td>
                            <td>
                                <input id=\"poly_opacity\" name=\"poly_opacity\" type=\"text\" value=\"".esc_attr($pol->opacity)."\" /> (0 - 1.0) example: 0.8 for 80%
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Line Thickness","map-block")."
                            </td>
                            <td>
                                <input id=\"poly_thickness\" name=\"poly_thickness\" type=\"text\" value=\"".esc_attr($pol->linethickness)."\" /> (0 - 50) example: 4
                            </td>
						</tr>
					
						<tr>
							
							<td>
								".__('Show Polyline', 'map-block')."
							</td>
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
                        <div id=\"map-block_map\">&nbsp;</div>
                        <p>
                                <ul style=\"list-style:initial;\" class='update-nag update-blue update-slim update-map-overlay'>

                                    <li style=\"margin-left:30px;\">Click on the map to insert a vertex.</li>
                                    <li style=\"margin-left:30px;\">Click on a vertex to remove it.</li>
                                    <li style=\"margin-left:30px;\">Drag a vertex to move it.</li>
                                </ul>
                        </p>
                    </div>

                     <p style='clear: both;'>Polyline data:<br /><textarea name=\"map-block_polyline\" id=\"poly_line_list\" style=\"width:90%; height:100px; border:1px solid #ccc; background-color:#FFF; padding:5px; overflow:auto;\"></textarea>
                    <p class='submit'><a href='javascript:history.back();' class='button button-secondary' title='".__("Cancel")."'>".__("Cancel")."</a> <input type='submit' name='map-block_edit_polyline' class='button-primary' value='".__("Save Polyline","map-block")." &raquo;' /></p>

                    </form>
                </div>


            </div>



        ";

    }



}
/**
 * Render polyline JS
 *
 * @todo  This needs to be converted to a native JS file with localized variables
 * 
 * @param  integer $mapid   Map ID
 * 
 * @return void
 */
function map-blockaps_b_admin_add_polyline_javascript($mapid) {
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
                    jQuery("#poly_opacity").keyup(function() {
                        poly.setOptions({ strokeOpacity: jQuery("#poly_opacity").val() }); 
                    });
                    jQuery("#poly_thickness").keyup(function() {
                        poly.setOptions({ strokeWeight: jQuery("#poly_thickness").val() }); 
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
                poly = new google.maps.Polyline({
                  strokeWeight: 3,
                  fillColor: '#66FF00'
                });
                poly.setMap(this.map);
                
                google.maps.event.addListener(this.map, 'click', addPoint);
                <?php
                /* polylines */
                    $total_polyline_array = map-block_b_return_polyline_id_array(sanitize_text_field($_GET['map_id']));
                    if ($total_polyline_array > 0) {
                    foreach ($total_polyline_array as $poly_id) {
                        $polyoptions = map-block_b_return_polyline_options($poly_id);
                        $linecolor = $polyoptions->linecolor;
                        $fillopacity = $polyoptions->opacity;
                        $linethickness = $polyoptions->linethickness;
                        if (!$linecolor) { $linecolor = "000000"; }
                        if (!$linethickness) { $linethickness = "4"; }
                        if (!$fillopacity) { $fillopacity = "0.5"; }
                        $linecolor = "#".$linecolor;
                        $poly_array = map-block_b_return_polyline_array($poly_id);
                        ?>
                    
                <?php if (sizeof($poly_array) > 1) { ?>
                    var map-block_PathLineData_<?php echo $poly_id; ?> = [
                    <?php
                    $poly_array = map-block_b_return_polyline_array($poly_id);

                    foreach ($poly_array as $single_poly) {
                        $poly_data_raw = str_replace(" ","",$single_poly);
                        $poly_data_raw = explode(",",$poly_data_raw);
                        $lat = $poly_data_raw[0];
                        $lng = $poly_data_raw[1];
                        ?>
                        new google.maps.LatLng(<?php echo $lat; ?>, <?php echo $lng; ?>),            
                        <?php
                    }
                    ?>
                ];
                var map-block_PathLine_<?php echo $poly_id; ?> = new google.maps.Polyline({
                  path: map-block_PathLineData_<?php echo $poly_id; ?>,
                  strokeColor: "<?php echo $linecolor; ?>",
                  strokeOpacity: "<?php echo $fillopacity; ?>",
                  strokeWeight: "<?php echo $linethickness; ?>"
                  
                });



                map-block_PathLine_<?php echo $poly_id; ?>.setMap(this.map);



                <?php } } } ?> 

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
                
                    
                    var path = poly.getPath();
                    path.push(event.latLng);

                    var poly_marker = new google.maps.Marker({
                      position: event.latLng,
                      map: MYMAP.map,
                      icon: "<?php echo map-blockaps_get_plugin_url()."/images/marker.png"; ?>",
                      draggable: true
                    });
                    

                    
                    poly_markers.push(poly_marker);
                    poly_marker.setTitle("#" + path.length);

                    google.maps.event.addListener(poly_marker, 'click', function() {
                      poly_marker.setMap(null);
                      for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
                      poly_markers.splice(i, 1);
                      path.removeAt(i);
                      updatePolyPath(path);    
                      }
                    );

                    google.maps.event.addListener(poly_marker, 'dragend', function() {
                      for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
                      path.setAt(i, poly_marker.getPosition());
                      updatePolyPath(path);    
                      }
                    );
                        
                        
                    updatePolyPath(path);    
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
 * Render polyline edit JS
 *
 * @todo  This needs to be converted to a native JS file with localized variables
 * 
 * @param  integer $mapid       Map ID
 * @param  integer $polyid      Polygon ID
 * 
 * @return void
 */
function map-blockaps_b_admin_edit_polyline_javascript($mapid,$polyid) {
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
        
        $map-block_settings = get_option("map-block_OTHER_SETTINGS");
        
        
        
        $poly_array = map-block_b_return_polyline_array($polyid);

        $polyoptions = map-block_b_return_polyline_options($polyid);
        $linecolor = $polyoptions->linecolor;
        $linethickness = $polyoptions->linethickness;
        $fillopacity = $polyoptions->opacity;
        if (!$linecolor) { $linecolor = "000000"; }
        if (!$linethickness) { $linethickness = "4"; }
        if (!$fillopacity) { $fillopacity = "0.5"; }
        $linecolor = "#".$linecolor;
                        
        ?>
        <link rel='stylesheet' id='wpgooglemaps-css'  href='<?php echo map-blockaps_get_plugin_url(); ?>/css/map-block_style.css' type='text/css' media='all' />
        <script type="text/javascript" >
             // polygons variables
            var poly;
            var poly_markers = [];
            var poly_path = new google.maps.MVCArray;
            var path;
                
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
                    jQuery("#poly_opacity").keyup(function() {
                        poly.setOptions({ strokeOpacity: jQuery("#poly_opacity").val() }); 
                    });
                    jQuery("#poly_thickness").keyup(function() {
                        poly.setOptions({ strokeWeight: jQuery("#poly_thickness").val() }); 
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
                    streetViewControl: true,
                    mapTypeId: google.maps.MapTypeId.<?php echo $map-block_map_type; ?>
                  }
                this.map = new google.maps.Map(jQuery(selector)[0], myOptions);
                this.bounds = new google.maps.LatLngBounds();
                // polygons
                
                
                
                poly = new google.maps.Polyline({
                    strokeWeight: "<?php echo $linethickness; ?>",
                    strokeColor: "<?php echo $linecolor; ?>",
                    strokeOpacity: "<?php echo $fillopacity; ?>"
                });
                path = poly.getPath();

                <?php
                /* polylines */
                    $total_polyline_array = map-block_b_return_polyline_id_array(sanitize_text_field($_GET['map_id']));
                    if ($total_polyline_array > 0) {
                    foreach ($total_polyline_array as $poly_id) {
                        $polyoptions = map-block_b_return_polyline_options($poly_id);
                        $linecolor = $polyoptions->linecolor;
                        $fillopacity = $polyoptions->opacity;
                        $linethickness = $polyoptions->linethickness;
                        if (!$linecolor) { $linecolor = "000000"; }
                        if (!$linethickness) { $linethickness = "4"; }
                        if (!$fillopacity) { $fillopacity = "0.5"; }
                        $linecolor = "#".$linecolor;
                        $poly_array = map-block_b_return_polyline_array($poly_id);
                        ?>
                    
                    <?php if (sizeof($poly_array) > 1) { 
                        if ($poly_id != $polyid) {
                    ?>
                        var map-block_PathLineData_<?php echo $poly_id; ?> = [
                        <?php
                        $poly_array = map-block_b_return_polyline_array($poly_id);
						
                        foreach ($poly_array as $single_poly) {
                            $poly_data_raw = str_replace(" ","",$single_poly);
                            $poly_data_raw = explode(",",$poly_data_raw);
                            $lat = $poly_data_raw[0];
                            $lng = $poly_data_raw[1];
                            ?>
                            new google.maps.LatLng(<?php echo $lat; ?>, <?php echo $lng; ?>),            
                            <?php
                        }
                        ?>
                    ];
					
                    var map-block_PathLine_<?php echo $poly_id; ?> = new google.maps.Polyline({
                      path: map-block_PathLineData_<?php echo $poly_id; ?>,
                      strokeColor: "<?php echo $linecolor; ?>",
                      strokeOpacity: "<?php echo $fillopacity; ?>",
                      strokeWeight: "<?php echo $linethickness; ?>"
                      
                    });

                    map-block_PathLine_<?php echo $poly_id; ?>.setMap(this.map);
                    <?php } } } }   ?> 


                <?php if ($kml != false) { ?>
                var temp = '<?php echo $kml; ?>';
                arr = temp.split(',');
                arr.forEach(function(entry) {
                    var georssLayer = new google.maps.KmlLayer(entry+'?tstamp=<?php echo time(); ?>',{suppressInfoWindows: true, zindex: 0, clickable : false});
                    georssLayer.setMap(MYMAP.map);

                });
                <?php } ?>


                addPolyline();
                
				setTimeout(function() {
					$("#fit-bounds-to-shape").click();
				}, 500);

            }
            function addPolyline() {
                
                
                
                <?php
              $poly_array = map-block_b_return_polyline_array($polyid);
                    
                $polyoptions = map-block_b_return_polyline_options($polyid);
                $linecolor = $polyoptions->linecolor;
                $fillopacity = $polyoptions->opacity;
                if (!$linecolor) { $linecolor = "000000"; }
                if (!$fillopacity) { $fillopacity = "0.5"; }
                $linecolor = "#".$linecolor;
                
                foreach ($poly_array as $single_poly) {
                    $poly_data_raw = str_replace(" ","",$single_poly);
                    $poly_data_raw = str_replace(")","",$poly_data_raw );
                    $poly_data_raw = str_replace("(","",$poly_data_raw );
                    $poly_data_raw = explode(",",$poly_data_raw);
                    $lat = $poly_data_raw[0];
                    $lng = $poly_data_raw[1];
                    ?>
                    var temp_gps = new google.maps.LatLng(<?php echo $lat; ?>, <?php echo $lng; ?>);
                    addExistingPoint(temp_gps);
                    updatePolyPath(path);
                    
                    
                    
                    <?php
                }
                ?>                
                
                poly.setMap(MYMAP.map);
                
                google.maps.event.addListener(MYMAP.map, 'click', addPoint);
            }
            function addExistingPoint(temp_gps) {
                
                
                
                path.push(temp_gps);

                var poly_marker = new google.maps.Marker({
                  position: temp_gps,
                  map: MYMAP.map,
                  draggable: true
                });
                poly_markers.push(poly_marker);
                poly_marker.setTitle("#" + path.length);
                google.maps.event.addListener(poly_marker, 'click', function() {
                      poly_marker.setMap(null);
                      for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
                      poly_markers.splice(i, 1);
                      path.removeAt(i);
                      updatePolyPath(path);    
                      }
                    );

                    google.maps.event.addListener(poly_marker, 'dragend', function() {
                      for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
                      path.setAt(i, poly_marker.getPosition());
                      updatePolyPath(path);    
                      }
                    );
            }
            function addPoint(event) {
                
                   var path = poly.getPath();
                    path.push(event.latLng);

                    var poly_marker = new google.maps.Marker({
                      position: event.latLng,
                      map: MYMAP.map,
                      draggable: true
                    });


                    
                    poly_markers.push(poly_marker);
                    poly_marker.setTitle("#" + path.length);

                    google.maps.event.addListener(poly_marker, 'click', function() {
                      poly_marker.setMap(null);
                      for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
                      poly_markers.splice(i, 1);
                      path.removeAt(i);
                      updatePolyPath(path);    
                      }
                    );

                    google.maps.event.addListener(poly_marker, 'dragend', function() {
                      for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
                      path.setAt(i, poly_marker.getPosition());
                      updatePolyPath(path);    
                      }
                    );
                        
                        
                    updatePolyPath(path);    
              }
              
              function updatePolyPath(poly_path) {
                var temp_array;
                temp_array = "";
                path.forEach(function(latLng, index) { 
//                  temp_array = temp_array + " ["+ index +"] => "+ latLng + ", ";
                  temp_array = temp_array + latLng + ",";
                }); 
                jQuery("#poly_line_list").html(temp_array);
              }            
             

        </script>
        <?php
}
/**
 * Returns the list of polylines displayed in the map editor
 *
 * @todo Build this as a hook or filter instead of a function call
 * 
 * @param  integer  $map_id Map ID
 * @param  boolean  $admin  Identify if user is admin or not
 * @param  string   $width  Width to be used for HTML output
 * @return string           List HTML
 */
function map-block_b_return_polyline_list($map_id,$admin = true,$width = "100%") {
    map-blockaps_debugger("return_marker_start");

    global $wpdb;
    global $map-block_tblname_polylines;
    $map-block_tmp = "";

    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $map-block_tblname_polylines WHERE `map_id` = %d ORDER BY `id` DESC",intval($map_id)) );
    
    $map-block_tmp .= "
        
        <table id=\"map-block_table_polyline\" class=\"display\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:$width;\">
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
        $poly_array = map-block_b_return_polyline_array($result->id);
        foreach ($poly_array as $poly_single) {
            $poly_data .= $poly_single.",";
        } 
        if (isset($result->polyname) && $result->polyname != "") { $poly_name = $result->polyname; } else { $poly_name = "Polyline".$result->id; }

        $map-block_tmp .= "
            <tr id=\"map-block_poly_tr_".$result->id."\">
                <td height=\"40\">".$result->id."</td>
                <td height=\"40\">".esc_attr(stripslashes($poly_name))."</td>
                <td width='170' align='left'>
                    <a href=\"".get_option('siteurl')."/wp-admin/admin.php?page=map-block-menu&action=edit_polyline&map_id=".$map_id."&poly_id=".$result->id."\" title=\"".__("Edit","map-block")."\" class=\"map-block_edit_poly_btn button\" id=\"".$result->id."\"><i class=\"fa fa-edit\"> </i></a> 
                    <a href=\"javascript:void(0);\" title=\"".__("Delete this polyline","map-block")."\" class=\"map-block_polyline_del_btn button\" id=\"".$result->id."\"><i class=\"fa fa-times\"> </i></a>
                </td>
            </tr>";
        
    }
    $map-block_tmp .= "</tbody></table>";
    

    return $map-block_tmp;
    
}
/**
 * Retrieve polyline options from DB
 * 
 * @param  integer $poly_id Polyline ID
 * @return array            MYSQL Array
 */
function map-block_b_return_polyline_options($poly_id) {
    global $wpdb;
    global $map-block_tblname_polylines;
    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $map-block_tblname_polylines WHERE `id` = %d LIMIT 1",intval($poly_id)) );
    foreach ( $results as $result ) {
        return $result;
    }
}

/**
 * Return the polyline data in the format of an array of coordinate-pair strings
 * 
 * @param  integer $poly_id Polyline ID
 * @return array            Poly data array of coordinate-pair strings
 */
function map-block_b_return_polyline_array($poly_id) {
    global $wpdb;
    global $map-block_tblname_polylines;
	
    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $map-block_tblname_polylines WHERE `id` = %d LIMIT 1",intval($poly_id)) );
	
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
 * Return polyline ID array
 *
 * This is used when creating the JSON array of all the polylines and their unique options
 * 
 * @param  integer  $map_id     Map ID
 * @return array                Array of IDs
 */
function map-block_b_return_polyline_id_array($map_id) {
    global $wpdb;
    global $map-block_tblname_polylines;
    $ret = array();
    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $map-block_tblname_polylines WHERE `map_id` = %d",intval($map_id)) );
    foreach ( $results as $result ) {
        $current_id = $result->id;
        $ret[] = $current_id;
        
    }
    return $ret;
}