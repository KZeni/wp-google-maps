<?php

namespace map-block;

class MapsEngineDialog
{
	public static function post()
	{
		$settings = get_option('map-block_OTHER_SETTINGS');
		
		$settings['map-block_maps_engine'] = $_POST['engine'];
		$settings['map-block_maps_engine_dialog_done'] = true;
		
		update_option('map-block_OTHER_SETTINGS', $settings);
		
		wp_send_json(array('success' => 1));
		exit;
	}
	
	public function html()
	{
		?>
		<div id="map-block-maps-engine-dialog" style="display: none;">
			<h1>
				<?php
				_e('Choose a maps engine', 'map-block');
				?>
			</h1>
			
			<div class="map-block-inner">
				<div>
					<input type="radio" 
						name="map-block_maps_engine"
						id="map-block_maps_engine_open-layers"
						value="open-layers"
						/>
					<label for="map-block_maps_engine_open-layers">
						<div>
							<!--<h3>
								<?php
								_e('OpenLayers', 'map-block');
								?>
							</h3>-->
							
							<img class="map-block-engine-logo" src="<?php echo plugin_dir_url(__DIR__) . 'images/OpenLayers_logo.svg.png'?>"/>
							
							<ul>
								<li>
									<?php _e('No API keys required', 'map-block'); ?>
								</li>
							</ul>
							
							<ul>
								<li>
									<?php _e('Limited functionality', 'map-block'); ?>
								</li>
							</ul>
						</div>
						
						<!--<p class="map-block-centered">
							<button class="button button-primary" data-maps-engine="open-layers">
								<?php
								_e('Use OpenLayers', 'map-block');
								?>
								
							</button>
						</p>-->
						
						<p class="map-block-mock-radio map-block-centered">
							<span class="map-block-mock-radio-button"></span>
							<img class="map-block-mock-radio-label" 
								src="<?php echo plugin_dir_url(__DIR__); ?>images/openlayers_logo.png"
								/>
						</p>
					</label>
				</div>
				
				<div>
					<input type="radio" 
						name="map-block_maps_engine"
						id="map-block_maps_engine_google-maps"
						value="google-maps"
						/>
					<label for="map-block_maps_engine_google-maps">
						<div>
							<!--<h3>
								<?php
								_e('Google Maps', 'map-block');
								?>
							</h3>-->
							
							<img class="map-block-engine-logo" src="<?php echo plugin_dir_url(__DIR__) . 'images/icons8-google-maps-500.png'?>"/>
							
							<!--<ul class="map-block-pros">
								<li>
									<?php _e('Full functionality', 'map-block'); ?>
								</li>
							</ul>-->
							
							<ul>
								<li>
									<?php _e('API Key required', 'map-block'); ?>
								</li>
							</ul>
						</div>
					
						<!--<p class="map-block-centered">
							<button class="button button-primary" data-maps-engine="google-maps">
								<?php
								_e('Use Google Maps', 'map-block');
								?>
							</button>
						</p>-->
						
						<p class="map-block-mock-radio map-block-centered">
							<span class="map-block-mock-radio-button"></span>
							<img class="map-block-mock-radio-label" 
								src="<?php echo plugin_dir_url(__DIR__); ?>images/Google_maps_logo.png"
								/>
						</p>
					</label>
				</div>
			</div>
			
			<p class="map-block-centered">
				<button class="button button-primary" id="map-block-confirm-engine" disabled>
					<?php
					_e('Select Engine', 'map-block');
					?>
				</button>
			</p>
			
			<!--<footer>
				<img src="<?php echo plugin_dir_url(__DIR__); ?>images/map-block-logo-1-B-transparent.png" 
					alt="<?php _e('Map Block', 'map-block'); ?>"
					/>
				<img src="<?php echo plugin_dir_url(__DIR__); ?>images/codecabin.png"
					alt="by CODECABIN_"
					/>
			</footer>-->
		</div>
		<?php
	}
}

add_action('wp_ajax_map-block_maps_engine_dialog_set_engine', array('map-block\\MapsEngineDialog', 'post'));