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
define('COLLECTOR', 'collector');
define('GUESSER', 'guesser');

define('ICON', '${icon}');

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
            COLLECTOR => 10,
            "collector_identity" => 11,
            GUESSER => 12,
            "guesser_identity" => 13,
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
    protected function setupNewGame( $players, $options = [] )
    {    
        // Set the colors of the players as Red/Blue
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = [];
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
        self::initStat( 'table', 'turns_number', 0 );
        self::initStat( 'table', 'contests_number', 0 );
        self::initStat( 'player', 'gems_guesses', 0 );
        self::initStat( 'player', 'gems_wrong_guesses', 0 );
        self::initStat( 'player', 'gems_matches', 0 );
        self::initStat( 'player', 'gems_deck', 0 );
        self::initStat( 'player', 'cards_collected', 0 );
        self::initStat( 'player', 'passes', 0 );
        self::initStat( 'player', 'sets_collector', 0 );
        self::initStat( 'player', 'sets_guesser', 0 );
        self::initStat( 'player', 'discards', 0 );
        self::initStat( 'player', 'wrong_guesses', 0 );
        self::initStat( 'player', 'correct_guesses_1', 0 );
        self::initStat( 'player', 'correct_guesses_2', 0 );

        // Create cards
		$cluecards = [];
		// Door cards = type 1, Clue cards = type 2
		// 0 = Door (Hidden)
		// 1 = Blue Lady
		// 2 = Red Lady
		// 3 = Blue Tiger
		// 4 = Red Tiger
		// 5 = Red/Blue
		// 6 = Lady/Tiger
		$cardvals = [BLUE+LADY, RED+LADY, BLUE+TIGER, RED+TIGER];
		foreach ($cardvals as $ct) {
            for ($i = 0; $i < 3; $i++) {
                $cluecards[] = [ 'type' => $ct, 'type_arg' => $i, 'nbr' => 1];
            }
		}
		$cluecards[] = [ 'type' => REDBLUE, 'type_arg' => 0, 'nbr' => 1];
		$cluecards[] = [ 'type' => LADYTIGER, 'type_arg' => 0, 'nbr' => 1];

        $this->cards->createCards( $cluecards, 'deck' );      

        self::setGameStateInitialValue( GUESSER, 0 );
        self::setGameStateInitialValue( COLLECTOR, 0 );
        self::setGameStateInitialValue( 'guesser_identity', 0 );
        self::setGameStateInitialValue( 'collector_identity', 0 );
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
        $result = [];
    
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score, player_color color FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );

        $result[COLLECTOR] = self::getGameStateValue(COLLECTOR);
        $result[GUESSER] = self::getGameStateValue(GUESSER);

        if (self::getGameStateValue(COLLECTOR) == $current_player_id) {
            $result['identity'] = self::getGameStateValue('collector_identity');
        } else if (self::getGameStateValue(GUESSER) == $current_player_id) {
            $result['identity'] = self::getGameStateValue('guesser_identity');
        }

        // Cards played on the table
        $result['cluecards'] = $this->cards->getCardsInLocation( 'cluedisplay' );
        $result['collectorcards'] = $this->cards->getCardsInLocation( COLLECTOR );
        $result['discards'] = $this->cards->getCardsInLocation( 'discard' );
        $result['decksize'] = $this->cards->countCardInLocation('deck');
  
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

    /**
     * Given a card id, return the type value to give to identity.
     */
    function getCardIdentity($id) {
        $type = self::getUniqueValueFromDB("SELECT card_type FROM cards WHERE card_id=$id");
        return $type;
    }

    /**
     * Test whether a card type is one of a trait ("RED", "BLUE", "LADY", or "TIGER").
     * @param {int} type
     * @param {string} trait
     */
    function cardHasTrait($type, $trait) {
        $cards = [];
        switch ($trait) {
            case "RED":
                $cards = [RED+LADY, RED+TIGER, REDBLUE];
                break;
            case "BLUE":
                $cards = [BLUE+LADY, BLUE+TIGER, REDBLUE];
                break;
            case "LADY":
                $cards = [RED+LADY, BLUE+LADY, LADYTIGER];
                break;
            case "TIGER":
                $cards = [RED+TIGER, BLUE+TIGER, LADYTIGER];
                break;
        }
        return in_array($type, $cards);
    }

    /**
     * Given a role value, return two-member array of its two traits.
     */
    function getTraitsForRole($role) {
        if ($role == RED+LADY) {
            return ["RED", "LADY"];
        } else if ($role == BLUE+LADY) {
            return ["BLUE", "LADY"];
        } else if ($role == RED+TIGER) {
            return ["RED", "TIGER"];
        } else if ($role == BLUE+TIGER) {
            return ["BLUE", "TIGER"];
        }
        throw new BgaVisibleSystemException("Unrecognized role: $role"); // NOI18N
    }

    /**
     * Return an associative array counting all the traits in Collector's collected cards.
     * @return associative array ("RED/BLUE/LADY/TIGER" => count)
     */
    function getCollectedTraits() {
        $traits = ["RED" => 0, "BLUE" => 0, "TIGER" => 0, "LADY" => 0];

        $collection = $this->cards->getCardsInLocation(COLLECTOR);
        foreach ($traits as $trait => $c) {
            foreach ($collection as $c) {
                $type = $c['type'];
                if ($this->cardHasTrait($type, $trait)) {
                    $traits[$trait]++;
                }
            }
        }
        return $traits;
    }

    /**
     * Add a card from the deck to the clue display.
     * Return number of cards remaining in deck.
     */
    function refillClueDisplay() {
        $card = $this->cards->pickCardForLocation('deck', 'cluedisplay');
        $decksize = $this->cards->countCardInLocation('deck');
        $card_id = $this->getCardIdentity($card['id']);
        self::notifyAllPlayers('newClueCard', clienttranslate('${card_type} added to clue card display'), array(
            'i18n' => ['card_type'],
            'card_type' => $this->identity[$card_id]['name'],
            'label' => $this->identity[$card_id]['label'],
            'type' => $card['type'],
            'arg' => $card['type_arg'],
            'decksize' => $decksize,
            'preserve' => ['label'],
        ));
        return $decksize;
    }

    /**
     * Given an identity (collector or guesser) check for collected traits in the Collector display.
     * If one found with 4 or more, return it, otherwise return null.
     */
    function getMatchingCollectedTrait($identity) {
        // does Collector have a set?
        $collectedtraits = $this->getCollectedTraits();

        $id = self::getGameStateValue($identity);
        $traits = $this->getTraitsForRole($id);
        foreach ($traits as $trait) {
            if ($collectedtraits[$trait] >= 4) {
                return $trait;
            }
        }
        return null;
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /**
     * Guesser guessed trait for identity
     */
    function guessIdentity($trait) {
        self::checkAction( 'guess' );
        $collector_identity = self::getGameStateValue("collector_identity");

        $traits_to_identities = [
            "redlady" => [RED+LADY],
            "bluelady" => [BLUE+LADY],
            "redtiger" => [RED+TIGER],
            "bluetiger" => [BLUE+TIGER],
            "red" => [RED+LADY, RED+TIGER],
            "blue" => [BLUE+LADY, BLUE+TIGER],
            "lady" => [RED+LADY, BLUE+LADY],
            "tiger" => [RED+TIGER, BLUE+TIGER],
        ];

        $matches = $traits_to_identities[$trait];
        $scorer = GUESSER;
        if (isset($matches)) {
            $players = self::loadPlayersBasicInfos();
            $gems = 0;
            if (in_array($collector_identity, $matches)) {
                $sz = count($matches);
                $pts = [ 1 => 5, 2 => 1];
                if (isset($pts[$sz])) {
                    $gems = $pts[$sz];
                } else {
                    throw new BgaVisibleSystemException("Invalid matches for $trait: $matches"); // NOI18N
                }
            } else {
                // Wrong guess, Collector gets 4 gems
                $scorer = COLLECTOR;
                $gems = 4;
            }

            $collector_id = self::getGameStateValue(COLLECTOR);
            $scoring_player_id = self::getGameStateValue($scorer);
            // stats
            if ($scorer == GUESSER) {
                self::incStat($gems, 'gems_guesses', $scoring_player_id);
                if ($gems == 1) {
                    self::incStat(1, 'correct_guesses_1', $scoring_player_id);
                } else {
                    self::incStat(1, 'correct_guesses_2', $scoring_player_id);
                }
            } else {
                self::incStat($gems, 'gems_wrong_guesses', $scoring_player_id);
                $guesser_id = self::getGameStateValue(GUESSER);
                self::incStat(1, 'wrong_guesses', $guesser_id);
            }

            self::notifyAllPlayers('guessed', clienttranslate('${player_name} guessed ${collector_name} is ${trait}${icon}'), array(
                'i18n' => ['trait'],
                'player_name' => self::getActivePlayerName(),
                'collector' => $collector_id,
                'collector_name' => $players[$collector_id]['player_name'],
                'trait' => $this->traits[$trait],
                'icon' => $trait,
                'preserve' => ['collector'],

            ));

            // reveal cards
            $this->revealIdentities();

            self::notifyAllPlayers('guessedResult', clienttranslate('${scorer_name} (${scoring_role}) scores ${score} gems'), array(
                'i18n' => ['scoring_role'],
                'scorer' => $scoring_player_id,
                'scorer_name' => $players[$scoring_player_id]['player_name'],
                'scoring_role' => $this->role[$scorer],
                'score' => $gems,
                'preserve' => ['scorer'],
            ));

            self::DbQuery( "UPDATE player SET player_score=player_score+$gems WHERE player_id=$scoring_player_id" );
            $this->gamestate->nextState("endContest");
        } else {
            // shouldn't happen unless there has been hackery
            throw new BgaVisibleSystemException("Unrecognized trait: $trait"); // NOI18N
        }
    }

    /**
     * Guesser chooses to match set.
     */
    function matchSet() {
        self::checkAction( 'match' );
        $traitset = $this->getMatchingCollectedTrait('guesser_identity');
        if ($traitset == null) {
            throw new BgaUserException(self::_("No matching set!"));
        }

        $this->scoreSet(GUESSER, $traitset, 2);
    }

    /** 
     * Collector selected a card
    */
    function collectCard( $type, $arg ) {
        self::checkAction( 'collectCard' );

        $id = self::getUniqueValueFromDB("SELECT card_id FROM cards WHERE card_type=$type AND card_type_arg=$arg AND card_location='cluedisplay'");
        if ($id == null) {
            throw new BgaUserException(self::_("That card is not in the display!"));
        }
        $this->cards->moveCard($id, COLLECTOR);
        $card_id = $this->getCardIdentity($id);
        self::notifyAllPlayers('cardCollected', clienttranslate('${player_name} adds ${card_type} to their collection'), array(
            'i18n' => ['card_type'],
            'player_name' => self::getActivePlayerName(),
            'card_type' => $this->identity[$card_id]['name'],
            'label' => $this->identity[$card_id]['label'],
            'type' => $type,
            'arg' => $arg,
            'preserve' => ['label'],
        ));

        self::incStat(1, 'cards_collected', self::getActivePlayerId());

        // does Collector have a set?
        $traitset = $this->getMatchingCollectedTrait('collector_identity');

        if ($traitset != null) {
            $this->scoreSet(COLLECTOR, $traitset, 6);
        } else {
            $this->drawCardAction("nextPlayer");
        }
    }

    /**
     * When either Collector acquires four matching cards or Guesser reveals a set.
     */
    function scoreSet($role, $trait, $gems) {
        // reveal roles
        $this->revealIdentities();

        $trait_tr = array(
            "RED" => clienttranslate("RED"),
            "BLUE" => clienttranslate("BLUE"),
            "LADY" => clienttranslate("LADY"),
            "TIGER" => clienttranslate("TIGER"),
        );

        // score
        $player_id = self::getActivePlayerId();
        self::notifyAllPlayers('setCollected', clienttranslate('${player_name} (${role}) matches four ${trait}${icon} cards and scores ${score} gems'), array(
            'i18n' => ['role', 'trait'],
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'role' => $this->role[$role],
            'trait' => $trait_tr[$trait],
            'icon' => $trait,
            'score' => $gems
        ));
        self::DbQuery( "UPDATE player SET player_score=player_score+$gems WHERE player_id=$player_id" );

        self::incStat($gems, 'gems_matches', $player_id);
        if ($role == COLLECTOR) {
            self::incStat(1, 'sets_collector', $player_id);
        } else {
            self::incStat(1, 'sets_guesser', $player_id);
        }

        $this->gamestate->nextState("endContest");
    }

    /**
     * Send notification to reveal both players' identities
     */
    function revealIdentities() {
        $guesser = self::getGameStateValue(GUESSER);
        $guesser_id = self::getGameStateValue('guesser_identity');
        $collector = self::getGameStateValue(COLLECTOR);
        $collector_id = self::getGameStateValue('collector_identity');

        $players = self::loadPlayersBasicInfos();
        $collector_name = $players[$collector]['player_name'];
        $guesser_name = $players[$guesser]['player_name'];

        self::notifyAllPlayers('identitiesRevealed', clienttranslate('Revealed! ${collector_name} is the ${collector_identity}${icon} ${guesser_name} is the ${guesser_identity}${icon2}'), array(
            'i18n' => ['collector_identity', 'guesser_identity'],
            'guesser' => $guesser,
            'guesser_name' => $guesser_name,
            'guesser_id' => $guesser_id,
            'icon2' => $this->identity[$guesser_id]['label'],
            'guesser_identity' => $this->identity[$guesser_id]['name'],
            'collector' => $collector,
            'collector_name' => $collector_name,
            'collector_id' => $collector_id,
            'icon' => $this->identity[$collector_id]['label'],
            'collector_identity' => $this->identity[$collector_id]['name'],
        ));
    }

    /**
     * Guesser discarded a card.
     */
    function discardCard($type, $arg) {
        self::checkAction( 'discardCard' );
        $id = self::getUniqueValueFromDB("SELECT card_id FROM cards WHERE card_type=$type AND card_type_arg=$arg AND card_location='cluedisplay'");
        if ($id == null) {
            throw new BgaUserException(self::_("That card is not in the display!"));
        }
        $this->cards->moveCard($id, 'discard');
        $card_id = $this->getCardIdentity($id);
        self::notifyAllPlayers('cardDiscarded', clienttranslate('${player_name} discards ${card_type} from the display').'${label}', array(
            'i18n' => ['card_type'],
            'player_name' => self::getActivePlayerName(),
            'card_type' => $this->identity[$card_id]['name'],
            'label' => $this->identity[$card_id]['label'],
            'type' => $type,
            'arg' => $arg
        ));
        self::incStat(1, 'discards', self::getActivePlayerId());
        $this->drawCardAction("guesser");
    }

    /**
     * Collector passed.
     */
    function pass() {
        self::checkAction( 'pass' );
        self::notifyAllPlayers('passed', clienttranslate('${player_name} passes'), array(
            'player_name' => self::getActivePlayerName(),
        ));
        self::incStat(1, 'passes', self::getActivePlayerId());

        $this->gamestate->nextState("nextPlayer");
    }

    /**
     * Refill the clue display, move to next state unless deck is empty.
     * @param state state to move to if deck isn't empty
     */
    function drawCardAction($state) {
        $size = $this->refillClueDisplay();
        if ($size == 0) {

            $players = self::loadPlayersBasicInfos();
            $guesser = self::getGameStateValue(GUESSER);
            $gems = 3;
            self::notifyAllPlayers('deckEmpty', clienttranslate('Deck is empty; Guesser (${player_name}) scores ${score} gems'), array(
                'player_id' => $guesser,
                'player_name' => $players[$guesser]['player_name'],
                'score' => $gems
            ));
            $this->revealIdentities();
            self::DbQuery( "UPDATE player SET player_score=player_score+$gems WHERE player_id=$guesser" );

            self::incStat(3, 'gems_deck', $guesser);

            $this->gamestate->nextState("endContest");
        } else {
            $this->gamestate->nextState($state);
        }
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

	/**
	 * Args passed to the STATE_PLAYER_ACTION state in states.inc.php
	 */
	function argGetRole() {
        $player_id = self::getActivePlayerId();
		$guesser = self::getGameStateValue(GUESSER);
		$role = ($player_id == $guesser) ? clienttranslate("Guesser") :  clienttranslate("Collector");
        return [ 'role' => $role];
	}


//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

	/**
	 * Set/switch roles and deal identity cards.
	 */
    function stNewContest() {
        $collector = self::getGameStateValue(COLLECTOR);
        $guesser = self::getGameStateValue(GUESSER);

        // First player is Collector, other player is Guesser
        if ($collector == 0 && $guesser == 0) {
            // first round
            $collector = $this->activeNextPlayer();
            $guesser = $this->getPlayerBefore( $collector );
            self::setGameStateValue(COLLECTOR, $collector);
            self::setGameStateValue(GUESSER, $guesser);
        } else {
            // switch them
            $collector = self::getGameStateValue(GUESSER);
            $guesser = self::getGameStateValue(COLLECTOR);
            self::setGameStateValue(COLLECTOR, $collector);
            self::setGameStateValue(GUESSER, $guesser);
            $this->gamestate->changeActivePlayer($collector);
        }

        // (re)shuffle the Clue cards
		$this->cards->moveAllCardsInLocation(null, 'deck');
		$this->cards->shuffle('deck');
		$this->cards->pickCardsForLocation(4, 'deck', 'cluedisplay');

        $identities = [RED+TIGER, RED+LADY, BLUE+TIGER, BLUE+LADY];
        shuffle($identities);

        $players = self::loadPlayersBasicInfos();
        foreach( $players as $player_id => $player ) {
            $identity = array_pop($identities);
            // Notify player of his identity
            self::notifyPlayer( $player_id, 'newRole', clienttranslate('New contest: You are the ${identity_name}').ICON, array(
                'i18n' => ['identity_name'],
                'identity' => $identity,
                'icon' => $this->identity[$identity]['label'],
                'identity_name' => $this->identity[$identity]['name'],
                'preserve' => ['identity'],
            ) );
            if (self::getGameStateValue(COLLECTOR) == $player_id) {
                self::setGameStateValue('collector_identity', $identity);
            } else {
                self::setGameStateValue('guesser_identity', $identity);
            }
        }

        self::notifyAllPlayers("newContest", clienttranslate('${collector_name} is Collector, ${guesser_name} is Guesser'), array(
            COLLECTOR => $collector,
            'collector_name' => $players[$collector]['player_name'],
            GUESSER => $guesser,
            'guesser_name' => $players[$guesser]['player_name'],
            'decksize' => $this->cards->countCardInLocation('deck'),
            'cluecards' => $this->cards->getCardsInLocation('cluedisplay'),
            'preserve' => [GUESSER]
        ));
        self::incStat(1, 'contests_number');

        $this->gamestate->nextState( "" );
	}

    /**
     * Switch active player.
     */
    function stNextPlayer() {
        $player_id = self::activeNextPlayer();
        self::giveExtraTime( $player_id );

        self::incStat(1, 'turns_number');
        $nextState = self::getGameStateValue(COLLECTOR) == $player_id ? COLLECTOR : GUESSER;

        $this->gamestate->nextState($nextState);
    }

    /**
     * Someone collected gems.
     */
    function stContestEnd() {
        $nextState = "newContest";
        // check if anyone has won
        $scores = self::getObjectListFromDB("SELECT player_score FROM player", true);
        foreach ($scores as $score) {
            if ($score >= 10) {
                $nextState = "endGame";
            }
        }
        $this->gamestate->nextState($nextState);
    }

	/**
	 * Happens when Scoring - switch Collector and Guesser
	 */
    function stScore() {
		// switch collector and guesser
		$collector = self::getGameStateValue(COLLECTOR);
		$guesser = self::getGameStateValue(GUESSER);
		self::setGameStateValue(GUESSER, $collector);
		self::setGameStateValue(COLLECTOR, $guesser);
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
                case 'collectorAction':
                    $display = $this->cards->getCardsInLocation('cluedisplay');
                    $card = array_pop($display);
                    $this->collectCard($card['type'], $card['type_arg']);
                    break;
                case 'guesserDiscard':
                    $display = $this->cards->getCardsInLocation('cluedisplay');
                    $card = array_pop($display);
                    $this->discardCard($card['type'], $card['type_arg']);
                    break;
                case 'guesserAction':
                    $this->pass();
                    break;
                default:
                    throw new BgaVisibleSystemException("Unexpected game state in zombie mode: ".$statename); // NOI18N
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }

        throw new BgaVisibleSystemException( "Zombie mode not supported at this game state: ".$statename ); // NOI18N
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
