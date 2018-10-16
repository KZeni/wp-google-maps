<tr data-required-maps-engine='google-maps'>
	<td>
		<label><?php _e('Use Google Maps API:', 'map-block'); ?></label>
	</td>
	<td>
		<select name="map-block_api_version">
			<option value="3.exp">
				<?php
				_e('3.exp (Experimental)', 'map-block');
				?>
			</option>
			<option value="3.31">
				<?php
				_e('3.31', 'map-block');
				?>
			</option>
			<option value="3.30">
				<?php
				_e('3.30 (Retired)', 'map-block');
				?>
			</option>
		</select>
	</td>
</tr>
<tr data-required-maps-engine='google-maps'>
	<td>
		<label><?php _e('Load Maps Engine API:', 'map-block'); ?></label>
	</td>
	<td>
		<select name="map-block_load_engine_api_condition">
			<option value="where-required">
				<?php
				_e('Where required', 'map-block');
				?>
			</option>
			<option value="always">
				<?php
				_e('Always', 'map-block');
				?>
			</option>
			<option value="only-front-end">
				<?php
				_e('Only Front End', 'map-block');
				?>
			</option>
			<option value="only-back-end">
				<?php
				_e('Only Back End', 'map-block');
				?>
			</option>
			<option value="never">
				<?php
				_e('Never', 'map-block');
				?>
			</option>
		</select>
	</td>
</tr>
<tr>
	<td>
		<label><?php _e('Always include engine API on pages:'); ?></label>
	</td>
	<td>
		<input name="map-block_always_include_engine_api_on_pages" placeholder="<?php _e('Page IDs'); ?>"/>
	</td>
</tr>
<tr>
	<td>
		<label><?php _e('Always exclude engine API on pages:'); ?></label>
	</td>
	<td>
		<input name="map-block_always_exclude_engine_api_on_pages" placeholder="<?php _e('Page IDs'); ?>"/>
	</td>
</tr>
<tr>
	<td>
		<label><?php _e('Prevent other plugins and theme loading API:', 'map-block'); ?></label>
	</td>
	<td>
		<input name="map-block_prevent_other_plugins_and_theme_loading_api" type="checkbox"/>
	</td>
</tr>