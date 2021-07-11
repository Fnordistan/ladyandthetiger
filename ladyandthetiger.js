/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * LadyAndTheTiger implementation : © <Your name here> <Your email address here>
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
            console.log('ladyandthetiger constructor');
              
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
            console.log( "Starting game setup" );

            this.setupPlayerTableaus();

            this.setupClueDisplay();

            this.setupNotifications();

            console.log( "Ending game setup" );
        },

        /**
         * Set up Collector and Guesser boards and Role cards.
         * Make both Doors for Spectator.
         */
         setupPlayerTableaus: function() {
            const collector = this.gamedatas.collector;
            const guesser = this.gamedatas.guesser;
            const collectorColor = this.gamedatas.players[collector]['color'];
            const guesserColor = this.gamedatas.players[guesser]['color'];

            // north is the collector by default
            const myrole = (this.isSpectator) ? 'Collector' : (this.player_id == collector) ? 'Collector' : 'Guesser';
            const mycolor = (myrole == 'Collector') ? collectorColor : guesserColor;
            const hisrole = (myrole == 'Collector') ? 'Guesser' : 'Collector';
            const hiscolor = (hisrole == 'Collector') ? collectorColor : guesserColor;

            const role_n = document.getElementById('rolename_n');
            role_n.innerHTML = myrole;
            role_n.style['color'] = '#'+mycolor;

            const role_s = document.getElementById('rolename_s');
            role_s.innerHTML = hisrole;
            role_s.style['color'] = '#'+hiscolor;

            const myrolecard = document.getElementById('role_n');
            if (!this.isSpectator) {
                const identity = this.gamedatas.identity;
                const myidentity = this.getCardIdentity(identity);
                myrolecard.classList.add('ltdr_'+myidentity);
            } else {
                myrolecard.classList.add('ltdr_door');
            }

            const hisrolecard = document.getElementById('role_s');
            hisrolecard.classList.add('ltdr_door');

            const guesser_t = (myrole == 'Guesser') ? 'tableau_n' : 'tableau_s';
            const guesser_tableau = document.getElementById(guesser_t);
            guesser_tableau.style['display'] = 'none';

            const guesser_d = (myrole == 'Guesser') ? 'pnorth' : 'psouth';
            const guesser_display = document.getElementById(guesser_d);
            guesser_display.style['width'] = 'fit-content';

            const collector_t = (myrole == 'Collector') ? 'tableau_n' : 'tableau_s';
            this.setupCollectorDisplay(collector_t);
        },

        /**
         * Set up the clue display.
         */
        setupClueDisplay: function() {
            const decksize = parseInt(this.gamedatas.decksize);
            for (let i = 0; i < decksize; i++) {
                const offset = 5+(2*i)+"px";
                const cardback = `<div class="ltdr_cluecard ltdr_cardback" style="position: absolute; margin: ${offset} 0 0 ${offset};"></div>`;
                dojo.place(cardback, 'cluedeck', i);
            }

            const sel = this.isCurrentPlayerActive() ? 1 : 0;
            this.cluedisplay = this.createClueStock('cluedisplay', sel);
            // now add the ones actually on display
            const cluecards = this.gamedatas.cluecards;

            for (const c in cluecards) {
                const card = cluecards[c];
                const pos = CARD_TYPE_TO_POS[card.type][card.type_arg];
                this.cluedisplay.addToStockWithId(pos, pos);
                $('cluedisplay_item_'+pos).addEventListener('click', () => {
                    this.onClueCardSelected(card.type, card.type_arg);
                });
            }
        },

        /**
         * Given id of collector tableau, set up the collector cards.
         * @param {string} collector_id
         */
         setupCollectorDisplay: function(collector_id) {
            this.collection = this.createClueStock(collector_id, 0);

            // now add the ones actually on display
            const collectorcards = this.gamedatas.collectorcards;
            for (const c in collectorcards) {
                const card = collectorcards[c];
                const pos = CARD_TYPE_TO_POS[card.type][card.type_arg];
                this.collection.addToStockWithId(pos, pos);
            }
        },

        /**
         * Create a Stock item with clue cards.
         * @param {string} id 
         * @param {int} sel 
         * @returns Stock item
         */
        createClueStock: function(id, sel) {
            var pile = new ebg.stock();
            pile.create(this, $(id), this.cluecardwidth, this.cluecardheight );
            pile.setSelectionMode(sel);
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


        ///////////////////////////////////////////////////
        //// Utility methods

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
         * Given a card id, get the name string.
         * @param {int} id 
         * @returns name of card
         */
        getLabelById: function( id ) {
            if (id == 12) {
                return "Door";
            } else if (id == 6) {
                return "Lady+Tiger";
            } else if (id == 7) {
                return "Red+Blue";
            } else if (CARD_TYPE_TO_POS[RED+TIGER].includes(id)) {
                return "Red Tiger";
            } else if (CARD_TYPE_TO_POS[BLUE+TIGER].includes(id)) {
                return "Blue Tiger";
            } else if (CARD_TYPE_TO_POS[RED+LADY].includes(id)) {
                return "Red Lady";
            } else if (CARD_TYPE_TO_POS[BLUE+LADY].includes(id)) {
                return "Blue Lady";
            }
            throw new Error("Unexpected card type: " + id);
        },

        /**
         * setupRoleCard:
         * Assign a tooltip to role cards.
         */
        setupRoleCard: function( card_div, card_type_id, card_id ) {
            cardrole = this.getCardIdentity(parseInt(card_type_id));
            // Role cards get help text, clue cards get action text
            if (card_div.id.includes("myhand")) {
               this.addTooltip(card_div.id, _("You are the " + cardrole) + " dude", '');
            } else {
               this.addTooltip(card_div.id, '', "Add a " + cardrole + " to your collection");
            }
        },

        setUpClueCard: function( card_div, card_type_id, card_id ) {
            this.addTooltip(card_div.id, '', this.getLabelById(parseInt(card_type_id)));
        },

        /**
         * Get HTML id of Collector's tableau
         */
        getCollectorTableau: function() {
            const collector = this.gamedatas.collector;
            const id = (this.isSpectator) ? 'tableau_n' : (this.player_id == collector) ? 'tableau_n' : 'tableau_s';
            return id;
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
            console.log('discarding card');
            if (this.checkAction("discardCard", true)) {
                this.ajaxcall( "/ladyandthetiger/ladyandthetiger/discard.html", { 
                    card_type: type,
                    card_arg: arg,
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
            console.log( 'Entering state: '+stateName );
            
            switch( stateName )
            {
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
            console.log( 'Leaving state: '+stateName );
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
            console.log( 'onUpdateActionButtons: '+stateName );
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
/*               
                 Example:
 
                 case 'myGameState':
                    
                    // Add 3 action buttons in the action status bar:
                    
                    this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' ); 
                    this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' ); 
                    this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' ); 
                    break;
*/
                }
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
            console.log( 'notifications subscriptions setup' );
            // here, associate your game notifications with local methods
            dojo.subscribe( 'newRole', this, 'notif_newRole' );
            dojo.subscribe( 'cardCollected', this, 'notif_cardCollected' );
            dojo.subscribe( 'cardDiscarded', this, 'notif_cardDiscarded' );
            dojo.subscribe( 'newClueCard', this, 'notif_newClue' );
            dojo.subscribe( 'setCollected', this, 'notif_setCollected' );
        },  
        
        // game notification handling methods

        /**
         * Called when a player is a given a new Door (role) card
         */
        notif_newRole: function( notif ) {
        },

        /**
         * 
         * @param {Object} notif 
         */
        notif_cardCollected: function(notif) {
            const type = parseInt(notif.args.type);
            const arg = parseInt(notif.args.arg);
            const id = CARD_TYPE_TO_POS[type][arg];

            this.cluedisplay.removeFromStockById(id, this.getCollectorTableau());
            this.collection.addToStockWithId(id, id, 'cluedisplay');
        },

        notif_cardDiscarded: function(notif) {
            const type = parseInt(notif.args.type);
            const arg = parseInt(notif.args.arg);
            const id = CARD_TYPE_TO_POS[type][arg];
            this.cluedisplay.removeFromStockById(id, cluediscard);
        },

        notif_newClue: function(notif) {
            const type = parseInt(notif.args.type);
            const arg = parseInt(notif.args.arg);
            const id = CARD_TYPE_TO_POS[type][arg];
            const size = parseInt(notif.args.decksize);
            this.cluedisplay.addToStockWithId(id, id, 'cluedeck');

            $('cluedisplay_item_'+id).addEventListener('click', () => {
                this.onClueCardSelected(type, arg);
            });

            if (size != 0) {
                const cluedeck = document.getElementById('cluedeck');
                cluedeck.removeChild(cluedeck.lastElementChild);
            }
        },

        notif_setCollected: function(notif) {

        },
        
   });             
});
