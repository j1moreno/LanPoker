var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});

module.exports = function(io) {
  //Socket.IO
  io.on("connection", function(socket) {
    // console.log(`${socket.id} connected`);
    // Dealer enters
    socket.on("dealerEnter", function() {
      console.log(`\t${socket.id} is the dealer`);
      io.emit("dealerHasEntered", true);
    });
    // Dealer deals
    socket.on("dealCards", function() {
      console.log(`\t${socket.id} has dealt cards`);
      io.emit("getCards", true);
    });
    // Dealer ends round
    socket.on("endRound", function() {
      console.log(`\t${socket.id} has ended the round`);
      io.emit("roundEnded", true);
    });
    socket.on("disconnect", function() {
      console.log(`\t${socket.id} disconnected`);
    });

    //End ON Events
  });
  return router;
};
