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
  <div id="pnorth" class="display whiteblock">
    <div id="role_n" class="rolecard">
        <h1 id="rolename_n" class="rolename"></h1>
    </div>
    <div id="tableau_n" class="tableau whiteblock"></div>
  </div>

  <div id="center" class="display">
    <div id="cluedeck"></div>
    <div id="cluedisplay"></div>
  </div>

  <div id="psouth" class="display whiteblock">
    <div id="role_s" class="rolecard">
        <h1 id="rolename_s" class="rolename"></h1>
    </div>
    <div id="tableau_s" class="tableau whiteblock"></div>
  </div>
<div>

</div>


<script type="text/javascript">

// Javascript HTML templates

</script>  

{OVERALL_GAME_FOOTER}