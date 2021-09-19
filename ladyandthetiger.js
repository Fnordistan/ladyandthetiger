/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * LadyAndTheTiger implementation : © <David Edelstein> <david.edelstein@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * ladyandthetiger.js
 *
 * LadyAndTheTiger user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

/**
 * Values matching the constants for role values defined in ladyandthetiger.game.php.
 */
const DOOR = 0;
const LADY = 1;
const TIGER = 3;
const BLUE = 0;
const RED = 1;
const REDBLUE = 5;
const LADYTIGER = 6;

const CARD_SPRITES = 'img/card_sprites.png';

/** Correspond to type/type_arg and card positions */
const CARD_TYPE_TO_POS = [
    /** DOOR */         [12],
    /** BLUE+LADY */    [0, 13, 14],
    /** RED+LADY */     [4, 8, 9],
    /** BLUE+TIGER */   [1, 2, 3],
    /** RED+TIGER */    [5, 10, 11],
    /** REDBLUE */      [7],
    /** LADYTIGER */    [6]
];

const RED_TYPES = [4, 8, 9, 5, 10, 11, 7];
const BLUE_TYPES = [0, 13, 14, 1, 2, 3, 7];
const LADY_TYPES = [0, 13, 14, 4, 8, 9, 6];
const TIGER_TYPES = [1, 2, 3, 5, 10, 11, 6];

const COLLECTOR = 'collector';
const GUESSER = 'guesser';

const IDENTITY_CLASSES = ['ltdr_redlady', 'ltdr_bluelady', 'ltdr_redtiger', 'ltdr_bluetiger', 'ltdr_door'];

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
],

/**
 * For Door cards (door, bl, rl, bt, rt), add these numbers to get the card
 */
function (dojo, declare) {
    return declare("bgagame.ladyandthetiger", ebg.core.gamegui, {
        constructor: function(){
            // Here, you can init the global variables of your user interface
            this.playerHand = null;
            this.clueCards = null;
            this.rolecardwidth = 218;
            this.rolecardheight = 360;
            this.cluecardwidth = 218;
            this.cluecardheight = 365;
        },
        
        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        
        setup: function( gamedatas ) {
            const collector = this.gamedatas.collector;
            const guesser = this.gamedatas.guesser;
            this.setupPlayerTableaus(collector, guesser, this.gamedatas.collectorcards);

            const identity = this.gamedatas.identity;
            this.setupRoleCard(identity);

            const decksize = parseInt(this.gamedatas.decksize);
            const cluecards = this.gamedatas.cluecards;

            this.setupClueDisplay(decksize, cluecards);
            const discards = this.gamedatas.discards;
            this.setupDiscard(discards);

            this.setupNotifications();
        },

        /**
         * Set up Collector and Guesser boards and Role cards.
         * Make both Doors for Spectator.
         * @param {int} collector player_id
         * @param {int} guesser player_id
         * @param {array} collectorcards
         */
         setupPlayerTableaus: function(collector, guesser, collectorcards) {
            const collectorColor = this.gamedatas.players[collector]['color'];
            const guesserColor = this.gamedatas.players[guesser]['color'];

            const CollectorTr = _('Collector');
            const GuesserTr = _('Guesser');

            // north is the collector by default
            const myrole = (this.isSpectator) ? COLLECTOR : (this.player_id == collector) ? COLLECTOR : GUESSER;
            const mycolor = (myrole == COLLECTOR) ? collectorColor : guesserColor;
            const hisrole = (myrole == COLLECTOR) ? GUESSER : COLLECTOR;
            const hiscolor = (hisrole == COLLECTOR) ? collectorColor : guesserColor;

            const role_n = document.getElementById('rolename_n');
            role_n.innerHTML = (myrole == COLLECTOR) ? CollectorTr : GuesserTr;
            role_n.style['color'] = '#'+mycolor;

            const role_s = document.getElementById('rolename_s');
            role_s.innerHTML = (hisrole == COLLECTOR) ? CollectorTr : GuesserTr;
            role_s.style['color'] = '#'+hiscolor;

            const hisrolecard = document.getElementById('role_s');
            hisrolecard.classList.add('ltdr_door');
            let doortext = _('${role} is behind this door');
            doortext = doortext.replace('${role}', hisrole == COLLECTOR ? CollectorTr : GuesserTr);

            let hisroletooltip = this.format_block('jstpl_card_tooltip', {color: 'black', text: doortext});

            this.addTooltip(hisrolecard.id, hisroletooltip, '');

            let guesser_d, collector_d, guesser_t, collector_t;
            if (myrole == GUESSER) {
                guesser_d = 'player_north';
                guesser_t = 'tableau_n';
                collector_d = 'player_south';
                collector_t = 'tableau_s';
            } else {
                guesser_d = 'player_south';
                guesser_t = 'tableau_s';
                collector_d = 'player_north';
                collector_t = 'tableau_n';
            }

            const guesser_tableau = document.getElementById(guesser_t);
            guesser_tableau.style['display'] = 'none';

            const guesser_display = document.getElementById(guesser_d);
            guesser_display.style['width'] = 'fit-content';

            const collector_display = document.getElementById(collector_d);
            collector_display.style['width'] = '100%';

            this.setupCollectorDisplay(collector_t, collectorcards);
        },

        /**
         * Place Role card for north player.
         * @param {int} identity 
         */
        setupRoleCard: function(identity) {
            const myrolecard = document.getElementById('role_n');
            myrolecard.classList.remove(...IDENTITY_CLASSES);
            if (!this.isSpectator) {
                const myidentity = this.getCardIdentity(identity);
                myrolecard.classList.add('ltdr_'+myidentity);
                let myid = _('You are the ${identity}!');
                myid = myid.replace('${identity}', this.getLabelByValue(identity));
                let idclr = myidentity.includes("red") ? 'red' : 'blue';
                let idtooltip = this.format_block('jstpl_card_tooltip_icon', {trait: myidentity, color: idclr, text: myid});
                this.addTooltip(myrolecard.id, idtooltip, '');
            } else {
                myrolecard.classList.add('ltdr_door');
                let doortext = _('${role} is behind this door');
                doortext = doortext.replace('${role}', _("Collector"));
                let roletooltip = this.format_block('jstpl_card_tooltip', {color: 'black', text: doortext});
                this.addTooltip(myrolecard.id, roletooltip, '');
            }
        },

        /**
         * Set up the clue display.
         * @param {int} decksize
         * @param {Object} cluecards
         */
        setupClueDisplay: function(decksize, cluecards) {
            let cardsremain = _('Cards Remaining: ${decksize}');
            cardsremain = cardsremain.replace('${decksize}', decksize);
            document.getElementById('deckcount').innerHTML = cardsremain;
            for (let i = 0; i < decksize; i++) {
                const offset = 5+(2*i)+"px";
                const cardback = `<div id="cluecard_${i}" class="ltdr_cluecard ltdr_cardback" style="position: absolute; margin: ${offset} 0 0 ${offset};"></div>`;
                dojo.place(cardback, 'cluedeck', i);
            }
            this.addTooltip('cluedeck', cardsremain, '');

            this.cluedisplay = this.createCardStockRow('cluedisplay');
            for (const c in cluecards) {
                const card = cluecards[c];
                const id = CARD_TYPE_TO_POS[card.type][card.type_arg];
                this.cluedisplay.addToStockWithId(id, id, 'cluedeck');
                this.decorateClueCard(id, card.type, card.type_arg);
              
            }
        },

        /**
         * For clue cards in cluedisplay, add Event listeners.
         * @param {string} id 
         * @param {int} type 
         * @param {int} arg 
         */
        decorateClueCard: function(id, type, arg) {
            $('cluedisplay_item_'+id).addEventListener('click', () => {
                this.onClueCardSelected(type, arg);
            });
            $('cluedisplay_item_'+id).addEventListener('mouseenter', () => {
                this.onClueCardHover(id, true);
            });
            $('cluedisplay_item_'+id).addEventListener('mouseout', () => {
                this.onClueCardHover(id, false);
            });
        },


        /**
         * Set up the discard deck.
         * @param {Object} discards
         */
        setupDiscard: function(discards) {
            const discard = document.getElementById('cluediscard');
            while (discard.firstChild) {
                discard.firstChild.remove();
            }
            for (const d in discards) {
                const card = discards[d];
                this.createDiscardCard(card.type, card.type_arg);
            }
            this.decorateDiscardPile(Object.keys(discards).length);
            var discarded = document.getElementsByClassName('ltdr_discard');
            discard.addEventListener('click', () => {
                var off = 0;
                for (let d of discarded) {
                    const offX = ((this.cluecardwidth/3)*off)+'px';
                    const offY = ((this.cluecardheight/3)*off)+'px';
                    d.style['transform'] = 'translate('+offX+','+offY+')';
                    off++;
                }
            });
            discard.addEventListener('mouseout', () => {
                for (let d of discarded) {
                    d.style['transform'] = '';
                }
            });
        },

        /**
         * Add tooltip text to discard pile.
         * @param {int} num 
         */
        decorateDiscardPile: function(num) {
            if (num != 0) {
                let discardtxt = _("Click to view ${num} cards in Discard deck");
                discardtxt = discardtxt.replace('${num}', num);
                this.addTooltip('cluediscard', discardtxt, '');
            }
        },

        /**
         * Create a div with a discarded card and put it on top of discard deck.
         * @param {int} type 
         * @param {int} arg 
         * @return {int} number of cards now in discard deck
         */
        createDiscardCard: function(type, arg) {
            const discard_div = document.getElementById('cluediscard');
            const i = discard_div.childElementCount;
            const pos = CARD_TYPE_TO_POS[type][arg];
            const offset = (4*i)+"px";
            const xoff = (pos - (Math.floor(pos/6)*6)) * -this.cluecardwidth;
            const yoff = Math.floor(pos/6) * -this.cluecardheight;
            const discard = `<div id="discard_${i}" class="ltdr_cluecard ltdr_discard" style="position: absolute; margin: ${offset} 0 0 ${offset}; background-position: ${xoff}px ${yoff}px;;"></div>`;
            dojo.place(discard, 'cluediscard', i);
            return (i+1);
        },

        /**
         * Given id of collector tableau, set up the collector cards.
         * @param {string} collector_id
         * @param {array} collectorcards
         */
         setupCollectorDisplay: function(collector_id, collectorcards) {
            const collector_tableau = document.getElementById(collector_id);
            collector_tableau.style['display'] = 'initial';
            collector_tableau.style['top'] = '40px';
            this.collection = this.createCardStockRow(collector_id);
            // now add the ones actually on display
            for (const c in collectorcards) {
                const card = collectorcards[c];
                const id = CARD_TYPE_TO_POS[card.type][card.type_arg];
                this.collection.addToStockWithId(id, id, 'cluedisplay');
            }
        },

        /**
         * Create a Stock item with clue cards.
         * @param {string} id 
         * @returns Stock item
         */
        createCardStockRow: function(id) {
            var pile = new ebg.stock();
            pile.create(this, $(id), this.cluecardwidth, this.cluecardheight );
            pile.setSelectionMode(0);
            pile.image_items_per_row = 6;
            pile.onItemCreate = dojo.hitch(this, this.setUpClueCard);
            pile.autowidth = true;
            for (let i = 0; i < 3; i++) {
                for (let type of [RED+TIGER, BLUE+TIGER, RED+LADY, BLUE+LADY]) {
                    pile.addItemType( CARD_TYPE_TO_POS[type][i], 0, g_gamethemeurl+CARD_SPRITES, CARD_TYPE_TO_POS[type][i] );
                }
            }
            pile.addItemType( CARD_TYPE_TO_POS[REDBLUE][0], 0, g_gamethemeurl+CARD_SPRITES, CARD_TYPE_TO_POS[REDBLUE][0] );
            pile.addItemType( CARD_TYPE_TO_POS[LADYTIGER][0], 0, g_gamethemeurl+CARD_SPRITES, CARD_TYPE_TO_POS[LADYTIGER][0] );
            return pile;
        },

        /**
         * At start of new contest. Move cards in discard pile, clue display, and collectors tableau back to dek.
         * Animate 'dealing new cards.
         * @param {int} decksize 
         * @param {array} cluecards 
         * @param {id} oldcollector player_id of collector
         */
        refreshClueDisplay: function(decksize, cluecards, oldcollector) {
            // move cards from Discard pile to Deck
            const cluedeck = document.getElementById('cluedeck');
            const discard = document.getElementById('cluediscard');
            while (discard.lastChild) {
                this.slideToObject(discard.lastChild, cluedeck, 1000, 1000);
                discard.lastChild.remove();
            }
            this.addTooltip('cluediscard', '', '');

            const myrole = (this.isSpectator) ? COLLECTOR : (this.player_id == oldcollector) ? COLLECTOR : GUESSER;
            const tableau = (myrole == COLLECTOR) ? 'tableau_n' : 'tableau_s';
            const tab_div = document.getElementById(tableau);
            // move cards from Collector display to Deck
            while (tab_div.firstChild) {
                this.slideToObject(tab_div.firstChild, cluedeck, 1000, 1000);
                tab_div.firstChild.remove();
            }
            // clear Collector display
            this.collection.removeAll();

            // move cards from Clue display to Deck
            const cluedisplay = document.getElementById('cluedisplay');
            while (cluedisplay.firstChild) {
                this.slideToObject(cluedisplay.firstChild, cluedeck, 1000, 1000);
                cluedisplay.firstChild.remove();
            }
            this.cluedisplay.removeAll();

            this.setupClueDisplay(decksize, cluecards);
        },

         ///////////////////////////////////////////////////
        //// Utility methods

        /* @Override */
        format_string_recursive : function(log, args) {
            try {
                if (log && args && !args.processed) {
                    args.processed = true;
                    if (args.collector_name) {
                        args.collector_name = this.spanPlayerName(args.collector);
                    }
                    if (args.guesser_name) {
                        args.guesser_name = this.spanPlayerName(args.guesser);
                    }
                    if (args.scorer_name) {
                        args.scorer_name = this.spanPlayerName(args.scorer);
                    }
                    if (args.icon) {
                        args.icon = this.format_block('jstpl_icon', {trait: args.icon});
                    }
                    if (args.icon2) {
                        args.icon2 = this.format_block('jstpl_icon', {trait: args.icon2});
                    }
                    if (args.collector_identity) {
                        args.collector_identity = this.spanRedBlue(args.collector_identity, args.collector_id);
                    }
                    if (args.guesser_identity) {
                        args.guesser_identity = this.spanRedBlue(args.guesser_identity, args.guesser_id);
                    }
                    if (args.identity_name) {
                        args.identity_name = this.spanRedBlue(args.identity_name, args.identity);
                    }
                    if (args.card_type) {
                        const BLUE = 1;
                        const RED = 2;
                        const label = args.label;
                        if (['redlady', 'redtiger'].includes(label)) {
                            args.card_type = this.spanRedBlue(args.card_type, RED);
                        } else if (['bluelady', 'bluetiger'].includes(label)) {
                            args.card_type = this.spanRedBlue(args.card_type, BLUE);
                        } else if (label == 'redblue') {
                            args.card_type =
                            this.format_block('jstpl_color_text', {color: 'red', text: _("Red")})+
                            this.format_block('jstpl_color_text', {color: 'black', text: "+"})+
                            this.format_block('jstpl_color_text', {color: 'blue', text: _("Blue")});
                        } else {
                            args.card_type = this.spanRedBlue(args.card_type, 0);
                        }
                        log = log.replace('${label}', '');
                    }
                    if (!this.isSpectator) {
                        log = log.replace("You", this.spanYou());
                    }
                }
            } catch (e) {
                console.error(log, args, "Exception thrown", e.stack);
            }
            return this.inherited(arguments);
        },

        /**
         * Create span with Player's name in color.
         * @param {int} player 
         */
         spanPlayerName: function(player_id) {
            const player = this.gamedatas.players[player_id];
            const color_bg = player.color_back ?? "";
            const pname = "<span style=\"font-weight:bold;color:#" + player.color + ";" + color_bg + "\">" + player.name + "</span>";
            return pname;
        },

        /**
         * From BGA Cookbook. Return "You" in this player's color
         */
        spanYou: function() {
            const color = this.gamedatas.players[this.player_id].color;
            let color_bg = "";
            if (this.gamedatas.players[this.player_id] && this.gamedatas.players[this.player_id].color_back) {
                color_bg = "background-color:#" + this.gamedatas.players[this.player_id].color_back + ";";
            }
            const you = "<span style=\"font-weight:bold;color:#" + color + ";" + color_bg + "\">" + __("lang_mainsite", "You") + "</span>";
            return you;
        },

        /**
         * Put red or blue ids in red/blue span.
         * @param {string} text 
         * @param {int} id 
         * @returns formatted span
         */
        spanRedBlue: function(text, id) {
            if (id == 1 || id == 3) {
                //blue
                return this.format_block('jstpl_color_text', {color: 'blue', text: text});
            } else if (id == 2 || id == 4) {
                // red
                return this.format_block('jstpl_color_text', {color: 'red', text: text});
            } else {
                return this.format_block('jstpl_color_text', {color: 'black', text: text});
            }
        },

        /**
         * Get the identity according to a card's value.
         * @param {int} value 
         * @returns String identity value
         */
        getCardIdentity: function( value ) {
            if (value == DOOR) {
                return "door";
            } else if (value == BLUE+LADY) {
                return "bluelady";
            } else if (value == RED+LADY) {
                return "redlady";
            } else if (value == BLUE+TIGER) {
                return "bluetiger";
            } else if (value == RED+TIGER) {
                return "redtiger";
            }
            throw new Error("Invalid card identity: " + value);
        },

        /**
         * Get a label string for a role card.
         * @param {int} value 
         * @returns 
         */
        getLabelByValue: function( value ) {
            if (value == DOOR) {
                return _("Door");
            } else if (value == BLUE+LADY) {
                return _("Blue Lady");
            } else if (value == RED+LADY) {
                return _("Red Lady");
            } else if (value == BLUE+TIGER) {
                return _("Blue Tiger");
            } else if (value == RED+TIGER) {
                return _("Red Tiger");
            }
            throw new Error("Invalid card identity: " + value);
        },

        /**
         * Return a tuple of two arrays of types corresponding to types.
         * @param {int} value 
         * @returns two-member array
         */
        getAttributesByValue: function(value) {
            if (value == BLUE+LADY) {
                return [BLUE_TYPES, LADY_TYPES];
            } else if (value == RED+LADY) {
                return [RED_TYPES, LADY_TYPES];
            } else if (value == BLUE+TIGER) {
                return [BLUE_TYPES, TIGER_TYPES];
            } else if (value == RED+TIGER) {
                return [RED_TYPES, TIGER_TYPES];
            }
            throw new Error("Invalid card identity: " + value);
        },

        /**
         * Given a card id, get the name string.
         * @param {int} id 
         * @returns name of card
         */
        createTooltipHtml: function( id ) {
            if (id == 12) {
                return _("Door");
            } else if (id == 6) {
                return this.format_block('jstpl_card_tooltip_icon', {trait: 'ladytiger', color: 'black', text: _("Lady+Tiger")});
            } else if (id == 7) {
                return this.format_block('jstpl_color_lg_text', {color: 'red', text: _("Red")})+
                        this.format_block('jstpl_color_lg_text', {color: 'black', text: "+"})+
                        this.format_block('jstpl_color_lg_text', {color: 'blue', text: _("Blue")});
            } else if (CARD_TYPE_TO_POS[RED+TIGER].includes(id)) {
                return this.format_block('jstpl_card_tooltip_icon', {trait: 'redtiger', color: 'red', text: _("Red Tiger")});
            } else if (CARD_TYPE_TO_POS[BLUE+TIGER].includes(id)) {
                return this.format_block('jstpl_card_tooltip_icon', {trait: 'bluetiger', color: 'blue', text: _("Blue Tiger")});
            } else if (CARD_TYPE_TO_POS[RED+LADY].includes(id)) {
                return this.format_block('jstpl_card_tooltip_icon', {trait: 'redlady', color: 'red', text: _("Red Lady")});
            } else if (CARD_TYPE_TO_POS[BLUE+LADY].includes(id)) {
                return this.format_block('jstpl_card_tooltip_icon', {trait: 'bluelady', color: 'blue', text: _("Blue Lady")});
            }
            throw new Error("Unexpected card type: " + id);
        },

        /**
         * 
         * @param {string} card_div 
         * @param {string} card_type_id 
         * @param {string} card_id 
         */
        setUpClueCard: function( card_div, card_type_id, card_id ) {
            this.addTooltip(card_div.id, this.createTooltipHtml(parseInt(card_type_id)), '');
        },

        /**
         * Get HTML id of Collector's tableau
         */
        getCollectorTableau: function() {
            const collector = this.gamedatas.collector;
            const id = (this.isSpectator) ? 'tableau_n' : (this.player_id == collector) ? 'tableau_n' : 'tableau_s';
            return id;
        },

        /**
         * Reveal the role card behind a door.
         * @param {identity_n} int for bluelady|redlady|bluetiger|redtiger
         * @param {identity_s} int for bluelady|redlady|bluetiger|redtiger
         */
         revealDoorCard: function(identity_n, identity_s) {
            const lbl_s = this.getCardIdentity(identity_s);
            this.flipDoor('s', lbl_s);

            if (this.isSpectator) {
                const lbl_n = this.getCardIdentity(identity_n);
                this.flipDoor('n', lbl_n);
            }
        },

        /**
         * Flip the door over.
         * @param {string} dir n|s
         * @param {string} lbl identity
         */
        flipDoor: function(dir, lbl) {
            const cardback = document.getElementById('flip_'+dir);
            cardback.classList.add('ltdr_'+lbl);

            const door_inner = document.getElementById('inner_'+dir);
            door_inner.style['transform'] = 'rotateY(180deg)';
        },

        ///////////////////////////////////////////////////
        //// Event actions

        /**
         * onClueCardSelected:
         * Hooked to selection of a clue card.
         * @param {int} type 
         * @param {int} arg 
         */
         onClueCardSelected: function( type, arg ) {
            if (this.checkAction("collectCard", true)) {
                this.collectCard(type, arg);
            } else if (this.checkAction("discardCard", true)) {
                this.discardCard(type, arg);
            }
        },

        /**
         * For cluecards, hover and unhover effects.
         * @param {string} id 
         * @param {bool} hover 
         */
        onClueCardHover: function(id, hover) {
            if (this.checkAction("collectCard", true) || this.checkAction("discardCard", true)) {
                const thiscard = document.getElementById('cluedisplay_item_'+id);
                thiscard.style['transform'] = hover ? 'scale(1.05)' : '';
                thiscard.style['transition'] = 'transform 0.5s';
            }
        },

        guessRole: function() {
            this.guess_selection = null;
            this.guessDlg = new ebg.popindialog();
            this.guessDlg.create( 'guessDialog' );
            this.guessDlg.setTitle( _("Guess Collector's identity") );
            this.guessDlg.setMaxWidth( 720 );
            
            const html = '<div id="GuessDialogDiv" style="display: flex; flex-direction: column;">\
                            <div style="display: flex; flex-direction: row;">\
                                <div id="guess_redtiger" class="ltdr_trait ltdr_trait_redtiger"></div>\
                                <div id="guess_redlady" class="ltdr_trait ltdr_trait_redlady"></div>\
                                <div id="guess_red" class="ltdr_trait ltdr_trait_red"></div>\
                                <div id="guess_blue" class="ltdr_trait ltdr_trait_blue"></div>\
                            </div>\
                            <div style="display: flex; flex-direction: row;">\
                                <div id="guess_bluetiger" class="ltdr_trait ltdr_trait_bluetiger"></div>\
                                <div id="guess_bluelady" class="ltdr_trait ltdr_trait_bluelady"></div>\
                                <div id="guess_tiger" class="ltdr_trait ltdr_trait_tiger"></div>\
                                <div id="guess_lady" class="ltdr_trait ltdr_trait_lady"></div>\
                            </div>\
                            <div style="display: flex; flex-direction: row; justify-content: space-evenly;">\
                                <div id="guess_button" class="ltdr_guess_btn">'+_("(Select icon)")+'</div>\
                                <div id="guess_cancel_button" class="ltdr_guess_btn">'+_("Cancel")+'</div>\
                            </div>\
                        </div>';

            // Show the dialog
            this.guessDlg.setContent( html );
            this.guessDlg.show();
            this.guessDlg.hideCloseIcon();
            const guessDlgDiv = document.getElementById('GuessDialogDiv');
            guessDlgDiv.onclick = event => {
                this.onGuess(event);
            };
        },

        /**
         * When an element in the guess dialog is clicked
         * @param {Object} event 
         */
        onGuess: function(event) {
            const target = event.target;

            if (target.id == "guess_button") {
                if (this.guess_selection != null) {
                    this.guessDlg.destroy();
                    this.guessCollector(this.guess_selection);
                }
            } else if (target.id == "guess_cancel_button") {
                this.guess_selection = null;
                this.guessDlg.destroy();
            } else if (target.classList.contains("ltdr_trait")) {
                const traits = {
                    "redtiger" : _("Red Tiger"),
                    "bluetiger" : _("Blue Tiger"),
                    "redlady" : _("Red Lady"),
                    "bluelady" : _("Blue Lady"),
                    "red" : _("Red"),
                    "blue" : _("Blue"),
                    "tiger" : _("Tiger"),
                    "lady" : _("Lady"),
                }
    
                const traitid = target.id.substring("guess_".length);
                const trait = traits[traitid];
                var guess_txt = _("Guess ${identity}?");
                guess_txt = guess_txt.replace('${identity}', trait);
                document.getElementById('guess_button').innerHTML = guess_txt;
                this.guess_selection = traitid;
            }
        },

        /**
         * Check whether the cards in Collector's tableau match my role card.
         * @returns true if four or more matching a trait
         */
        matchSet: function() {
            const myrolecard = document.getElementById('role_n');
            var identity = 0;
            if (myrolecard.classList.contains("ltdr_bluetiger")) {
                identity = BLUE+TIGER;
            } else if (myrolecard.classList.contains("ltdr_redtiger")) {
                identity = RED+TIGER;
            } else if (myrolecard.classList.contains("ltdr_bluelady")) {
                identity = BLUE+LADY;
            } else if (myrolecard.classList.contains("ltdr_redlady")) {
                identity = RED+LADY;
            }
            const traits = this.getAttributesByValue(identity);
            if (this.collection.items.length >= 4) {
                for (let t of traits) {
                    var m = 0;
                    for (c of this.collection.items) {
                        if (t.includes(c.type)) {
                            m++;
                            if (m >= 4) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        },

        ///////////////////////////////////////////////////
        //// Ajax calls

        /**
         * Action to collect a card.
         * @param {int} type 
         * @param {int} arg 
         */
        collectCard: function(type, arg) {
            if (this.checkAction("collectCard", true)) {
                this.ajaxcall( "/ladyandthetiger/ladyandthetiger/collect.html", { 
                    card_type: type,
                    card_arg: arg,
                    lock: true 
                }, this, function( result ) {  }, function( is_error) { } );
            }
        },

        /**
         * Action to discard a card.
         * @param {int} type 
         * @param {int} arg 
         */
         discardCard: function(type, arg) {
            if (this.checkAction("discardCard", true)) {
                this.ajaxcall( "/ladyandthetiger/ladyandthetiger/discard.html", { 
                    card_type: type,
                    card_arg: arg,
                    lock: true 
                }, this, function( result ) {  }, function( is_error) { } );
            }
        },

        passTurn: function() {
            if (this.checkAction("pass", true)) {
                this.ajaxcall( "/ladyandthetiger/ladyandthetiger/pass.html", { 
                    lock: true 
                }, this, function( result ) {  }, function( is_error) { } );
            }
        },

        /**
         * Action to match a set.
         */
        scoreMatch: function() {
            if (this.checkAction("match", true)) {
                this.ajaxcall( "/ladyandthetiger/ladyandthetiger/match.html", { 
                    lock: true 
                }, this, function( result ) {  }, function( is_error) { } );
            }
        },

        /**
         * Action to guess Collector's Identity.
         * @param {string} traitid
         */
        guessCollector: function(traitid) {
            if (this.checkAction("guess", true)) {
                this.ajaxcall( "/ladyandthetiger/ladyandthetiger/guess.html", {
                    trait: traitid,
                    lock: true
                }, this, function( result ) {  }, function( is_error) { } );
            }
        },

        ///////////////////////////////////////////////////
        //// Game & client states
        
        /**
         * onEnteringState:
         * This method is called each time we are entering into a new game state.
         *  You can use this method to perform some user interface changes at this moment.
         */
        onEnteringState: function( stateName, args )
        {
            // console.log( 'Entering state: '+stateName );
            
            switch( stateName )
            {
                case 'assignRoles':
                    const door_south = document.getElementById('inner_s');
                    door_south.style['transform'] = '';
                    const cardback_s = document.getElementById('flip_s');
                    cardback_s.classList.remove(...IDENTITY_CLASSES);
                    if (this.isSpectator) {
                        const door_north = document.getElementById('inner_n');
                        door_north.style['transform'] = '';
                        const cardback_n = document.getElementById('flip_n');
                        cardback_n.classList.remove(...IDENTITY_CLASSES);
                    }
                break;
                case 'collectorAction':
                case 'guesserDiscard':
                    const sel = this.isCurrentPlayerActive() ? 1 : 0;
                    this.cluedisplay.setSelectionMode(sel);
                    break;
            case 'dummmy':
                break;
            }
        },

        /**
         * onLeavingState:
         * this method is called each time we are leaving a game state.
         */
        onLeavingState: function( stateName )
        {
            switch( stateName )
            {
                case 'collectorAction':
                case 'guesserDiscard':
                        this.cluedisplay.setSelectionMode(0);
                        break;
            }
            
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
                    case 'guesserDiscard':
                        this.addGuessMatchButtons();
                        break;
                    case 'guesserAction':
                        this.addGuessMatchButtons();
                        this.addActionButton('pass_btn', _("Pass"), 'passTurn');
                        break;
                }
            }
        },

        /**
         * Put the "Guess" and "Match Set" buttons in Guesser's title bar.
         */
        addGuessMatchButtons: function() {
            this.addActionButton('guess_btn', _("Guess"), 'guessRole');
            this.addActionButton('match_btn', _("Match Set"), 'scoreMatch');
            if (!this.matchSet()) {
                $('match_btn').classList.add("disabled");
            }
        },

        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your ladyandthetiger.game.php file.
        
        */
        setupNotifications: function()
        {
            // here, associate your game notifications with local methods
            dojo.subscribe( 'newContest', this, 'notif_newContest' );
            this.notifqueue.setSynchronous( 'newContest', 2000 );
            dojo.subscribe( 'newRole', this, 'notif_newRole' );
            dojo.subscribe( 'cardCollected', this, 'notif_cardCollected' );
            dojo.subscribe( 'cardDiscarded', this, 'notif_cardDiscarded' );
            dojo.subscribe( 'newClueCard', this, 'notif_newClue' );
            this.notifqueue.setSynchronous( 'newClueCard', 500 );
            dojo.subscribe( 'setCollected', this, 'notif_setCollected' );
            this.notifqueue.setSynchronous( 'setCollected', 1000 );
            dojo.subscribe( 'deckEmpty', this, 'notif_deckEmpty' );
            this.notifqueue.setSynchronous( 'deckEmpty', 1000 );
            dojo.subscribe( 'guessed', this, 'notif_guessed' );
            this.notifqueue.setSynchronous( 'guessed', 1000 );
            dojo.subscribe( 'guessedResult', this, 'notif_guessed' );
            dojo.subscribe( 'identitiesRevealed', this, 'notif_identitiesRevealed' );
            this.notifqueue.setSynchronous( 'identitiesRevealed', 3000 );
        },
        
        // game notification handling methods

        /**
         * Called when a player is a given a new identity card
         * @param {Object} notif 
         */
        notif_newRole: function( notif ) {
            const identity = parseInt(notif.args.identity);
            this.setupRoleCard(identity);
        },

        /**
         * Called when new contest starts.
         * @param {Object} notif 
         */
        notif_newContest: function( notif ) {
            const decksize = parseInt(notif.args.decksize);
            const cluecards = notif.args.cluecards;
            const collector = parseInt(notif.args.collector);
            const guesser = parseInt(notif.args.guesser);
            // passing guesser because right now display is still formerly guesser
            this.refreshClueDisplay(decksize, cluecards, guesser);
 
            this.setupPlayerTableaus(collector, guesser, []);
        },

        /**
         * Collector took a card, Move it from the clue display to the Collector's collection.
         * @param {Object} notif 
         */
        notif_cardCollected: function(notif) {
            const type = parseInt(notif.args.type);
            const arg = parseInt(notif.args.arg);
            const id = CARD_TYPE_TO_POS[type][arg];
            // stock to stock movement
            const wt = this.collection.count();
            this.collection.item_type[id].weight = wt;
            this.collection.addToStockWithId(id, id, 'cluedisplay_item_'+id);
            this.cluedisplay.removeFromStockById(id);
        },

        /**
         * Guesser discarded a card. Move it from the clue display to the discard pile.
         * @param {Object} notif 
         */
        notif_cardDiscarded: function(notif) {
            const type = parseInt(notif.args.type);
            const arg = parseInt(notif.args.arg);
            const id = CARD_TYPE_TO_POS[type][arg];
            // stock to non-stock movement
            this.cluedisplay.removeFromStockById(id, 'cluediscard');
            const dnum = this.createDiscardCard(type, arg);
            this.decorateDiscardPile(dnum);
        },

        /**
         * Card was discarded or collected from cluedisplay. Move new card from deck to display.
         * @param {Object} notif 
         */
        notif_newClue: function(notif) {
            const type = parseInt(notif.args.type);
            const arg = parseInt(notif.args.arg);
            const id = CARD_TYPE_TO_POS[type][arg];
            const size = parseInt(notif.args.decksize);

            // non-stock to stock movement
            const wt = this.cluedisplay.count();
            this.cluedisplay.item_type[id].weight = wt;
            this.cluedisplay.addToStockWithId(id, id, 'cluedeck');
            this.decorateClueCard(id, type, arg);

            const cluedeck = document.getElementById('cluedeck');
            if (size != 0) {
                cluedeck.removeChild(cluedeck.lastElementChild);
            }
            let cardsremain = _('Cards Remaining: ${decksize}');
            cardsremain = cardsremain.replace('${decksize}', size);
            document.getElementById('deckcount').innerHTML = cardsremain;
            this.addTooltip('cluedeck', cardsremain, '');
        },

        /**
         * Score for collecting a set.
         * @param {Object} notif 
         */
        notif_setCollected: function(notif) {
            const player_id = notif.args.player_id;
            this.scoreCtrl[ player_id ].incValue( parseInt(notif.args.score) );
        },

        /**
         * Reveal Door card.
         * @param {Object} notif 
         */
        notif_identitiesRevealed: function(notif) {
            const guesser_player_id = notif.args.guesser;
            const guesser_id = parseInt(notif.args.guesser_id);
            // const collector_player_id = parseInt(notif.args.collector);
            const collector_id = parseInt(notif.args.collector_id);
            // which is the Door (other) player?
            const south_id = (this.player_id == guesser_player_id) ? collector_id : guesser_id;
            const north_id = (this.player_id == guesser_player_id) ? guesser_id : collector_id;
            this.revealDoorCard(north_id, south_id);
        },

        /**
         * When the Guesser guessed
         * @param {Object} notif 
         */
         notif_guessed: function(notif) {
            const scorer_id = notif.args.scorer;
            const score = parseInt(notif.args.score);
            this.scoreCtrl[scorer_id].incValue(score);
        },

        /**
         * When deck is empty
         * @param {Object} notif 
         */
        notif_deckEmpty: function(notif) {
            const player_id = notif.args.player_id;
            this.scoreCtrl[ player_id ].incValue( parseInt(notif.args.score) );
        },

   });
});
