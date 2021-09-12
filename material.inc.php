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
 * material.inc.php
 *
 * LadyAndTheTiger game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

$this->role = array(
  'collector' => clienttranslate("Collector"),
  'guesser' => clienttranslate("Guesser"),
);

$this->identity = array(
  0 => clienttranslate('Door'),
  1 => clienttranslate('Blue Lady'),
  2 => clienttranslate('Red Lady'),
  3 => clienttranslate('Blue Tiger'),
  4 => clienttranslate('Red Tiger'),
  5 => clienttranslate('Red+Blue'),
  6 => clienttranslate('Lady+Tiger'),
);

$this->traits = array(
  "redlady" => clienttranslate("Red Lady"),
  "bluelady" => clienttranslate("Blue Lady"),
  "redtiger" => clienttranslate("Red Tiger"),
  "bluetiger" => clienttranslate("Blue Tiger"),
  "red" => clienttranslate("Red"),
  "blue" => clienttranslate("Blue"),
  "lady" => clienttranslate("Lady"),
  "tiger" => clienttranslate("Tiger"),
);