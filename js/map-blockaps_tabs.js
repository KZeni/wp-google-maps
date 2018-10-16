jQuery(function($) {
	
   $("#map-blockaps_tabs").tabs();
   $("#map-blockaps_tabs_markers").tabs(); 
   
   $( "#slider-range-max" ).slider({
      range: "max",
      min: 1,
      max: 21,
      value: $( "#amount" ).val(),
      slide: function( event, ui ) {
        $("#map-block_start_zoom").val(ui.value);
        MYMAP.map.setZoom(ui.value);
        
        
      }
    });
    
    $('#map-block_map_height_type').on('change', function() {
        if (this.value === "%") {
            $("#map-block_height_warning").show();
        }
    }); 
    
    $('.map-block_settings_marker_pull').on('click', function() {
        if (this.value === '1') {
            $(".map-block_marker_dir_tr").css('visibility','visible');
            $(".map-block_marker_dir_tr").css('display','table-row');
            $(".map-block_marker_url_tr").css('visibility','visible');
            $(".map-block_marker_url_tr").css('display','table-row');
        } else {
            $(".map-block_marker_dir_tr").css('visibility','hidden');
            $(".map-block_marker_dir_tr").css('display','none');
            $(".map-block_marker_url_tr").css('visibility','hidden');
            $(".map-block_marker_url_tr").css('display','none');
        }
    });

    $("#map-block_preview_theme").click(function() {
        var style_data_orig = $("#map-block_styling_json").val();
        var style_data = JSON.parse(style_data_orig);


        MYMAP.map.setOptions({styles: style_data}); 

    });

    $(".map-block_theme_selection").click(function() {
      var tid = $(this).attr('tid');
      var style_data_orig = $("#rb_map-block_theme_data_"+tid).val();
      var style_data = JSON.parse(style_data_orig);

      $("#map-block_styling_json").val(style_data_orig);

      $('.map-block_theme_radio').each(function(i, obj) {
        $(this).attr('checked', false);
      });
      $("#rb_map-block_theme_"+tid).attr('checked', true);
      $('.map-block_theme_selection').each(function(i, obj) {
        $(this).removeClass("map-block_theme_selection_activate");
      });

      $("#map-block_theme_selection_"+tid).addClass("map-block_theme_selection_activate");
      
      MYMAP.map.setOptions({styles: style_data});
  });
    
	
});