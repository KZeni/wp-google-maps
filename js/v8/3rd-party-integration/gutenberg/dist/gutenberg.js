"use strict";

/**
 * @namespace map-block.Integration
 * @module Gutenberg
 * @requires map-block.Integration
 * @requires wp-i18n
 * @requires wp-blocks
 * @requires wp-editor
 * @requires wp-components
 */

/**
 * Internal block libraries
 */
jQuery(function ($) {

	if (!wp || !wp.i18n || !wp.blocks) return;

	var __ = wp.i18n.__;
	var registerBlockType = wp.blocks.registerBlockType;
	var _wp$editor = wp.editor,
	    InspectorControls = _wp$editor.InspectorControls,
	    BlockControls = _wp$editor.BlockControls;
	var _wp$components = wp.components,
	    Dashicon = _wp$components.Dashicon,
	    Toolbar = _wp$components.Toolbar,
	    Button = _wp$components.Button,
	    Tooltip = _wp$components.Tooltip,
	    PanelBody = _wp$components.PanelBody,
	    TextareaControl = _wp$components.TextareaControl,
	    TextControl = _wp$components.TextControl,
	    RichText = _wp$components.RichText;


	map-block.Integration.Gutenberg = function () {
		registerBlockType('gutenberg-map-block/block', this.getBlockDefinition());
	};

	map-block.Integration.Gutenberg.prototype.getBlockTitle = function () {
		return __("Map Block");
	};

	map-block.Integration.Gutenberg.prototype.getBlockInspectorControls = function (props) {
		return React.createElement(
			InspectorControls,
			{ key: "inspector" },
			React.createElement(PanelBody, { title: __('Map Settings') })
		);
	};

	map-block.Integration.Gutenberg.prototype.getBlockAttributes = function () {
		return {};
	};

	map-block.Integration.Gutenberg.prototype.getBlockDefinition = function (props) {
		var _this = this;

		return {

			title: __("Map Block"),
			description: __('The easiest to use Google Maps plugin! Create custom Google Maps with high quality markers containing locations, descriptions, images and links. Add your customized map to your WordPress posts and/or pages quickly and easily with the supplied shortcode. No fuss.'),
			category: 'common',
			icon: 'location-alt',
			keywords: [__('Map'), __('Maps'), __('Google')],
			attributes: this.getBlockAttributes(),

			edit: function edit(props) {
				return [!!props.isSelected && _this.getBlockInspectorControls(props), React.createElement(
					"div",
					{ className: props.className + " map-block-gutenberg-block" },
					React.createElement(Dashicon, { icon: "location-alt" }),
					React.createElement(
						"span",
						{ "class": "map-block-gutenberg-block-title" },
						__("Map Block")
					)
				)];
			},
			// Defining the front-end interface
			save: function save(props) {
				// Rendering in PHP
				return null;
			}

		};
	};

	map-block.Integration.Gutenberg.getConstructor = function () {
		return map-block.Integration.Gutenberg;
	};

	map-block.Integration.Gutenberg.createInstance = function () {
		var constructor = map-block.Integration.Gutenberg.getConstructor();
		return new constructor();
	};

	// Allow the Pro module to extend and create the module, only create here when Pro isn't loaded
	if (!map-block.isProVersion()) map-block.integrationModules.gutenberg = map-block.Integration.Gutenberg.createInstance();
});