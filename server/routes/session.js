var express = require("express");
var router = express.Router();

class SessionManager {
  constructor() {
    this.users = [];
    this.dealerExists = false;
    this.currentGame = {
      dealerCards: []
    };
  }

  addDealerCards(cardData) {
    if (this.currentGame.dealerCards.length === 0) {
      this.currentGame.dealerCards = cardData;
    } else {
      this.currentGame.dealerCards.push(cardData);
    }
  }

  clearDealerCards() {
    this.currentGame.dealerCards = [];
  }

  getIndexByPlayerId(playerId) {
    // this should get overwritten once array is iterated over
    var result = -1;
    for (var i = 0; i < this.users.length; i++) {
      if (this.users[i].id === playerId) {
        result = i;
        break;
      }
    }

    return result;
  }

  addPlayerCards(cardData, playerId) {
    const playerIndex = this.getIndexByPlayerId(playerId);
    // once desired element is found, update its data
    this.users[playerIndex] = { ...this.users[playerIndex], ...cardData };
  }

  clearPlayerCards(playerId) {
    const playerIndex = this.getIndexByPlayerId(playerId);
    this.users[playerIndex].cards = [];
  }

  getPlayerInfo(playerId) {
    const playerIndex = this.getIndexByPlayerId(playerId);
    return this.users[playerIndex];
  }

  sessionActive() {
    return this.users.length > 0;
  }

  getUsers() {
    return this.users;
  }

  addUser(userData) {
    var id = userData.id;
    for (var index = 0; index < this.users.length; index++) {
      if (this.users[index].id === id) {
        console.log("user already exists");
        return;
      }
    }
    // if we got here, user was not found, so add
    this.users.push(userData);
  }

  removeUser(userData) {
    var id = userData.id;
    for (var index = 0; index < this.users.length; index++) {
      if (this.users[index].id === id) {
        if (this.users[index].role === "dealer") {
          // if dealer is leaving session, update state
          this.dealerExists = false;
        }
        this.users.splice(index, 1);
        return;
      }
    }
    // if we got here, user was not found, so add
    this.users.push(userData);
  }

  updatePlayerState(playerId, updateData) {
    // first figure out index for id
    const playerIndex = this.getIndexByPlayerId(playerId);
    // if updateData is for dealer, update flag
    if (updateData.role === "dealer") this.dealerExists = true;
    // once desired element is found, update its data
    this.users[playerIndex].state = updateData;
  }

  updateUserData(updateData) {
    // first figure out id we are looking for
    var id = updateData.id;
    for (var index = 0; index < this.users.length; index++) {
      if (this.users[index].id === id) {
        console.log("element found at index " + index);
        if (updateData.role === "dealer") {
          // check if role is being set to dealer
          this.dealerExists = true;
        } else if (
          updateData.role === "player" &&
          this.users[index].role === "dealer"
        ) {
          // if dealer is being reassigned to player, update state
          this.dealerExists = false;
        }
        // once desired element is found, update its data
        this.users[index] = { ...this.users[index], ...updateData };
        break;
      }
    }
  }
}

var sessionManager = new SessionManager();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.send("this is the main session page");
});

router.get("/info", function(req, res, next) {
  var sessionInfo = {
    sessionActive: sessionManager.sessionActive(),
    numberOfUsers: sessionManager.getUsers().length,
    dealerExists: sessionManager.dealerExists,
    currentGame: sessionManager.currentGame,
    // @todo: remove this after development, no need to send user data
    users: sessionManager.getUsers()
  };
  res.send(sessionInfo);
});

router.get("/player-info", function(req, res, next) {
  const playerInfo = sessionManager.getPlayerInfo(req.query.id);
  res.send(playerInfo);
});

router.get("/reset", function(req, res, next) {
  sessionManager.users = [];
  sessionManager.currentGame = {};
  res.sendStatus("OK");
});

router.post("/adduser", function(req, res, next) {
  console.log("adduser: got post request! Data: " + req.body);
  sessionManager.addUser(req.body);
  res.sendStatus("OK");
});

router.post("/add-dealer-cards", function(req, res, next) {
  console.log("add-dealer-cards; got post request, data: " + req.body);
  sessionManager.addDealerCards(req.body);
  res.sendStatus("OK");
});

router.get("/clear-dealer-cards", function(req, res, next) {
  console.log("got request to remove dealer cards");
  sessionManager.clearDealerCards();
  res.sendStatus("OK");
});

router.post("/add-player-cards", function(req, res, next) {
  console.log("add-dealer-cards; got post request, data: " + req.body);
  sessionManager.addPlayerCards(req.body.cardData, req.body.id);
  res.sendStatus("OK");
});

router.post("/update-player-state", function(req, res, next) {
  console.log("update-player-state; got post request, data: " + req.body);
  sessionManager.updatePlayerState(req.body.id, req.body.state);
  res.sendStatus("OK");
});

router.post("/clear-player-cards", function(req, res, next) {
  console.log("got request to remove dealer cards");
  sessionManager.clearPlayerCards(req.body.id);
  res.sendStatus("OK");
});

router.post("/remove-user", function(req, res, next) {
  console.log("remove-user: got post request! Data: " + req.body);
  sessionManager.removeUser(req.body);
  res.sendStatus("OK");
});

router.post("/set-user-role", function(req, res, next) {
  console.log("set-user-role: got post request! Data: " + req.body);
  sessionManager.updateUserData(req.body);
  res.sendStatus("OK");
});

module.exports = router;
