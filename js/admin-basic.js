jQuery(function($) {
	
	$("button[data-fit-bounds-to-shape]").each(function(index, el) {
		
		$(el).on("click", function(event) {
			
			var name = $(el).attr("data-fit-bounds-to-shape");
			var shape = window[name];
			var bounds;
			
			if(shape instanceof google.maps.Polygon || shape instanceof google.maps.Polyline)
			{
				bounds = new google.maps.LatLngBounds();
				shape.getPath().forEach(function(element, index) {
					bounds.extend(element);
				});
			}
			else
				bounds = shape.getBounds();
		
			MYMAP.map.fitBounds(bounds);
		});
		
	});
	
	$(document.body).on("click", "#map-block-gdpr-privacy-policy-notice .notice-dismiss", function(event) {
		
		$.ajax(map-block.ajaxurl, {
			data: {
				action: "map-block_gdpr_privacy_policy_notice_dismissed"
			}
		})
		
	});
	
	$("body").on("click",".map-block_copy_shortcode", function() {
		var $temp = $('<input>');
		var $tmp2 = $('<span id="map-block_tmp" style="display:none; width:100%; text-align:center;">');
		$("body").append($temp);
		$temp.val($(this).val()).select();
		document.execCommand("copy");
		$temp.remove();
		$(this).after($tmp2);
		$($tmp2).html(map-blockaps_localize_strings["map-block_copy_string"]);
		$($tmp2).fadeIn();
		setTimeout(function(){ $($tmp2).fadeOut(); }, 1000);
		setTimeout(function(){ $($tmp2).remove(); }, 1500);
	});

	$('#map-block_settings_enable_usage_tracking').change(function(event) {

		var usage_tracking = $(this);

		if (usage_tracking.is (':checked')){
			var enabled = true;
		} else {
			var enabled = false;
		}
		var email = $("#map-block_admin_email_coupon").val();

		var data = {
			action: 'request_coupon',
			email: email,
			status: enabled
		}
		$.post(ajaxurl, data, function(response){
		});

	});

	var radiusStoreLocator      = $('.map-block-store-locator-default-radius'),
		radiusStoreLocatorKm    = $('#map-block_store_locator_default_radius_km'),
		radiusStoreLocatorMi    = $('#map-block_store_locator_default_radius_mi');

	radiusStoreLocator.on('change', function() {
		radiusStoreLocator.val($(this).val());
	});

	$('#map-block_store_locator_distance').on('change', function() {
		radiusStoreLocator.removeClass('active');

		if ($(this).attr('checked')){
			radiusStoreLocatorMi.addClass('active');
		} else {
			radiusStoreLocatorKm.addClass('active');
		}
	});
	
	// If the store locator radii aren't valid when trying to save, switch to that tab so the error message is visible
	$("input[name='map-block_save_settings']").on("click", function() {
		var input = $("input.map-block_store_locator_radii");
		var value = input.val();
		var regex = new RegExp(input.attr("pattern"));
		
		if(!value.match(regex))
			$("#map-blockaps_tabs").tabs({active: 3});
	});
		
		$("#map-block_store_locator_distance").on("change", function(event) {
			
			var units = $(this).prop("checked") ? "mi" : "km";
			
			$(".map-block-store-locator-default-radius option").each(function(index, el) {
				
				$(el).html(
					$(el).html().match(/\d+/) + units
				);
				
			});
			
		});
	
});

$(window).on("load", function(event) {
	
	if(map-block.settings.engine == "google-maps")
		return;
	
	$(".map-block-open-layers-feature-unavailable:not(.notice)").each(function(index, el) {
		
		var warning = $($(".notice.map-block-open-layers-feature-unavailable")[0]).clone();
		$(warning).show();
		$(el).prepend(warning);
		
		$.merge(
			$(el).find("input, select, textarea, button, .button-primary"),
			$(el).siblings("input, select, textarea, button, .button-primary")
		).each(function(index, el) {
			if($(el).hasClass("button-primary"))
				$(el).attr("href", "javascript: ;");
			else
				$(el).prop("disabled", true);
		});
		
	});
	
	$(".map-block-open-layers-feature-coming-soon:not(.notice)").each(function(index, el) {
		
		var warning = $($(".notice.map-block-open-layers-feature-coming-soon")[0]).clone();
		$(warning).show();
		$(el).prepend(warning);
		
		$.merge(
			$(el).find("input, select, textarea, button, .button-primary"),
			$(el).siblings("input, select, textarea, button, .button-primary")
		).each(function(index, el) {
			if($(el).hasClass("button-primary"))
				$(el).attr("href", "javascript: ;");
			else
				$(el).prop("disabled", true);
		});
		
	});
	
});