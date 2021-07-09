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

const CARD_SPRITES = 'img/card_sprites.jpg';


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
         * This player's role card.
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

        setupClueDisplay: function() {
            const decksize = parseInt(this.gamedatas.decksize);
            for (let i = 0; i < decksize; i++) {
                const offset = 5+(2*i)+"px";
                const cardback = `<div class="ltdr_cluecard ltdr_cardback" style="position: absolute; margin: ${offset};"></div>`;
                dojo.place(cardback, 'cluedeck', i);
            }
            var cluecards = new ebg.stock();
            cluecards.create(this, $('cluedisplay'), this.cluecardwidth, this.cluecardheight );
            cluecards.setSelectionMode(1);
            cluecards.image_items_per_row = 3;
            // cluecards.onItemCreate = dojo.hitch(this, this.setUpClueCard);
            // cluecards.autowidth = true;
            for (let i = 1; i <= 3; i++) {
                const redtiger = this.getUniqueTypeForCard(RED+TIGER, i)
                cluecards.addItemType( redtiger, 0, g_gamethemeurl+CARD_SPRITES, redtiger );
                const bluetiger = this.getUniqueTypeForCard(BLUE+TIGER, i)
                cluecards.addItemType( bluetiger, 0, g_gamethemeurl+CARD_SPRITES, bluetiger );
                const redlady = this.getUniqueTypeForCard(RED+LADY, i)
                cluecards.addItemType( redlady, 0, g_gamethemeurl+CARD_SPRITES, redlady );
                const bluelady = this.getUniqueTypeForCard(BLUE+LADY, i)
                cluecards.addItemType( bluelady, 0, g_gamethemeurl+CARD_SPRITES, bluelady );
            }
            const redblue = this.getUniqueTypeForCard(REDBLUE);
            cluecards.addItemType( redblue, 0, g_gamethemeurl+CARD_SPRITES, redblue );
            const ladytiger = this.getUniqueTypeForCard(LADYTIGER);
            cluecards.addItemType( ladytiger, 0, g_gamethemeurl+CARD_SPRITES, ladytiger );
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
         * Get the unique card (from sprites array) corresponding to identity and arg
         * @param {int} identity
         * @param {int} arg (optional)
         * @returns 
         */
        getUniqueTypeForCard: function(identity, arg) {
            var r = null;
            var c = null;
            if (identity == DOOR) {
                r = 3;
                c = 1;
            } else if (identity == REDBLUE) {
                r = 2;
                c = 2;
            } else if (identity == LADYTIGER) {
                r = 2;
                c = 1;
            } else if (identity == RED+LADY) {
                switch (arg) {
                    case 1:
                        r = 1;
                        c = 5;
                        break;
                    case 2:
                        r = 2;
                        c = 3;
                        break;
                    case 3:
                        r = 2;
                        c = 4;
                        break;
                }
            } else if (identity == RED+TIGER) {
                switch (arg) {
                    case 1:
                        r = 1;
                        c = 6;
                        break;
                    case 2:
                        r = 2;
                        c = 5;
                        break;
                    case 3:
                        r = 2;
                        c = 6;
                        break;
                }
            } else if (identity == BLUE+LADY) {
                switch (arg) {
                    case 1:
                        r = 1;
                        c = 1;
                        break;
                    case 2:
                        r = 3;
                        c = 2;
                        break;
                    case 3:
                        r = 3;
                        c = 3;
                        break;
                }
            } else if (identity == BLUE+TIGER) {
                r = 1;
                switch (arg) {
                    case 1:
                        c = 2;
                        break;
                    case 2:
                        c = 3;
                        break;
                    case 3:
                        c = 4;
                        break;
                }
            }

            return ((r-1)*6) + (c-1);
        },

        /**
         * setupRoleCard:
         * Assign a tooltip to role cards.
         */
        setupRoleCard: function( card_div, card_type_id, card_id ) {
            //console.log(card_div);
            //console.log(card_type_id);
            //console.log(card_id);
            cardrole = this.getCardIdentity(parseInt(card_type_id));
            // Role cards get help text, clue cards get action text
            if (card_div.id.includes("myhand")) {
               this.addTooltip(card_div.id, _("You are the " + cardrole) + " dude", '');
            } else {
               this.addTooltip(card_div.id, '', "Add a " + cardrole + " to your collection");
            }
       },
        
        ///////////////////////////////////////////////////
        //// Game & client states
        
        /**
         * onClueCardSelected:
         * hooked to selection of a clue card.
         */
        onClueCardSelected: function( control_name ) {
           console.log("selected from " + control_name); 
        },
        
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
