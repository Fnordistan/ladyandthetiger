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
  0 => array('label' => 'door', 'name' => clienttranslate('Door')),
  1 => array('label' => 'bluelady', 'name' => clienttranslate('Blue Lady')),
  2 => array('label' => 'redlady', 'name' => clienttranslate('Red Lady')),
  3 => array('label' => 'bluetiger', 'name' => clienttranslate('Blue Tiger')),
  4 => array('label' => 'redtiger', 'name' => clienttranslate('Red Tiger')),
  5 => array('label' => 'redblue', 'name' => clienttranslate('Red+Blue')),
  6 => array('label' => 'ladytiger', 'name' => clienttranslate('Lady+Tiger')),
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