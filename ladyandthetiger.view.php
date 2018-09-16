<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * LadyAndTheTiger implementation : © David Edelstein david.edelstein@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * ladyandthetiger.view.php
 *
 * This is your "view" file.
 *
 * The method "build_page" below is called each time the game interface is displayed to a player, ie:
 * _ when the game starts
 * _ when a player refreshes the game page (F5)
 *
 * "build_page" method allows you to dynamically modify the HTML generated for the game interface. In
 * particular, you can set here the values of variables elements defined in ladyandthetiger_ladyandthetiger.tpl (elements
 * like {MY_VARIABLE_ELEMENT}), and insert HTML block elements (also defined in your HTML template file)
 *
 * Note: if the HTML of your game interface is always the same, you don't have to place anything here.
 *
 */
  
  require_once( APP_BASE_PATH."view/common/game.view.php" );
  
  class view_ladyandthetiger_ladyandthetiger extends game_view
  {
    // labels for rolls
    const COLLECTOR = "Collector";
    const GUESSER = "Guesser";
    
    function getGameName() {
        return "ladyandthetiger";
    }    

  	function build_page( $viewArgs ) {		
  	    // Get players & players number
        $players = $this->game->loadPlayersBasicInfos();
        $players_nbr = count( $players );

        $template = self::getGameName() . "_" . self::getGameName();
        
        // Set COLOR_S to the current player color
        // Set COLOR_N to other play
        global $g_user;
        $cplayer = $g_user->get_id();
        $is_spectator = !array_key_exists($cplayer, $players);
        $guesser = $this->game->getGameStateValue('guesser');
 
        foreach ( $players as $player_id => $info ) {
          $player_color = $players [$player_id] ['player_color'];
          /** Current player (i.e., "Me" - NOT Active Player!) is to the South, other player is North */
          if ($is_spectator) {
              // for spectators, put the Collector North and the Guesser South
              $this->tpl ['COLOR_N'] = '000000';
              $this->tpl ['COLOR_S'] = 'ffffff';
              if ($guesser == $player_id) {
                 $this->tpl['ROLE_N'] = self::COLLECTOR;
                 $this->tpl['ROLE_S'] = self::GUESSER;
              }
          } else {
            // am I the guesser?
            $is_guesser = ($guesser == $cplayer);
            if ($player_id == $cplayer) {
              // I am current player - put me to the South
              $this->tpl ['COLOR_S'] = $player_color;        
              $this->tpl ['PID_S'] = $player_id;
              if ($is_guesser) {
                $this->tpl['ROLE_S'] = self::GUESSER;
              } else {
                $this->tpl['ROLE_S'] = self::COLLECTOR;
              }
            } else {
                $this->tpl ['COLOR_N'] = $player_color;        
                $this->tpl ['PID_N'] = $player_id;        
                if ($is_guesser) {
                  $this->tpl['ROLE_N'] = self::COLLECTOR;
                } else {
                  $this->tpl['ROLE_N'] = self::GUESSER;
                }
            }
          }
        }
        // this will make our My Hand text translatable
        $this->tpl['MY_HAND'] = self::_("My hand");

        /*********** Do not change anything below this line  ************/
  	}
  }
  

