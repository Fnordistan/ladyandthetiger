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

  <div id="pnorth" class="ltdr_display whiteblock">
    <div id="role_north" class="ltdr_rolecontainer">
      <h1 id="rolename_n" class="ltdr_rolename"></h1>
      <div id="role_n" class="ltdr_rolecard"></div>
    </div>
    <div id="tableau_n" class="ltdr_tableau"></div>
  </div>

  <div id="center" class="ltdr_display whiteblock">
    <div id="cluedeck"></div>
    <div id="cluedisplay"></div>
    <div id="cluediscard"></div>
  </div>

  <div id="psouth" class="ltdr_display whiteblock">
    <div id="role_south" class="ltdr_rolecontainer">
      <h1 id="rolename_s" class="ltdr_rolename"></h1>
      <div id="role_s" class="ltdr_rolecard"></div>
    </div>
    <div id="tableau_s" class="ltdr_tableau"></div>
  </div>
 
</div>

<script type="text/javascript">

// Javascript HTML templates

</script>  

{OVERALL_GAME_FOOTER}