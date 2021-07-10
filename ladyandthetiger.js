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

            this.setupRoleCards();

            this.setupClueDisplay();
            //// Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },

        /**
         * Set up Collector and Guesser boards and Role cards.
         * Make both Doors for Spectator.
         */
         setupRoleCards: function() {
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
            var cluedeck = new ebg.stock();
            cluedeck.create(this, $('cluedisplay'), this.cluecardwidth, this.cluecardheight );
            const sel = this.isCurrentPlayerActive() ? 1 : 0;
            cluedeck.setSelectionMode(sel);
            cluedeck.image_items_per_row = 6;
            cluedeck.onItemCreate = dojo.hitch(this, this.setUpClueCard);
            cluedeck.autowidth = true;
            for (let i = 0; i < 3; i++) {
                cluedeck.addItemType( CARD_TYPE_TO_POS[RED+TIGER][i], 0, g_gamethemeurl+CARD_SPRITES, CARD_TYPE_TO_POS[RED+TIGER][i] );
                cluedeck.addItemType( CARD_TYPE_TO_POS[BLUE+TIGER][i], 0, g_gamethemeurl+CARD_SPRITES, CARD_TYPE_TO_POS[BLUE+TIGER][i] );
                cluedeck.addItemType( CARD_TYPE_TO_POS[RED+LADY][i], 0, g_gamethemeurl+CARD_SPRITES, CARD_TYPE_TO_POS[RED+LADY][i] );
                cluedeck.addItemType( CARD_TYPE_TO_POS[BLUE+LADY][i], 0, g_gamethemeurl+CARD_SPRITES, CARD_TYPE_TO_POS[BLUE+LADY][i] );
            }
            cluedeck.addItemType( CARD_TYPE_TO_POS[REDBLUE][0], 0, g_gamethemeurl+CARD_SPRITES, CARD_TYPE_TO_POS[REDBLUE][0] );
            cluedeck.addItemType( CARD_TYPE_TO_POS[LADYTIGER][0], 0, g_gamethemeurl+CARD_SPRITES, CARD_TYPE_TO_POS[LADYTIGER][0] );
            // now add the ones actually on display
            const cluecards = this.gamedatas.cluecards;

            for (const c in cluecards) {
                const card = cluecards[c];
                const pos = CARD_TYPE_TO_POS[card.type][card.type_arg];
                cluedeck.addToStockWithId(pos, pos);
                if (this.isCurrentPlayerActive()) {
                    $('cluedisplay_item_'+pos).addEventListener('click', () => {
                        this.onClueCardSelected(card.type, card.type_arg);
                    });
                }
            }
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
                console.log("Discard "+ this.getLabelById(id));
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
            
            /* Example:
            
            case 'myGameState':
            
                // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );
                
                break;
           */
           
           
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
            
            /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */
           
            case 'dummmy':
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
        },  
        
        // game notification handling methods

        /**
         * Called when a player is a given a new Door (role) card
         */
        notif_newRole: function( notif ) {
            console.log("notifying of new role");
            this.playerHand.removeAll();
            // should only ever be one Role card given!
            if (notif.args.cards.length != 1) {
                throw new BgaVisibleSystemException ( "received wrong number of Door cards (should be 1, received "+notif.args.cards.length+")"); 
           }
           var card = notif.args.cards[0];
            var type = card.type;
            var cardrole = card.type_arg;
            this.playerHand.addToStockWithId( this.getCardUniqueId( type, cardrole ), card.id );
            throw new BgaVisibleSystemException ( "My door card is " + type + " => " + cardrole); 
        },
        
   });             
});
