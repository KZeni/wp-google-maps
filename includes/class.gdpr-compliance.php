<?php

namespace map-block;

class GDPRCompliance
{
	public function __construct()
	{
		add_filter('map-block_global_settings_tabs', array($this, 'onGlobalSettingsTabs'));
		add_filter('map-block_global_settings_tab_content', array($this, 'onGlobalSettingsTabContent'), 10, 1);
		
		add_filter('map-block_plugin_get_default_settings', array($this, 'onPluginGetDefaultSettings'));
		
		add_action('wp_ajax_map-block_gdpr_privacy_policy_notice_dismissed', array($this, 'onPrivacyPolicyNoticeDismissed'));
		
		//add_action('admin_notices', array($this, 'onAdminNotices'));
		//add_action('admin_post_map-block_dismiss_admin_gdpr_warning', array($this, 'onDismissAdminWarning'));
		
		//$this->setDefaultSettings();
	}
	
	public function getDefaultSettings()
	{
		return array(
			'map-block_gdpr_enabled'			=> 1,
			'map-block_gdpr_default_notice'	=> apply_filters('map-block_gdpr_notice',
											__('<p>
	I agree for my personal data to be processed by <span name="map-block_gdpr_company_name"></span>, for the purpose(s) of <span name="map-block_gdpr_retention_purpose"></span>.
</p>

<p>	
	I agree for my personal data, provided via map API calls, to be processed by the API provider, for the purposes of geocoding (converting addresses to coordinates), reverse geocoding and	generating directions.
</p>
<p>
	Some visual components of Map Block use 3rd party libraries which are loaded over the network. At present the libraries are Google Maps, Open Street Map, jQuery DataTables and FontAwesome. When loading resources over a network, the 3rd party server will receive your IP address and User Agent string amongst other details. Please refer to the Privacy Policy of the respective libraries for details on how they use data and the process to exercise your rights under the GDPR regulations.
</p>
<p>
	Map Block uses jQuery DataTables to display sortable, searchable tables, such as that seen in the Advanced Marker Listing and on the Map Edit Page. jQuery DataTables in certain circumstances uses a cookie to save and later recall the "state" of a given table - that is, the search term, sort column and order and current page. This data is held in local storage and retained until this is cleared manually. No libraries used by Map Block transmit this information.
</p>
<p>
	Please <a href="https://developers.google.com/maps/terms">see here</a> and <a href="https://maps.google.com/help/terms_maps.html">here</a> for Google\'s terms. Please also see <a href="https://policies.google.com/privacy?hl=en-GB&amp;gl=uk">Google\'s Privacy Policy</a>. We do not send the API provider any personally identifying information, or information that could uniquely identify your device.
</p>
<p>
	Where this notice is displayed in place of a map, agreeing to this notice will store a cookie recording your agreement so you are not prompted again.
</p>'), 'map-block'),

			'map-block_gdpr_company_name'		=> get_bloginfo('name'),
			'map-block_gdpr_retention_purpose' => 'displaying map tiles, geocoding addresses and calculating and display directions.'
		);
	}
	
	/*public function setDefaultSettings()
	{
		$settings = get_option('map-block_OTHER_SETTINGS');
		
		if(empty($settings))
			$settings = array();
		
		if(isset($settings['map-block_gdpr_notice']))
			return;
		
		$settings = array_merge($settings, $this->getDefaultSettings());
		
		update_option('map-block_OTHER_SETTINGS', $settings);
	}*/
	
	public function onPluginGetDefaultSettings($settings)
	{
		return array_merge($settings, $this->getDefaultSettings());
	}
	
	public function onPrivacyPolicyNoticeDismissed()
	{
		$map-block_other_settings = get_option('map-block_OTHER_SETTINGS');
		$map-block_other_settings['privacy_policy_notice_dismissed'] = true;
		
		update_option('map-block_OTHER_SETTINGS', $map-block_other_settings);
		
		wp_send_json(array(
			'success' => 1
		));
		
		exit;
	}
	
	protected function getSettingsTabContent()
	{
		global $map-block;
		
		$settings = array_merge(
			(array)$this->getDefaultSettings(),
			get_option('map-block_OTHER_SETTINGS')
		);
		
		$document = new DOMDocument();
		$document->loadPHPFile(plugin_dir_path(__DIR__) . 'html/gdpr-compliance-settings.html.php');
		
		$document = apply_filters('map-block_gdpr_settings_tab_content', $document);
		
		$document->populate($settings);
		
		return $document;
	}
	
	public function getNoticeHTML($checkbox=true)
	{
		$map-block_other_settings = array_merge( (array)$this->getDefaultSettings(), get_option('map-block_OTHER_SETTINGS') );
		
		$html = $map-block_other_settings['map-block_gdpr_default_notice'];
		
		if(!empty($map-block_other_settings['map-block_gdpr_override_notice']) && !empty($map-block_other_settings['map-block_gdpr_notice_override_text']))
			$html = $map-block_other_settings['map-block_gdpr_notice_override_text'];
		
		$company_name 			= (empty($map-block_other_settings['map-block_gdpr_company_name']) ? '' : $map-block_other_settings['map-block_gdpr_company_name']);
		$retention_period_days 	= (empty($map-block_other_settings['map-block_gdpr_retention_period_days']) ? '' : $map-block_other_settings['map-block_gdpr_retention_period_days']);
		$retention_purpose		= (empty($map-block_other_settings['map-block_gdpr_retention_purpose']) ? '' : $map-block_other_settings['map-block_gdpr_retention_purpose']);
		
		$html = preg_replace('/{COMPANY_NAME}/i', $company_name, $html);
		$html = preg_replace('/{RETENTION_PERIOD}/i', $retention_period_days, $html);
		$html = preg_replace('/{RETENTION_PURPOSE}/i', $retention_purpose, $html);
		
		if($checkbox)
			$html = '<input type="checkbox" name="map-block_ugm_gdpr_consent" required/> ' . $html;
		
		$html = apply_filters('map-block_gdpr_notice_html', $html);
		
		$document = new DOMDocument();
		@$document->loadHTML( utf8_decode($html) );
		$document->populate($map-block_other_settings);
		
		return $document->saveInnerBody();
	}
	
	public function getPrivacyPolicyNoticeHTML()
	{
		global $map-block;
		
		if(!empty($map-block->settings->privacy_policy_notice_dismissed))
			return '';
		
		return "
			<div id='map-block-gdpr-privacy-policy-notice' class='notice notice-info is-dismissible'>
				<p>" . __('In light of recent EU GDPR regulation, we strongly recommend reviewing the <a target="_blank" href="https://www.map-blockaps.com/privacy-policy">Map Block Privacy Policy</a>', 'map-block') . "</p>
			</div>
			";
	}
	
	public function getConsentPromptHTML()
	{
		return '<div>' . $this->getNoticeHTML(false) . "<p class='map-block-centered'><button class='map-block-api-consent'>" . __('I agree', 'map-block') . "</button></div></p>";
	}
	
	public function onGlobalSettingsTabs($input)
	{
		return $input . "<li><a href=\"#map-block-gdpr-compliance\">".__("GDPR Compliance","map-block")."</a></li>";
	}
	
	public function onGlobalSettingsTabContent($input)
	{
		$document = $this->getSettingsTabContent();
		return $input . $document->saveInnerBody();
	}
	
	/*public function onAdminNotices()
	{
		global $map-block;
		
		$settings = get_option('map-block_OTHER_SETTINGS');
		
		if(!empty($settings['map-block_gdpr_enabled']))
			return;
		
		if(!empty($_COOKIE['map-block-gdpr-user-has-dismissed-admin-warning']))
			return;
		
		echo '
			<div class="notice admin-notice notice-error">
				<p>
					<strong>
						' . __('Map Block - Warning - GDPR Compliance Disabled - Action Required', 'map-block') . '
					</strong>
				</p>
				<p>
					' . __('GDPR compliance has been disabled, read more about the implications of this here: ', 'map-block') . '
					<a href="https://www.eugdpr.org/" target="_blank">' . __('EU GDPR', 'map-block') . '</a>
				</p>
				<p>
					' . __('Additionally please take a look at Map Block <a href="https://www.map-blockaps.com/privacy-policy">Privacy Policy</a>') . '
				</p>
				<p>
					' . __('It is highly recommended that you enable GDPR compliance to ensure your user data is regulated.') . '
				</p>
				
				<form action="' . admin_url('admin-post.php') . '" method="POST">
					<input type="hidden" name="action" value="map-block_dismiss_admin_gdpr_warning"/>
					<input type="hidden" name="redirect" value="' . $_SERVER['REQUEST_URI'] . '"/>
				
					<p>
						<a href="' . admin_url('admin.php?page=map-block-menu-settings') . '" class="button button-secondary">' . __('Privacy Settings', 'map-block') . '</a>
					
						<button type="submit" class="button button-primary" style="background-color: #DC3232 !important; border: none !important; box-shadow: 0 1px 0 #DA2825; text-shadow: 0px -1px 1px #DA2825">' . __('Dismiss & Accept Responsibility', 'map-block') . '</button>
					</p>
				</form>
			</div>
		';
	}
	
	public function onDismissAdminWarning()
	{
		setcookie('map-block-gdpr-user-has-dismissed-admin-warning', 'true', 2147483647);
		wp_redirect($_POST['redirect']);
		exit;
	}*/
	
	public function onPOST()
	{
		$document = $this->getSettingsTabContent();
		$document->populate($_POST);
		
		$map-block_other_settings = get_option('map-block_OTHER_SETTINGS');
		if(!$map-block_other_settings)
			$map-block_other_settings = array();
		
		foreach($document->querySelectorAll('input, select, textarea') as $input)
		{
			$name = $input->getAttribute('name');
			
			if(!$name)
				continue;
			
			switch($input->getAttribute('type'))
			{
				case 'checkbox':
					if($input->getValue())
					{
						$map-block_other_settings[$name] = 1;
					}
					else
					{
						unset($map-block_other_settings[$name]);
					}
					break;
				
				default:
					$map-block_other_settings[$name] = stripslashes( $input->getValue() );
					break;
			}
		}
		
		update_option('map-block_OTHER_SETTINGS', $map-block_other_settings);
	}
}

$map-blockGDPRCompliance = new GDPRCompliance();
