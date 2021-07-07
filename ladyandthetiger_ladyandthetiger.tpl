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

<div id="ladytigerboard">
  <div id="pnorth" class="ladytiger_display whiteblock">
      <h1 id="rolename_n" class="ladytiger_rolename"></h1>
      <div id="role_n" class="ladytiger_rolecard">
      </div
    <div id="tableau_n" class="ladytiger_tableau whiteblock"></div>
  </div>

  <div id="center" class="ladytiger_display">
    <div id="cluedeck"></div>
    <div id="cluedisplay"></div>
  </div>

  <div id="psouth" class="ladytiger_display whiteblock">
      <h1 id="rolename_s" class="ladytiger_rolename"></h1>
      <div id="role_s" class="ladytiger_rolecard">
      </div>
    <div id="tableau_s" class="ladytiger_tableau whiteblock"></div>
  </div>
</div>

<script type="text/javascript">

// Javascript HTML templates

</script>  

{OVERALL_GAME_FOOTER}