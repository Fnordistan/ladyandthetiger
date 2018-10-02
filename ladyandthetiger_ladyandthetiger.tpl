{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- LadyAndTheTiger implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    ladyandthetiger_ladyandthetiger.tpl
    
    This is the HTML template of your game.
    
    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.
    
    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format
    
    See your "view" PHP file to check how to set variables and control blocks
    
    Please REMOVE this comment before publishing your game on BGA
-->

<div id="board">
  <div class="display" id="pnorth">
    <div class="hand whiteblock">
      <div class="rolename" style="color:#{COLOR_N}">
        <h3>{ROLE_N}</h3>
      </div>
      <div class="doorcard">
      </div>
    </div>
    <div class="tableau whiteblock" id="tableau_{ROLE_N}"></div>
  </div>

  <div class="display" id="center">
    <div class="hand whiteblock">
      <div class="doorcard">
      </div>
    </div>
    <div class="tableau whiteblock" id="cluecards"></div>
  </div>

  <div class="display" id="psouth">
      <div class="hand whiteblock">
        <div class="rolename" style="color:#{COLOR_S}">
          <h3>{ROLE_S}</h3>
        </div>
        <div id="myhand">
        </div>
      </div>
    <div class="tableau whiteblock" id="tableau_{ROLE_S}"></div>
  <div>

</div>


<script type="text/javascript">

// Javascript HTML templates

/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${id}"></div>';

*/

</script>  

{OVERALL_GAME_FOOTER}