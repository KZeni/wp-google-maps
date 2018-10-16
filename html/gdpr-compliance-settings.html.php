<div id="map-block-gdpr-compliance">
	
	<div id="map-block-gpdr-general-compliance">
	
		<h2>
			<?php _e('General Complicance', 'map-block'); ?>
		</h2>
		
		<fieldset>
			<label for="map-block_gdpr_require_consent_before_load">
				<?php
				_e('Require consent before loading Maps API', 'map-block');
				?>
				<i class="fa fa-question-circle" 
					title="<?php _e('The GDPR views IP Addresses as Personal Data, which requires consent before being processed. Loading the Google Maps API stores some user information, such as IP Addresses. Map Block endeavours to uphold the spirit of data protection as per the GDPR. Enable this to option to prevent the Maps API from loading, until a user has consented to it.', 'map-block'); ?>"/>
			</label>
			<input name="map-block_gdpr_require_consent_before_load" type="checkbox"/>
		</fieldset>
		
	</div>
	
	<div id="map-block-gdpr-compliance-notice" style="display: none;">
		
		<h2>
			<?php _e('GDPR Consent Notice', 'map-block'); ?>
		</h2>
		
		<fieldset>
			<label for="map-block_gdpr_default_notice">
				<?php
				_e('GDPR Notice', 'map-block');
				?>
				<i class="fa fa-question-circle" 
					title="<?php _e('Users will be asked to accept the notice shown here, in the form of a check box.', 'map-block'); ?>"></i>
			</label>
			
			<div name="map-block_gdpr_default_notice"></div>
		</fieldset>
		
		<fieldset>
			<label for="map-block_gdpr_company_name">
				<?php
				_e('Company Name', 'map-block');
				?>
			</label>
			<input name="map-block_gdpr_company_name"/>
		</fieldset>
		
		
		<fieldset>
			<label for="map-block_gdpr_retention_purpose">
				<?php
				_e('Retention Purpose(s)', 'map-block');
				?>
			</label>
			<div>
				<input name="map-block_gdpr_retention_purpose"/>
				<br/>
				<small>
					<?php
					_e('The GDPR regulates that you need to state why you are processing data.', 'map-block');
					?>
				</small>
			</div>
		</fieldset>
		
		<fieldset>
			<label for="map-block_gdpr_override_notice">
				<?php
				_e('Override GDPR Notice', 'map-block');
				?>
			</label>
			<div>
				<input name="map-block_gdpr_override_notice" type="checkbox"/>
				<br/>
				<span class="notice notice-error" style="padding: 0.5em; display: block;">
					<?php
					_e('By checking this box, you agree to take sole responsibility for GDPR Compliance with regards to this plugin.', 'map-block');
					?>
				</span>
			</div>
		</fieldset>
		
		<fieldset id="map-block_gdpr_override_notice_text">
			<label for="map-block_gdpr_override_notice_text">
				<?php
				_e('Override Text', 'map-block');
				?>
			</label>
			<textarea name="map-block_gdpr_notice_override_text"></textarea>
		</fieldset>
		
		
	</div>
	
	<p>
		<?php
		_e('For more information about map-block and GDPR compliance, please refer to our <a href="https://www.map-blockaps.com/gdpr/">GDPR information page</a> and our <a href="https://www.map-blockaps.com/privacy-policy/">Privacy Policy</a>', 'map-block');
		?>
	</p>
</div>