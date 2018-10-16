/**
 * @namespace map-block
 * @module Event
 * @requires map-block
 */ 
jQuery(function($) {
		
	map-block.Event = function(options)
	{
		if(typeof options == "string")
			this.type = options;
		
		this.bubbles		= true;
		this.cancelable		= true;
		this.phase			= map-block.Event.PHASE_CAPTURE;
		this.target			= null;
		
		this._cancelled = false;
		
		if(typeof options == "object")
			for(var name in options)
				this[name] = options[name];
	}

	map-block.Event.CAPTURING_PHASE		= 0;
	map-block.Event.AT_TARGET				= 1;
	map-block.Event.BUBBLING_PHASE			= 2;

	map-block.Event.prototype.stopPropagation = function()
	{
		this._cancelled = true;
	}
	
});