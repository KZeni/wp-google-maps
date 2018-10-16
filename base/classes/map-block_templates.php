<?php

class map-blockAPS_templates {


    /**
     * Includes Map Block V6 Welome Page
     *
     * @return void
     */
    function welcome_page_v6() {
        include(dirname(dirname(__FILE__))."/includes/welcome.php");
    }

    /**
     * Includes credits page
     *
     * @return void
     */
    function welcome_page_credits() {
        include(dirname(dirname(__FILE__))."/includes/credits.php");
    }

    /**
     * Outputs Map Block V5 Welcome Page
     *
     * @return void
     */
    function welcome_page() {
        global $map-block_global_array;
?>    


            <div class="wrap about-wrap">

                <!-- <img src='<?php echo map-blockAPS_DIR; ?>base/assets/map-block-logo.png' style="float:right; width:250px;" /> -->
                <h1><?php _e("Welcome to","map-block"); ?> <strong>Map Block</strong> <small>v6</small></h1>

                <div class="about-text"><?php _e("Amazing maps. Simple interface. Powerful functionality. World Class Support.","map-block"); ?></div>

                <h3><?php _e("What's new?","map-block"); ?></h3>

                <div class="feature-section three-col">
                    <div class="col">
                    <h4><?php _e("Store Locator","map-block"); ?></h4>
                    <p><?php _e("Let users search for products, branches and stores near them","map-block"); ?></p>
                     <img src='<?php echo map-blockAPS_DIR; ?>base/assets/storelocator.jpg' style="border:1px solid #ccc;" />              
                    </div>
                    <div class="col">
                    <h4><?php _e("Polygons","map-block"); ?></h4>
                    <p><?php _e("Create service areas or coverage maps with polygons","map-block"); ?></p>
                     <img src='<?php echo map-blockAPS_DIR; ?>base/assets/polygons.png' style="border:1px solid #ccc;" />              
                    </div>
                    <div class="col">
                    <h4><?php _e("Polylines","map-block"); ?></h4>
                    <p><?php _e("Create custom routes or outlines using polylines","map-block"); ?></p>
                     <img src='<?php echo map-blockAPS_DIR; ?>base/assets/polylines.png' style="border:1px solid #ccc;" style='margin-bottom:20px;' />              
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
                                    <input type='submit' name='map-block_save_feedback' value='Submit'> 
                                    
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
                                <p><?php _e("Visit our","map-block"); ?> <a title='Support Forum' target='_blank' href='http://www.map-blockaps.com/forums/forum/support-forum/'><?php _e("Support Forum","map-block"); ?></a> <?php _e("for quick and friendly help. We'll answer your request within 24hours.","map-block"); ?></p>
                            </div>
                            <div class='col'>
                                <h4><?php _e("Feedback","map-block"); ?></h4>
                                <p><?php _e("We need you to help us make this plugin better.","map-block"); ?> <a href='http://www.map-blockaps.com/contact-us/' title='Feedback' target='_BLANK'><?php _e("Send us your feedback","map-block"); ?></a> <?php _e("and we'll act on it as soon as humanly possible.","map-block"); ?></p>
                            </div>
                        </div>
                        
                <a class="button-primary" href="admin.php?page=map-block-menu&override=1"><?php echo __("OK! Let's start","map-block"); ?></a>

            </div>
                </div>
            </div>
        

    <?php
        
    } 
    
}