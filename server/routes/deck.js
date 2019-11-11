var express = require('express');
var router = express.Router();
const CardDeck = require('./CardDeck.js');

var myDeck;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('card deck main page');
});

router.get('/init', function(req, res, next) {
    // reset deck to make sure all cards are in it
    myDeck = new CardDeck();
    res.send(200);
});

router.get('/draw', function(req, res, next) {
    // if no number param given, draw only one card
    if (req.query.num === undefined) {
        res.send(myDeck.drawCard());
    } else {
        res.send(myDeck.drawCards(req.query.num))
    }
});

module.exports = router;