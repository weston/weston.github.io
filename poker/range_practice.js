function run() {
    Hand.from_hand_class_string("JJ")
}

var SUITS = ["c", "d", "h", "s"]

var RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"]

class Hand {
    constructor(card_string1, card_string2) {
        this.card1 = card_string1
        this.card2 = card_string2
    }

    static from_hand_class_string(hand_class_string) {
        hands = []
        if (hand_class_string.length == 2) {
            rank = hand_class_string[0]
            for (var i = 0; i < SUITS.length; i++) {
                for (var k = i + 1; k < SUITS.length; k++) {

                }
            }
        }
        return hands
    }
}


class Range {
    constructor(definition_string){


    }

    choices = function() {

    }

    contains = function(hand) {

    }

}


