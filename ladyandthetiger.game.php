<?php
 /**
  *------
  * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
  * LadyAndTheTiger implementation : © <David Edelstein> <david.edelstein@gmail.com>
  * 
  * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
  * See http://en.boardgamearena.com/#!doc/Studio for more information.
  * -----
  * 
  * ladyandthetiger.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );

/**
 * Add these values for the index to a card
 */
define('DOOR', 0);
define('LADY', 1);
define('TIGER', 3);
define('BLUE', 0);
define('RED', 1);
define('REDBLUE', 5);
define('LADYTIGER', 6);

// type values
define ('DOORCARD', 1);
define('CLUECARD', 2);

class LadyAndTheTiger extends Table
{
	function __construct( )
	{
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();

        self::initGameStateLabels( array(
            "collector" => 10,
            "collector_role" => 11,
            "guesser" => 12,
            "guesser_role" => 13,
        ) );
        $this->cards = self::getNew( "module.common.deck" );
        $this->cards->init( "cards" );
	}

    protected function getGameName( )
    {
		// Used for translations and stuff. Please do not modify.
        return "ladyandthetiger";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = array() )
    {    
        // Set the colors of the players as Red/Blue
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode( $values, ',' );
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        self::initStat( 'table', 'turns_number', 0 );    // Init a table statistics

        // Create cards
		$cluecards = array();
		// Door cards = type 1, Clue cards = type 2
		// 0 = Door (Hidden)
		// 1 = Blue Lady
		// 2 = Red Lady
		// 3 = Blue Tiger
		// 4 = Red Tiger
		// 5 = Red/Blue
		// 6 = Lady/Tiger
		$cardvals = array(BLUE+LADY, RED+LADY, BLUE+TIGER, RED+TIGER);
		foreach ($cardvals as $ct) {
			$cluecards[] = array( 'type' => $ct, 'type_arg' => 0, 'nbr' => 3);
		}
		$cluecards[] = array( 'type' => REDBLUE, 'type_arg' => 0, 'nbr' => 1);
		$cluecards[] = array( 'type' => LADYTIGER, 'type_arg' => 0, 'nbr' => 1);

        $this->cards->createCards( $cluecards, 'deck' );      

		$player_id = $this->activeNextPlayer();
		$last = self::getPlayerBefore( $player_id );
        // First player is Collector, other player is Guesser, init in reverse order since we switch...
        self::setGameStateInitialValue( 'guesser', $player_id );
        self::setGameStateInitialValue( 'collector', $last );
        self::setGameStateInitialValue( 'guesser_role', 0 );
        self::setGameStateInitialValue( 'collector_role', 0 );
		

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array();
    
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );
		
        // The player's role card
        $result['role'] = 
  
        // Cards played on the table
        $result['cluecards'] = $this->cards->getCardsInLocation( 'cluecarddisplay' );
        $result['collectorcards'] = $this->cards->getCardsInLocation( 'collectordisplay' );
  
        return $result;
    }

   /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        // Game progression: get player minimum score
        $minimumScore = self::getUniqueValueFromDb( "SELECT MIN( player_score ) FROM player" );
		// score is up to 10        
        return max( 0, min( 100, $minimumScore*10 ) );   // Note: 0 => 100
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    



//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in ladyandthetiger.action.php)
    */

    /*
    
    Example:

    function playCard( $card_id )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'playCard' ); 
        
        $player_id = self::getActivePlayerId();
        
        // Add your game logic to play a card there 
        ...
        
        // Notify all players about the card played
        self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );
          
    }
    
    */

    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

	/**
	 * Args passed to the STATE_PLAYER_ACTION state in states.inc.php
	 */
	function argGetRoles() {
        $player_id = self::getActivePlayerId();
		$guesser = self::getGameStateValue('guesser');
		$result = array();
		if ($player_id == $guesser) {
			$result['actrole'] = "Guesser";
		} else {
			$result['actrole'] = "Collector";
		}

        return $result;
	}


//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

	/**
	 * Give each players a new Door card.
	 */
    function stAssignRoles() {
		self::debug("assigning roles");
		// reshuffle the Clue cards
		$this->cards->moveAllCardsInLocation(null, 'deck');
		$this->cards->shuffle('deck');

        $roles = array(RED+TIGER, RED+LADY, BLUE+TIGER, BLUE+LADY);
        shuffle($roles);

        $players = self::loadPlayersBasicInfos();
        foreach( $players as $player_id => $player ) {
            $role = array_pop($roles);
            // Notify player of his Role
            self::notifyPlayer( $player_id, 'newRole', '', array( 
                'role' => $role
            ) );
            if (self::getGameStateValue('collector') == $player_id) {
                self::setGameStateValue('collector_role', $role);
            } else {
                self::setGameStateValue('guesser_role', $role);
            }
        }
		$this->cards->pickCardsForLocation(4, 'deck', 'cluecarddisplay');
		
        $this->gamestate->nextState( "" );
	}

	/**
	 * Happens when Scoring - switch Collector and Guesser
	 */
    function stScore() {
		// switch collector and guesser
		$collector = self::getGameStateValue('collector');
		$guesser = self::getGameStateValue('guesser');
		self::setGameStateValue('guesser', $collector);
		self::setGameStateValue('collector', $guesser);
	}
	

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
    */

    function zombieTurn( $state, $active_player )
    {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb( $from_version )
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            $sql = "ALTER TABLE xxxxxxx ....";
//            self::DbQuery( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            $sql = "CREATE TABLE xxxxxxx ....";
//            self::DbQuery( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


    }    
}
