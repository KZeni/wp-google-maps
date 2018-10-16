/**
 * @namespace map-block
 * @module ModernStoreLocator
 * @requires map-block
 */
jQuery(function($) {
	
	/**
	 * The new modern look store locator. It takes the elements
	 * from the default look and moves them into the map, wrapping
	 * in a new element so we can apply new styles.
	 * @return Object
	 */
	map-block.ModernStoreLocator = function(map_id)
	{
		var self = this;
		var original;
		
		map-block.assertInstanceOf(this, "ModernStoreLocator");
		
		if(map-block.isProVersion())
			original = $(".map-block_sl_search_button[mid='" + map_id + "']").closest(".map-block_sl_main_div");
		else
			original = $(".map-block_sl_search_button").closest(".map-block_sl_main_div");
		
		if(!original.length)
			return;
		
		// Build / re-arrange elements
		this.element = $("<div class='map-block-modern-store-locator'><div class='map-block-inner map-block-modern-hover-opaque'/></div>")[0];
		
		var inner = $(this.element).find(".map-block-inner");
		
		var titleSearch = $(original).find("[id='nameInput_" + map_id + "']");
		if(titleSearch.length)
		{
			var placeholder = map-blockaps_localize[map_id].other_settings.store_locator_name_string;
			if(placeholder && placeholder.length)
				titleSearch.attr("placeholder", placeholder);
			inner.append(titleSearch);
		}
		
		var addressInput;
		if(map-block.isProVersion())
			addressInput = $(original).find(".addressInput");
		else
			addressInput = $(original).find("#addressInput");
		
		if(map-blockaps_localize[map_id].other_settings.store_locator_query_string && map-blockaps_localize[map_id].other_settings.store_locator_query_string.length)
			addressInput.attr("placeholder", map-blockaps_localize[map_id].other_settings.store_locator_query_string);
		
		inner.append(addressInput);
		
		inner.append($(original).find("select.map-block_sl_radius_select"));
		// inner.append($(original).find(".map-block_filter_select_" + map_id));
		
		// Buttons
		this.searchButton = $(original).find( ".map-block_sl_search_button" );
		inner.append(this.searchButton);
		
		this.resetButton = $(original).find( ".map-block_sl_reset_button_div" );
		inner.append(this.resetButton);
		
		this.resetButton.on("click", function(event) {
			resetLocations(map_id);
		});
		
		this.resetButton.hide();
		
		if(map-block.isProVersion())
		{
			this.searchButton.on("click", function(event) {
				if($("addressInput_" + map_id).val() == 0)
					return;
				
				self.searchButton.hide();
				self.resetButton.show();
			});
			this.resetButton.on("click", function(event) {
				self.resetButton.hide();
				self.searchButton.show();
			});
		}
		
		// Distance type
		inner.append($("#map-block_distance_type_" + map_id));
		
		// Categories
		var container = $(original).find(".map-block_cat_checkbox_holder");
		var ul = $(container).children("ul");
		var items = $(container).find("li");
		var numCategories = 0;
		
		//$(items).find("ul").remove();
		//$(ul).append(items);
		
		var icons = [];
		
		items.each(function(index, el) {
			var id = $(el).attr("class").match(/\d+/);
			
			for(var category_id in map-block_category_data) {
				
				if(id == category_id) {
					var src = map-block_category_data[category_id].image;
					var icon = $('<div class="map-block-chip-icon"/>');
					
					icon.css({
						"background-image": "url('" + src + "')",
						"width": $("#map-block_cat_checkbox_" + category_id + " + label").height() + "px"
					});
					icons.push(icon);
					
                    if(src != null && src != ""){
					   //$(el).find("label").prepend(icon);
                       $("#map-block_cat_checkbox_" + category_id + " + label").prepend(icon);
                    }
					
					numCategories++;
					
					break;
				}
				
			}
		});

        $(this.element).append(container);

		
		if(numCategories) {
			this.optionsButton = $('<span class="map-block_store_locator_options_button"><i class="fas fa-list"></i></span>');
			$(this.searchButton).before(this.optionsButton);
		}
		
		setInterval(function() {
			
			icons.forEach(function(icon) {
				var height = $(icon).height();
				$(icon).css({"width": height + "px"});
				$(icon).closest("label").css({"padding-left": height + 8 + "px"});
			});
			
			$(container).css("width", $(self.element).find(".map-block-inner").outerWidth() + "px");
			
		}, 1000);
		
		$(this.element).find(".map-block_store_locator_options_button").on("click", function(event) {
			
			if(container.hasClass("map-block-open"))
				container.removeClass("map-block-open");
			else
				container.addClass("map-block-open");
			
		});
		
		// Remove original element
		$(original).remove();
		
		// Event listeners
		$(this.element).find("input, select").on("focus", function() {
			$(inner).addClass("active");
		});
		
		$(this.element).find("input, select").on("blur", function() {
			$(inner).removeClass("active");
		});
	}
	
	map-block.ModernStoreLocator.createInstance = function(map_id)
	{
		if(map-block.settings.engine == "google-maps")
			return new map-block.GoogleModernStoreLocator(map_id);
		else
			return new map-block.OLModernStoreLocator(map_id);
	}
	
});