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
 * stats.inc.php
 *
 * LadyAndTheTiger game statistics description
 *
 */

/*
    In this file, you are describing game statistics, that will be displayed at the end of the
    game.
    
    !! After modifying this file, you must use "Reload  statistics configuration" in BGA Studio backoffice
    ("Control Panel" / "Manage Game" / "Your Game")
    
    There are 2 types of statistics:
    _ table statistics, that are not associated to a specific player (ie: 1 value for each game).
    _ player statistics, that are associated to each players (ie: 1 value for each player in the game).

    Statistics types can be "int" for integer, "float" for floating point values, and "bool" for boolean
    
    Once you defined your statistics there, you can start using "initStat", "setStat" and "incStat" method
    in your game logic, using statistics names defined below.
    
    !! It is not a good idea to modify this file when a game is running !!

    If your game is already public on BGA, please read the following before any change:
    http://en.doc.boardgamearena.com/Post-release_phase#Changes_that_breaks_the_games_in_progress
    
    Notes:
    * Statistic index is the reference used in setStat/incStat/initStat PHP method
    * Statistic index must contains alphanumerical characters and no space. Example: 'turn_played'
    * Statistics IDs must be >=10
    * Two table statistics can't share the same ID, two player statistics can't share the same ID
    * A table statistic can have the same ID than a player statistics
    * Statistics ID is the reference used by BGA website. If you change the ID, you lost all historical statistic data. Do NOT re-use an ID of a deleted statistic
    * Statistic name is the English description of the statistic as shown to players
    
*/

$stats_type = array(

    // Statistics global to table
    "table" => array(

        "turns_number" => array("id"=> 10,
                    "name" => totranslate("Number of turns"),
                    "type" => "int" ),
        "contests_number" => array("id"=> 11,
                    "name" => totranslate("Number of contests"),
                    "type" => "int" ),
    ),
    
    // Statistics existing for each player
    "player" => array(
        "gems_guesses" => array(   "id"=> 10,
                                "name" => totranslate("Gems for correct guesses"), 
                                "type" => "int" ),
        "gems_wrong_guesses" => array(   "id"=> 11,
                                "name" => totranslate("Gems for wrong guesses"), 
                                "type" => "int" ),
        "gems_matches" => array(   "id"=> 12,
                                "name" => totranslate("Gems for scoring a set"), 
                                "type" => "int" ),
        "gems_deck" => array(   "id"=> 13,
                                "name" => totranslate("Gems for deck running out"), 
                                "type" => "int" ),
        "cards_collected" => array(   "id"=> 14,
                                "name" => totranslate("Cards collected"), 
                                "type" => "int" ),
        "passes" => array(   "id"=> 15,
                                "name" => totranslate("Number of passes as Guesser"), 
                                "type" => "int" ),
        "sets_collector" => array(   "id"=> 16,
                                "name" => totranslate("Sets scored as Collector"), 
                                "type" => "int" ),
        "sets_guesser" => array(   "id"=> 17,
                                "name" => totranslate("Sets scored as Guesser"), 
                                "type" => "int" ),
        "discards" => array(   "id"=> 18,
                                "name" => totranslate("Cards discarded"), 
                                "type" => "int" ),
        "wrong_guesses" => array(   "id"=> 19,
                                "name" => totranslate("Wrong guesses"),
                                "type" => "int" ),
        "correct_guesses_1" => array(   "id"=> 21,
                                "name" => totranslate("Correct guesses (one trait)"), 
                                "type" => "int" ),
        "correct_guesses_2" => array(   "id"=> 22,
                                "name" => totranslate("Correct guesses (two traits)"), 
                                "type" => "int" ),
    )

);