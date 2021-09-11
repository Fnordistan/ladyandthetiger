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
 * ladyandthetiger.action.php
 *
 * LadyAndTheTiger main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/ladyandthetiger/ladyandthetiger/myAction.html", ...)
 *
 */
  
  
class action_ladyandthetiger extends APP_GameAction
{ 
    // Constructor: please do not modify
   	public function __default()
  	{
  	    if( self::isArg( 'notifwindow') )
  	    {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    }
  	    else
  	    {
            $this->view = "ladyandthetiger_ladyandthetiger";
            self::trace( "Complete reinitialization of board game" );
      }
  	} 
  	
    /**
     * Collector chose a card.
     */
  	public function collect() {
        self::setAjaxMode();
        $type = self::getArg("card_type", AT_posint, true);
        $arg = self::getArg("card_arg", AT_posint, true);
        $this->game->collectCard($type, $arg);
        self::ajaxResponse();
    }

    /**
     * Guesser chose a card to discard.
     */
  	public function discard() {
        self::setAjaxMode();
        $type = self::getArg("card_type", AT_posint, true);
        $arg = self::getArg("card_arg", AT_posint, true);
        $this->game->discardCard($type, $arg);
        self::ajaxResponse();
    }

  /**
   * Guesser chose to match a set.
   */
    public function match() {
        self::setAjaxMode();
        $this->game->matchSet();
        self::ajaxResponse();
    }

   /**
    * Guesser chose to match a set.
    */
    public function guess() {
        self::setAjaxMode();
        $trait = self::getArg("trait", AT_alphanum, true);
        $this->game->guessIdentity($trait);
        self::ajaxResponse();
    }

    /**
     * Collector passes
     */
    public function pass() {
        self::setAjaxMode();
        $this->game->pass();
        self::ajaxResponse();
    }

}