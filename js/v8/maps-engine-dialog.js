/**
 * @namespace map-block
 * @module MapsEngineDialog
 * @requires map-block
 */
jQuery(function($) {
	
	map-block.MapsEngineDialog = function(element)
	{
		var self = this;
		
		this.element = element;
		
		if(window.map-blockUnbindSaveReminder)
			window.map-blockUnbindSaveReminder();
		
		$(element).show();
		$(element).remodal().open();
		
		$(element).find("input:radio").on("change", function(event) {
			
			$("#map-block-confirm-engine").prop("disabled", false);
			
		});
		
		$("#map-block-confirm-engine").on("click", function(event) {
			
			self.onButtonClicked(event);
			
		});
	}
	
	map-block.MapsEngineDialog.prototype.onButtonClicked = function(event)
	{
		$(event.target).prop("disabled", true);
		
		$.ajax(map-block.ajaxurl, {
			method: "POST",
			data: {
				action: "map-block_maps_engine_dialog_set_engine",
				engine: $("[name='map-block_maps_engine']:checked").val()
			},
			success: function(response, status, xhr) {
				window.location.reload();
			}
		});
	}
	
	$(window).on("load", function(event) {
		
		var element = $("#map-block-maps-engine-dialog");
		
		if(!element.length)
			return;
		
		if(map-block.settings.map-block_maps_engine_dialog_done)
			return;
		
		map-block.mapsEngineDialog = new map-block.MapsEngineDialog(element);
		
	});
	
});