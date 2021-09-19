{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- LadyAndTheTiger implementation : © <David Edelstein> <david.edelstein@gmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------
-->

<div id="ladytigerboard">

  <div id="player_north" class="ltdr_display whiteblock">
    <div id="role_north" class="ltdr_rolecontainer">
      <h1 id="rolename_n" class="ltdr_rolename"></h1>
      <div id="flip_container_n" class="ltdr_flip_container">
        <div id="inner_n" class="ltdr_flip_inner">
          <div id="role_n" class="ltdr_rolecard"></div>
          <div id="flip_n" class="ltdr_flipback ltdr_rolecard"></div>
        </div>
      </div>
    </div>
    <div id="tableau_n"></div>
  </div>

  <div id="center_display" class="ltdr_display whiteblock">
    <div id="deckcontainer">
      <h1 id="deckcount"></h1>
      <div id="cluedeck"></div>
    </div>
    <div id="cluedisplay_container">
      <div id="cluedisplay"></div>
    </div>
    <div id="discardcontainer">
      <h1>{DISCARDPILE}</h1>
      <div id="cluediscard"></div>
    </div>
  </div>

  <div id="player_south" class="ltdr_display whiteblock">
    <div id="role_south" class="ltdr_rolecontainer">
      <h1 id="rolename_s" class="ltdr_rolename"></h1>
      <div id="flip_container_s" class="ltdr_flip_container">
        <div id="inner_s" class="ltdr_flip_inner">
          <div id="role_s" class="ltdr_rolecard"></div>
          <div id="flip_s" class="ltdr_flipback ltdr_rolecard"></div>
        </div>
      </div>
    </div>
    <div id="tableau_s"></div>
  </div>
 
</div>

<script type="text/javascript">

// Javascript HTML templates

const jstpl_icon = '<div class="ltdr_traiticon ltdr_trait_${trait}"></div>';

const jstpl_color_text = '<span style="font-family: cursive; font-size: larger; font-weight: bold; color: ${color};">${text}</span>';
// specifically to make guess selection button clickable
const jstpl_color_text_id = '<span id="guess_sel_txt" style="font-family: cursive; font-size: larger; font-weight: bold; color: ${color};">${text}</span>';
const jstpl_color_lg_text = '<span style="font-family: cursive; font-size: 24px; font-weight: bold; color: ${color};">${text}</span>';

const jstpl_card_tooltip = '<span style="font-family: cursive; font-size: 24px; font-weight: bold; color: ${color};">${text}</span>';

const jstpl_card_tooltip_icon = '<div class="ltdr_trait ltdr_trait_${trait}"></div><span style="font-family: cursive; font-size: 24px; font-weight: bold; color: ${color};">${text}</span>';

</script>  

{OVERALL_GAME_FOOTER}