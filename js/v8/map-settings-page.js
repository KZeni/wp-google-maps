/**
 * @namespace map-block
 * @module MapSettingsPage
 * @requires map-block
 */
jQuery(function($) {
	
	map-block.MapSettingsPage = function()
	{
		var self = this;
		
		this.updateEngineSpecificControls();
		this.updateGDPRControls();
		
		$("select[name='map-block_maps_engine']").on("change", function(event) {
			self.updateEngineSpecificControls();
		});
		
		$("input[name='map-block_gdpr_require_consent_before_load'], input[name='map-block_gdpr_require_consent_before_vgm_submit'], input[name='map-block_gdpr_override_notice']").on("change", function(event) {
			self.updateGDPRControls();
		});
	}
	
	map-block.MapSettingsPage.prototype.updateEngineSpecificControls = function()
	{
		var engine = $("select[name='map-block_maps_engine']").val();
		
		$("[data-required-maps-engine][data-required-maps-engine!='" + engine + "']").hide();
		$("[data-required-maps-engine='" + engine + "']").show();
	}
	
	map-block.MapSettingsPage.prototype.updateGDPRControls = function()
	{
		var showNoticeControls = $("input[name='map-block_gdpr_require_consent_before_load']").prop("checked");
		
		var vgmCheckbox = $("input[name='map-block_gdpr_require_consent_before_vgm_submit']");
		
		if(vgmCheckbox.length)
			showNoticeControls = showNoticeControls || vgmCheckbox.prop("checked");
		
		var showOverrideTextarea = showNoticeControls && $("input[name='map-block_gdpr_override_notice']").prop("checked");
		
		if(showNoticeControls)
		{
			$("#map-block-gdpr-compliance-notice").show("slow");
		}
		else
		{
			$("#map-block-gdpr-compliance-notice").hide("slow");
		}
		
		if(showOverrideTextarea)
		{
			$("#map-block_gdpr_override_notice_text").show("slow");
		}
		else
		{
			$("#map-block_gdpr_override_notice_text").hide("slow");
		}
	}
	
	jQuery(function($) {
		
		if(!window.location.href.match(/map-block-menu-settings/))
			return;
		
		map-block.mapSettingsPage = new map-block.MapSettingsPage();
		
	});
	
});