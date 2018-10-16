/**
 * @namespace map-block
 * @module GoogleVertexContextMenu
 * @requires map-block_api_call
 */
jQuery(function($) {
	
	if(map-block.settings.engine != "google-maps")
		return;
	
	if(map-block.googleAPIStatus && map-block.googleAPIStatus.code == "USER_CONSENT_NOT_GIVEN")
		return;
	
	map-block.GoogleVertexContextMenu = function(mapEditPage)
	{
		var self = this;
		
		this.mapEditPage = mapEditPage;
		
		this.element = document.createElement("div");
		this.element.className = "map-block-vertex-context-menu";
		this.element.innerHTML = "Delete";
		
		google.maps.event.addDomListener(this.element, "click", function(event) {
			self.removeVertex();
			event.preventDefault();
			event.stopPropagation();
			return false;
		});
	}
	
	map-block.GoogleVertexContextMenu.prototype = new google.maps.OverlayView();
	
	map-block.GoogleVertexContextMenu.prototype.onAdd = function()
	{
		var self = this;
		var map = this.getMap();
		
		this.getPanes().floatPane.appendChild(this.element);
		this.divListener = google.maps.event.addDomListener(map.getDiv(), "mousedown", function(e) {
			if(e.target != self.element)
				self.close();
		}, true);
	}
	
	map-block.GoogleVertexContextMenu.prototype.onRemove = function()
	{
		google.maps.event.removeListener(this.divListener);
		this.element.parentNode.removeChild(this.element);
		
		this.set("position");
		this.set("path");
		this.set("vertex");
	}
	
	map-block.GoogleVertexContextMenu.prototype.open = function(map, path, vertex)
	{
		this.set('position', path.getAt(vertex));
		this.set('path', path);
		this.set('vertex', vertex);
		this.setMap(map);
		this.draw();
	}
	
	map-block.GoogleVertexContextMenu.prototype.close = function()
	{
		this.setMap(null);
	}
	
	map-block.GoogleVertexContextMenu.prototype.draw = function()
	{
		var position = this.get('position');
		var projection = this.getProjection();

		if (!position || !projection)
		  return;

		var point = projection.fromLatLngToDivPixel(position);
		this.element.style.top = point.y + 'px';
		this.element.style.left = point.x + 'px';
	}
	
	map-block.GoogleVertexContextMenu.prototype.removeVertex = function()
	{
		var path = this.get('path');
		var vertex = this.get('vertex');

		if (!path || vertex == undefined) {
		  this.close();
		  return;
		}

		path.removeAt(vertex);
		this.close();
	}
	
});