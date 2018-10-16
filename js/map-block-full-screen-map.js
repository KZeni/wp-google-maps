lightbox_open = new Array();
jQuery(function($) {

    jQuery( document ).on( 'wpgooglemaps_loaded', '#map-block_map', function() {
        wpgooglemaps_load_full_screen_button(map-blockaps_localize[map-blockaps_mapid]['id'])
    });

    lightbox_open[map-blockaps_localize[map-blockaps_mapid]['id']] = 0;


    var map-blockaps_fs_interval = new Array();

    /*Added for lightbox control*/

    jQuery('body').on("click",".map-blockaps_full_screen_icon", function(){
        var thismapid = jQuery(this).attr('mid');

        var map-blockaps_fs_center = MYMAP.map.getCenter();

        jQuery("#map-block_map").toggleClass("map-blockaps_fullscreen");

        if(lightbox_open[thismapid] === 0){
            //jQuery('.map-block_lightbox_map_'+thismapid+' .map-block_map').addClass('map-block_lb_override');
            //jQuery('.map-block_lb_overlay_closed').addClass('map-block_lb_overlay');
            //jQuery('.map-block_lb_overlay_closed').attr('mid',thismapid);
            jQuery(this).html(map-blockaps_full_screen_string_2);
            lightbox_open[thismapid] = 1;
            google.maps.event.trigger(MYMAP.map, "resize");
            MYMAP.map.setCenter(map-blockaps_fs_center);
        }
        else {
            jQuery(this).html(map-blockaps_full_screen_string_1);
            lightbox_open[thismapid] = 0;
            google.maps.event.trigger(MYMAP.map, "resize");
            MYMAP.map.setCenter(map-blockaps_fs_center);
        }
    });
        


    jQuery("body").on("click",".map-block_gd",function () {
        var thismapid = jQuery(this).attr('id');
        if(lightbox_open[thismapid] === 1){
            wpgooglemaps_close_full_screen(thismapid);
            
        }
    });
        



    map-blockaps_fs_interval[parseInt(map-blockaps_localize[map-blockaps_mapid]['id'])] = setInterval(check_map(parseInt(map-blockaps_localize[map-blockaps_mapid]['id'])),500);



});

function check_map(mapid) {


    if(MYMAP.map !== null){
        wpgooglemaps_load_full_screen_button(mapid);
        clearInterval(map-blockaps_fs_interval[mapid]);
        return;
    }
    // wait a little longer for the map to load.

}


function wpgooglemaps_load_full_screen_button(map_id) {
    google.maps.event.addListenerOnce(MYMAP.map, 'idle', function(){

        var iDiv = document.createElement('div');
        iDiv.id = 'map-block_fs_button_'+map_id;
        iDiv.className = 'map-block_fs_button';
        document.getElementsByTagName('body')[0].appendChild(iDiv);

        // Now create and append to iDiv
        var innerDiv = document.createElement('span');
        if (lightbox_open[map_id] == 1 ) {
            innerDiv.className = 'map-blockaps_full_screen_icon_close';
            innerDiv.alt = map-blockaps_full_screen_string_2;
            innerDiv.innerHTML = map-blockaps_full_screen_string_2;
            innerDiv.title = map-blockaps_full_screen_string_2;
            innerDiv.setAttribute('mid',map_id);
        } else {
            innerDiv.className = 'map-blockaps_full_screen_icon';
            innerDiv.alt = map-blockaps_full_screen_string_1;
            innerDiv.innerHTML = map-blockaps_full_screen_string_1;
            innerDiv.title = map-blockaps_full_screen_string_1;
            innerDiv.setAttribute('mid',map_id);
        }
        // The variable iDiv is still good... Just append to it.
        iDiv.appendChild(innerDiv);




        var legend = document.getElementById(iDiv.id);
        jQuery(legend).css('display','block');
        MYMAP.map.controls[google.maps.ControlPosition.LEFT_TOP].push(iDiv);
   
    });
}
