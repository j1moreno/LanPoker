import React, { useState, useEffect } from "react";
import Card from "./Card";
import "./Table.css";
// UI imports
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
// server imports
import axios from "axios";
import Cookies from "universal-cookie";
import openSocket from "socket.io-client";
// custom
import DealerState from "./lib/DealerState";
import GameState from "./lib/GameState";
import { Dialog } from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  dealerComponents: {
    margin: theme.spacing(2),
  },
  statusText: {
    display: "flex",
    flexDirection: "column",
  },
  cards: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "row",
  },
}));

const socket = openSocket("/");

const Table = () => {
  const [isStateRestored, setIsStateRestored] = useState(false);
  const [dealerState, setDealerState] = useState(new DealerState());
  const [roundNumber, setRoundNumber] = useState(1);
  const [gameState, setGameState] = useState(new GameState());
  const [isUserInGame, setIsUserInGame] = useState(true);
  const [isUserDealer, setIsUserDealer] = useState(true);

  const cookies = new Cookies();

  // this runs on page load and refresh
  useEffect(() => {
    // get game info to see where we are
    axios
      .get(`/session/info`)
      .then((res) => {
        const dealerExists = res.data.dealerExists;
        setGameState({
          sessionActive: res.data.sessionActive,
          dealerExists: res.data.dealerExists,
          numberOfUsers: res.data.numberOfUsers,
          roundNumber: res.data.currentGame.roundNumber,
        });
        // if a session is active, get player state
        if (res.data.sessionActive) {
          const playerId = cookies.get("username");
          axios.get(`/session/player-info?id=${playerId}`).then((res) => {
            console.log("player info from server:");
            console.log(res.data);
            // if user is in the game already, load their state
            if (res.data.state) {
              setDealerState(res.data.state);
              if (res.data.state.role === "dealer") {
                // if already coming in as dealer,
                // let everyone know dealer has arrived
                socket.emit("dealerEnter");
              } else {
                setIsUserDealer(false);
              }
            } else {
              console.log("you are not in the game yet");
              if (!dealerExists) {
                const updateData = {
                  id: playerId,
                  state: dealerState,
                };
                axios.post("/session/update-player-state", updateData);
                socket.emit("dealerEnter");
              } else {
                setIsUserDealer(false);
                setIsUserInGame(false);
                // alert("there is already a dealer in the game and it's not you");
              }
            }
          });
        }
      })
      .then((res) => {
        setIsStateRestored(true);
      });
  }, []);

  // effect will execute every time dealerState is updated
  useEffect(() => {
    // this flag should only be false on refresh; return here to avoid overwriting server data
    if (!isStateRestored) return;
    const updateData = {
      id: cookies.get("username"),
      state: dealerState,
    };
    axios.post("/session/update-player-state", updateData);
  }, [dealerState]);

  const dealCards = () => {
    if (!dealerState.playerCardsDealt) {
      // if player cards haven't been dealt yet, do that first
      socket.emit("dealCards");
      // update state
      setDealerState((dealerState) => ({
        ...dealerState,
        playerCardsDealt: true,
      }));
    } else if (dealerState.cards.length < 3) {
      // get flop cards from server
      axios.get("/deck/draw?num=3").then((res) => {
        // update state
        setDealerState((dealerState) => ({
          ...dealerState,
          cards: res.data,
        }));
      });
    } else if (dealerState.cards.length >= 3 && dealerState.cards.length < 5) {
      axios.get("/deck/draw").then((res) => {
        // update state
        var tempCards = dealerState.cards;
        tempCards.push(res.data);
        setDealerState((dealerState) => ({
          ...dealerState,
          cards: tempCards,
        }));
      });
    } else {
      // this is the end round case
      // re-init the deck for next round
      axios.get("/deck/init");
      axios.get("/session/clear-dealer-cards");
      setDealerState((dealerState) => ({
        ...dealerState,
        playerCardsDealt: false,
        cards: [],
      }));
      socket.emit("endRound");
      // increment round number
      axios
        .post("/session/round-increment", {})
        .then((res) => {
          console.log(res.body);
        })
        .then(() => {
          setGameState((gameState) => ({
            ...gameState,
            roundNumber: gameState.roundNumber + 1,
          }));
        });
    }
  };

  const classes = useStyles();

  const displayDealButton = () => {
    if (dealerState.cards.length === 5) {
      return "End Round";
    } else {
      return "Deal";
    }
  };

  const isDialogOpen = () => {
    return !gameState.sessionActive || !isUserDealer;
  };

  const getDialogText = () => {
    let message = `Your role is currently set to "player". Would you like to enter the game as dealer instead?`;
    if (!gameState.sessionActive) {
      message = `There is no game started yet. Would you like to start one and enter as dealer?`;
    } else if (gameState.dealerExists && !isUserDealer) {
      message = `There can only be one dealer per game. Would you like to reset the game and start a new session as dealer?`;
    }
    return message;
  };

  const getDialogHeader = () => {
    let message = `Role Change`;
    if (!gameState.sessionActive) {
      message = `No Active Game`;
    } else if (gameState.dealerExists && !isUserDealer) {
      message = `Dealer Already Exists`;
    }
    return message;
  };

  const getRedirectPath = () => {
    let path = "/";
    if (!gameState.dealerExists && !isUserDealer) {
      path = "hand";
    }
    return path;
  };

  const initDealer = () => {
    setDealerState((dealerState) => ({
      ...dealerState,
      role: "dealer",
    }));
    setGameState((gameState) => ({
      ...gameState,
      sessionActive: true,
    }));
    setIsUserInGame(true);
    setIsUserDealer(true);
    // let everyone know dealer has arrived
    socket.emit("dealerEnter");
  };

  const handleYes = () => {
    if (!gameState.sessionActive || !gameState.dealerExists) {
      // case 1: no game active and starting as dealer
      // case 2: active game, but no dealer yet
      initDealer();
    } else {
      // case 3: dealer already exists
      axios.get(`/session/reset`).then((res) => {
        initDealer();
      });
    }
  };

  return (
    <div className={classes.dealerComponents}>
      <Dialog
        open={isDialogOpen()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{getDialogHeader()}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {getDialogText()}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button component={Link} to={getRedirectPath()} color="primary">
            No
          </Button>
          <Button onClick={handleYes} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <div className={classes.statusText}>
        <Typography variant="h5">Dealer</Typography>
        <Typography variant="caption">
          Round: {gameState.roundNumber}
        </Typography>
        <Typography variant="caption">
          Player cards dealt: {dealerState.playerCardsDealt ? "Yes" : "No"}
        </Typography>
      </div>
      <Button
        onClick={dealCards}
        className={classes.button}
        variant="contained"
        color="primary"
      >
        {displayDealButton()}
      </Button>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        component={Link}
        to={"/"}
        onClick={() => {
          axios.get(`/session/reset`);
        }}
      >
        Leave Game
      </Button>
      <div className={classes.cards}>
        {dealerState.cards.map((card, index) => {
          return <Card key={index} cardInfo={card} faceUp={true} />;
        })}
      </div>
    </div>
  );
};

export default Table;
