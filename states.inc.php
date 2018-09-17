<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * LadyAndTheTiger implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * LadyAndTheTiger game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!

// define contants for state ids
if (!defined('STATE_SETUP')) { // ensure this block is only invoked once, since it is included multiple times
   define("STATE_SETUP", 1);
   define("STATE_ASSIGN_ROLES", 2);
   define("STATE_PLAYER_ACTION", 10);
   define("STATE_COLLECT_CARD", 20);
   define("STATE_DISCARD_CARD", 30);
   define("STATE_GUESSER_ACTION", 31);
   define("STATE_SCORE", 40);
   define("STATE_END_GAME", 99);
}
 
 
$machinestates = array(

    // The initial state. Please do not modify.
    STATE_SETUP => array(
        "name" => "gameSetup",
        "description" => clienttranslate("Game setup"),
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array( "" => STATE_ASSIGN_ROLES )
    ),
    
    // Assign/Switch Roles between Collector and Guesser
    STATE_ASSIGN_ROLES => array(
    		"name" => "assignRoles",
    		"description" => clienttranslate('Reassigning roles'),
    		"descriptionmyturn" => clienttranslate('Reassigning roles'),
    		"type" => "game",
    		"action" => "stAssignRoles",
    		"transitions" => array( "" => STATE_PLAYER_ACTION )
    ),

    // player must Collect or Discard, according to role
    STATE_PLAYER_ACTION => array(
    		"name" => "playerAction",
    		"description" => clienttranslate('${actplayer} is the ${actrole}'),
    		"descriptionmyturn" => clienttranslate('${you} are the ${actrole}'),
    		"type" => "activeplayer",
         "args" => "argGetRoles",
    		"possibleactions" => array( "collectCard", "discardCard" ),
    		"transitions" => array( "collectCard" => STATE_COLLECT_CARD, "discardCard" => STATE_DISCARD_CARD )
    ),

    // When a card has been collected by the Collector
    STATE_COLLECT_CARD => array(
    		"name" => "collectCard",
    		"description" => '',
    		"type" => "game",
    		"action" => "stCollectCard",
    		"transitions" => array( "score" => STATE_SCORE, "nextPlayer" => STATE_PLAYER_ACTION )
    ),

    // When a card has been discarded by the Guesser
    STATE_DISCARD_CARD => array(
    		"name" => "discardCard",
    		"description" => '',
    		"type" => "game",
    		"action" => "stDiscardCard",
    		"transitions" => array( "guesser" => STATE_GUESSER_ACTION )
    ),

    // player must Collect or Discard, according to role
    STATE_GUESSER_ACTION => array(
    		"name" => "guesserAction",
    		"description" => clienttranslate('${actplayer} may Guess, Score, or Pass'),
    		"descriptionmyturn" => clienttranslate('${you} must Guess, Score, or Pass'),
    		"type" => "activeplayer",
    		"possibleactions" => array( "guess", "score", "pass" ),
    		"transitions" => array( "pass" => STATE_PLAYER_ACTION, "zombiePass" => STATE_PLAYER_ACTION, "guess" => STATE_SCORE, "score" => STATE_SCORE )
    ),

    // When a card has been discarded by the Guesser
    STATE_SCORE => array(
    		"name" => "score",
    		"description" => '',
    		"type" => "game",
    		"action" => "stScore",
         "updateGameProgression" => true,   
    		"transitions" => array( "nextRound" => STATE_ASSIGN_ROLES, "endGame" => STATE_END_GAME )
    ),
    
    // Final state.
    // Please do not modify.
    STATE_END_GAME => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )

);



