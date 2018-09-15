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

<div id="playerboard">
    <div id="pnorth">
      <div class="tableau tableau_N">
        <div class="tableauname" style="color:#{COLOR_N}">
          <h3>Who Are You?</h3>
          </div>
        <div class="doorcard1" id="doorcard_{PID_N}">
        </div>
      </div>
    <div>

    <div class="display whiteblock">
        <div class="cluecard" id="cluecarddisplay">
        </div>
    </div>

    <div id="psouth">
      <div class="tableau tableau_S">
        <div class="tableauname" style="color:#{COLOR_S}">
          <h3>Who am I?</h3>
        </div>
        <div class="doorcard2" id="doorcard_{PID_S}">
        </div>
      </div>
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
