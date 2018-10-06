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
            this.cardwidth = 229;
            this.cardheight = 400;
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
            
            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                var player = gamedatas.players[player_id];
            }
            
            // Player hand
            this.playerHand = new ebg.stock();
            this.playerHand.create( this, $('myhand'), this.cardwidth, this.cardheight );
            // can't select your role card
            this.playerHand.setSelectionMode(0);
            this.playerHand.image_items_per_row = 7;
				this.playerHand.onItemCreate = dojo.hitch( this, 'setupNewCard' );
            // add the role cards
            for (var i = 1; i <= 4; i++) {
              this.playerHand.addItemType( i, i, g_gamethemeurl+'img/door_cards.png', i );
            }
            // the clue cards tableau
            this.clueCards = new ebg.stock();
            this.clueCards.create(this, $('cluecards'), this.cardwidth, this.cardheight);
            this.clueCards.setSelectionMode(1);
            this.clueCards.image_items_per_row = 7;
				this.clueCards.onItemCreate = dojo.hitch( this, 'setupNewCard' );
            dojo.connect( this.clueCards, 'onChangeSelection', this, 'onClueCardSelected' );
            // add the clue cards
            for (var j = 1; j <= 6; j++) {
               this.clueCards.addItemType(j, j, g_gamethemeurl+'img/door_cards.png', j );
            }

            for (var c in this.gamedatas.hand) {
                var door = this.gamedatas.hand[c];
                this.playerHand.addToStockWithId( door.type_arg, door.id );
            }
            
            // this is what actually puts the cards in the center display
            for (var cc in this.gamedatas.cardsontable) {
               var ccard = this.gamedatas.cardsontable[cc];
               this.clueCards.addToStockWithId(ccard.type_arg, ccard.id);
            }

            //// Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },

        ///////////////////////////////////////////////////
        //// Utility methods
       
        /**
         * getRoleForCard:
         * Get the role according to a card's value.
        */
        getRoleForCard: function( value ) {
            switch(value) {
                case DOOR:
                    return "Door";
                case BLUE+LADY:
                    return "Blue Lady";
                case RED+LADY:
                    return "Red Lady";
                case BLUE+TIGER:
                    return "Blue Tiger";
                case RED+TIGER:
                    return "Red Tiger";
                case REDBLUE:
                    return "Red/Blue";
                case LADYTIGER:
                    return "Lady/Tiger";
            }
        },

        /**
         * setupNewCard:
         * Assign a tooltip to role cards.
         */
        setupNewCard: function( card_div, card_type_id, card_id ) {
            //console.log(card_div);
            //console.log(card_type_id);
            //console.log(card_id);
            cardrole = this.getRoleForCard(parseInt(card_type_id));
            // Role cards get help text, clue cards get action text
            if (card_div.id.includes("myhand")) {
               this.addTooltip(card_div.id, _("You are the " + cardrole), '');
            } else {
               this.addTooltip(card_div.id, '', "Add a " + cardrole + " to your collection");
            }
       //// Add some custom HTML content INSIDE the Stock item:
       //dojo.place( this.format_block( 'jstpl_my_card_content', {
       //                         ....
       //                    } ), card_div.id );
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
