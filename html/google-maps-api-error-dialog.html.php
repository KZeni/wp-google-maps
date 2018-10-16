<div id="map-block-google-api-error-dialog" data-remodal-id="map-block-google-api-error-dialog">

	<h2><?php _e('Maps API Error', 'map-block'); ?></h2>
	
	<div>
	
		<p>
			<?php
			_e('One or more error(s) have occured attempting to initialize the Maps API:', 'map-block');
			?>
		</p>
	
		<ul id="map-block-google-api-error-list">
			<li class="template notice notice-error">
				<span class="map-block-message"></span>
				<span class="map-block-documentation-buttons">
					<a target="_blank">
						<i class="fa" aria-hidden="true"></i>
					</a>
				</span>
			</li>
		</ul>
	
	</div>
	
	<p>
		<?php
		_e('See our documentation for solutions to common Google API issues:', 'map-block');
		?>
	</p>
	
	<ul>
		<li>
			<a href="https://www.map-blockaps.com/documentation/troubleshooting/this-page-cant-load-google-maps-correctly/">
				<?php
				_e('“This page can’t load Google Maps correctly”', 'map-block');
				?>
			</a>
		</li>
		<li>
			<a href="https://www.map-blockaps.com/documentation/troubleshooting/this-api-project-is-not-authorized-to-use-this-api/">
				<?php
				_e('“This API project is not authorized to use this API”', 'map-block');
				?>
			</a>
		</li>
		<li>
			<a href="https://www.map-blockaps.com/documentation/troubleshooting/api-not-activated-map-error/">
				<?php
				_e('“API Not Activated Map Error”', 'map-block');
				?>
			</a>
		</li>
	</ul>
	
	<p>
		<?php
		_e('Please see the <a href="https://www.map-blockaps.com/documentation/creating-a-google-maps-api-key/">Map Block Documentation</a> for a step by step guide on setting up your Google Maps API key.', 'map-block');
		?>
	</p>
	
	<p>
		<?php
		_e('Please open your Developer Tools (F12 for most browsers) and see your JavaScript console for the full error message.', 'map-block');
		?>
	</p>
	
	<p class="map-block-front-end-only">
		<i class="fa fa-eye" aria-hidden="true"></i>
		<?php
		_e('This dialog is only visible to administrators', 'map-block');
		?>
	</p>
	
	<button data-remodal-action="confirm" class="remodal-confirm">
		<?php
		_e('Dismiss', 'map-block');
		?>
	</button>

</div>