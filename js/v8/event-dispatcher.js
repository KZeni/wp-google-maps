/**
 * @namespace map-block
 * @module EventDispatcher
 * @requires map-block
 */
jQuery(function($) {
	
	map-block.EventDispatcher = function()
	{
		map-block.assertInstanceOf(this, "EventDispatcher");
		
		this._listenersByType = [];
	}

	map-block.EventDispatcher.prototype.addEventListener = function(type, listener, thisObject, useCapture)
	{
		var arr;
		
		var types = type.split(/\s+/);
		if(types.length > 1)
		{
			for(var i = 0; i < types.length; i++)
				this.addEventListener(types[i], listener, thisObject, useCapture);
			
			return;
		}
		
		if(!(listener instanceof Function))
			throw new Error("Listener must be a function");

		if(!(arr = this._listenersByType[type]))
			arr = this._listenersByType[type] = [];
			
		var obj = {
			listener: listener,
			thisObject: (thisObject ? thisObject : this),
			useCapture: (useCapture ? true : false)
			};
			
		arr.push(obj);
	}

	map-block.EventDispatcher.prototype.on = map-block.EventDispatcher.prototype.addEventListener;

	map-block.EventDispatcher.prototype.removeEventListener = function(type, listener, thisObject, useCapture)
	{
		var arr, index, obj;

		if(!(arr = this._listenersByType[type]))
			return;
			
		if(!thisObject)
			thisObject = this;
			
		useCapture = (useCapture ? true : false);
		
		for(var i = 0; i < arr.length; i++)
		{
			obj = arr[i];
		
			if(obj.listener == listener && obj.thisObject == thisObject && obj.useCapture == useCapture)
			{
				arr.splice(i, 1);
				return;
			}
		}
	}

	map-block.EventDispatcher.prototype.off = map-block.EventDispatcher.prototype.removeEventListener;

	map-block.EventDispatcher.prototype.hasEventListener = function(type)
	{
		return (_listenersByType[type] ? true : false);
	}

	map-block.EventDispatcher.prototype.dispatchEvent = function(event)
	{
		if(!(event instanceof map-block.Event))
		{
			if(typeof event == "string")
				event = new map-block.Event(event);
			else
			{
				var src = event;
				event = new map-block.Event();
				for(var name in src)
					event[name] = src[name];
			}
		}

		event.target = this;
			
		var path = [];
		for(var obj = this.parent; obj != null; obj = obj.parent)
			path.unshift(obj);
		
		event.phase = map-block.Event.CAPTURING_PHASE;
		for(var i = 0; i < path.length && !event._cancelled; i++)
			path[i]._triggerListeners(event);
			
		if(event._cancelled)
			return;
			
		event.phase = map-block.Event.AT_TARGET;
		this._triggerListeners(event);
			
		event.phase = map-block.Event.BUBBLING_PHASE;
		for(i = path.length - 1; i >= 0 && !event._cancelled; i--)
			path[i]._triggerListeners(event);
		
		if(this.element)
		{
			var customEvent = {};
			
			for(var key in event)
			{
				var value = event[key];
				
				if(key == "type")
					value += ".map-block";
				
				customEvent[key] = value;
			}
			
			$(this.element).trigger(customEvent);
		}
	}

	map-block.EventDispatcher.prototype.trigger = map-block.EventDispatcher.prototype.dispatchEvent;

	map-block.EventDispatcher.prototype._triggerListeners = function(event)
	{
		var arr, obj;
		
		if(!(arr = this._listenersByType[event.type]))
			return;
			
		for(var i = 0; i < arr.length; i++)
		{
			obj = arr[i];
			
			if(event.phase == map-block.Event.CAPTURING_PHASE && !obj.useCapture)
				continue;
				
			obj.listener.call(arr[i].thisObject, event);
		}
	}

	map-block.events = new map-block.EventDispatcher();

});