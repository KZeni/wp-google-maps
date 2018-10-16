jQuery(function($) {

	var mapid = jQuery("#map-block_id").val();

	var data = {
		action: 'track_usage',
		mapid: mapid
	}

	jQuery.post(ajaxurl, data, function( response ){

	});

});