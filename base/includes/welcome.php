<?php global $map-block_global_array; ?>
<div class="wrap about-wrap">
<p>&nbsp;</p>
<h1><?php echo sprintf( __( "Welcome to Map Block version %s","map-block"), "7.0" ); ?></h1>

<div class="about-text"><?php _e("Build amazing maps through a simple interface and powerful functionality along with world class support.","map-block"); ?></div>

<div class="map-block-badge" style=''></div>

<a class="button-primary" style='padding:5px; padding-right:15px; padding-left:15px; height:inherit;' href="admin.php?page=map-block-menu&override=1"><?php echo __("Skip intro and create a map","map-block"); ?></a>
<p>&nbsp;</p>


<h2 class="nav-tab-wrapper wp-clearfix">
	<a href="admin.php?page=map-block-menu&action=welcome_page" class="nav-tab  nav-tab-active"><?php _e("Welcome","map-block"); ?></a>
	<a href="admin.php?page=map-block-menu&action=credits" class="nav-tab"><?php _e("Credits","map-block"); ?></a>

</h2>

    <div class="feature-section two-col">
        <div class="col">
        <h4><?php _e("Unlimited Markers","map-block"); ?></h4>
        <p><?php _e("Create as many markers as you like","map-block"); ?></p>
         <img src='<?php echo map-blockAPS_DIR; ?>base/assets/feature1.jpg' style="border:1px solid #ccc;" />              
        </div>
        <div class="col">
        <h4><?php _e("Store Locator","map-block"); ?></h4>
        <p><?php _e("Let users search for products, branches and stores near them","map-block"); ?></p>
         <img src='<?php echo map-blockAPS_DIR; ?>base/assets/feature2.jpg?1=2' style="border:1px solid #ccc;" />
        </div>
    </div>
    <div class="feature-section two-col">
        <div class="col">
        <h4><?php _e("Themes","map-block"); ?></h4>
        <p><?php _e("Select from various <a href='http://map-blockaps.com/map-themes/' target='_BLANK'>map themes</a>, or make your own.","map-block"); ?></p>
         <img src='<?php echo map-blockAPS_DIR; ?>base/assets/feature3.jpg' style="border:1px solid #ccc;" />
        </div>
        <div class="col">
        <h4><?php _e("Polylines","map-block"); ?>, <?php _e("Polygons","map-block"); ?>, <?php _e("Circles","map-block"); ?>, <?php _e("and Squares","map-block"); ?></h4>
        <p><?php _e("Add custom shapes such as polygons, polylines, circles and sqaures!","map-block"); ?></p>
         <img src='<?php echo map-blockAPS_DIR; ?>base/assets/feature4.jpg' style="border:1px solid #ccc;" />              
        </div>
    </div>


                <hr />
                
                <div class="feature-section normal clear" >
                    <div class="changelog ">
                    
                                <?php if ($map-block_global_array['code'] != "100") { 
								
								// NB: GDPR
								?>
                    
                                <!--<h3 style='margin-top:20px;'><?php _e("How did you find out about us?","map-block"); ?></h3>

                                <div class="feature-section normal">
                                    <form action='' method='POST' name='map-blockaps_feedback'>                                            
                                    <p><ul class="map-block_welcome_poll" style="list-style: none outside none;">
                                        <li style="list-style: none outside none;">
                                            <input type="radio" id="map-blockaps_findus_repository" value="repository" name="map-blockaps_findus">
                                            <label for="map-blockaps_search_term"><?php _e("WordPress.org plugin repository","map-block"); ?></label>
                                            <br /><input type="text" id="map-blockaps_search_term" class="regular-text" style='margin-top:5px; margin-left:40px;'  name="map-blockaps_search_term" placeholder="<?php _e("What search term did you use?","map-block"); ?>">
                                        </li>
                                        <li style="list-style: none outside none;">
                                            <input type="radio" id="map-blockaps_findus_searchengine" value="search_engine" name="map-blockaps_findus">
                                            <label for="map-blockaps_findus_searchengine"><?php _e("Google or other search engine","map-block"); ?></label>
                                        </li>
                                        <li style="list-style: none outside none;">
                                            <input type="radio" id="map-blockaps_findus_friend" value="friend" name="map-blockaps_findus">
                                            <label for="map-blockaps_findus_friend"><?php _e("Friend recommendation","map-block"); ?></label>
                                        </li>
                                        <li style="list-style: none outside none;">
                                            <input type="radio" id="map-blockaps_findus_other" value="other" name="map-blockaps_findus">
                                            <label for="map-blockaps_findus_other"><?php _e("Other","map-block"); ?></label>
                                            <br /><input type="text" id="map-blockaps_findus_other_url" class="regular-text"  style='margin-top:5px; margin-left:40px;'  name="map-blockaps_findus_other_url" placeholder="<?php _e("Please explain","map-block"); ?>">

                                        </li>
                                        
                                        
                                    </ul></p>
                                    <input class='button-primary' type='submit' name='map-block_save_feedback' value='<?php _e("Submit and create a map","map-block"); ?>'> 
                                    
                                </form>-->
                                </div>
                                <?php } else { ?>
                                <div class="map-block_notice_message">
                                    <ul>
                                        <li>
                                            <?php echo $map-block_global_array['message']; ?>
                                        </li>
                                    </ul>
                                </div>
                                <?php } ?>

                        <div class="feature-section three-col">
                            <div class='col'>
                                <h4><?php _e("New to Map Block?","map-block"); ?></h4>
                                <p><?php _e("You may want to","map-block"); ?> <a href='http://map-blockaps.com/documentation/' target='_blank' title='Documentation'><?php _e("review our documentation","map-block"); ?></a> <?php _e("before you get started. If you're a tech-savvy individual, you may skip this step.","map-block"); ?></p>
                            </div>
                            <div class='col'>
                                <h4><?php _e("Help me!","map-block"); ?></h4>
                                <p><?php _e("Visit our","map-block"); ?> <a title='Support Desk' target='_blank' href='http://www.map-blockaps.com/support/'><?php _e("Support Desk","map-block"); ?></a> <?php _e("for quick and friendly help. We'll answer your request within 24hours.","map-block"); ?></p>
                            </div>
                            <div class='col'>
                                <h4><?php _e("Feedback","map-block"); ?></h4>
                                <p><?php _e("We need you to help us make this plugin better.","map-block"); ?> <a href='http://www.map-blockaps.com/contact-us/' title='Feedback' target='_BLANK'><?php _e("Send us your feedback","map-block"); ?></a> <?php _e("and we'll act on it as soon as humanly possible.","map-block"); ?></p>
                            </div>
                        </div>
                        
                <a class="button-primary" style='padding:5px; padding-right:15px; padding-left:15px; height:inherit;' href="admin.php?page=map-block-menu&override=1"><?php echo __("OK! Let's start","map-block"); ?></a>

            </div>
        </div>

</div>