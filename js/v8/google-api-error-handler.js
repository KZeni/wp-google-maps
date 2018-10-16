/**
 * @namespace map-block
 * @module GoogleAPIErrorHandler
 * @requires map-block
 */
jQuery(function($) { 

	map-block.GoogleAPIErrorHandler = function() {
		
		var self = this;
		
		// Don't do anything if Google isn't the selected API
		if(map-block.settings.engine != "google-maps")
			return;
		
		// Only allow on the map edit page, or front end if user has administrator role
		if(!(map-block.currentPage == "map-edit" || (map-block.is_admin == 0 && map-block.userCanAdministrator == 1)))
			return;
		
		this.element = $(map-block.html.googleMapsAPIErrorDialog);
		
		if(map-block.is_admin == 1)
			this.element.find(".map-block-front-end-only").remove();
		
		this.errorMessageList = this.element.find("#map-block-google-api-error-list");
		this.templateListItem = this.element.find("li.template").remove();
		
		this.messagesAlreadyDisplayed = {};
		
		if(map-block.settings.developer_mode)
			return;
		
		// Override error function
		var _error = console.error;
		
		console.error = function(message)
		{
			self.onErrorMessage(message);
			
			_error.apply(this, arguments);
		}
	}
	
	map-block.GoogleAPIErrorHandler.prototype.onErrorMessage = function(message)
	{
		var m;
		var regexURL = /http(s)?:\/\/[^\s]+/gm;
		
		if((m = message.match(/You have exceeded your (daily )?request quota for this API/)) || (m = message.match(/This API project is not authorized to use this API/)))
		{
			var urls = message.match(regexURL);
			this.addErrorMessage(m[0], urls);
		}
		else if(m = message.match(/^Google Maps.+error: (.+)\s+(http(s?):\/\/.+)/m))
		{
			this.addErrorMessage(m[1].replace(/([A-Z])/g, " $1"), [m[2]]);
		}
	}
	
	map-block.GoogleAPIErrorHandler.prototype.addErrorMessage = function(message, urls)
	{
		if(this.messagesAlreadyDisplayed[message])
			return;
		
		var li = this.templateListItem.clone();
		$(li).find(".map-block-message").html(message);
		
		var buttonContainer = $(li).find(".map-block-documentation-buttons");
		
		var buttonTemplate = $(li).find(".map-block-documentation-buttons>a");
		buttonTemplate.remove();
		
		if(urls && urls.length)
		{
			for(var i = 0; i < urls.length; i++)
			{
				var url = urls[i];
				var button = buttonTemplate.clone();
				var icon = "fa-external-link";
				var text = map-block.localized_strings.documentation;
				
				button.attr("href", urls[i]);
				
				if(url.match(/google.+documentation/))
				{
					icon = "fa-google";
				}
				else if(url.match(/maps-no-account/))
				{
					icon = "fa-wrench"
					text = map-block.localized_strings.verify_project;
				}
				else if(url.match(/console\.developers\.google/))
				{
					icon = "fa-wrench";
					text = map-block.localized_strings.api_dashboard;
				}
				
				$(button).find("i").addClass(icon);
				$(button).append(text);
			}
			
			buttonContainer.append(button);
		}
		
		$(this.errorMessageList).append(li);
		
		if(!this.dialog)
			this.dialog = $(this.element).remodal();
		
		switch(this.dialog.getState())
		{
			case "open":
			case "opened":
			case "opening":
				break;
				
			default:
				this.dialog.open();
				break;
		}
		
		this.messagesAlreadyDisplayed[message] = true;
	}
	
	map-block.googleAPIErrorHandler = new map-block.GoogleAPIErrorHandler();

});