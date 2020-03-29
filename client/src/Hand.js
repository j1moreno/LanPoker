import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Card from "./Card";
// UI imports:
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
// network imports:
import axios from "axios";
import Cookies from "universal-cookie";
import openSocket from "socket.io-client";
// custom
import PlayerState from "./lib/PlayerState";

const useStyles = makeStyles(theme => ({
  base: {
    margin: theme.spacing(3, 2, 2)
  },
  buttonRow: {
    margin: theme.spacing(0, 0, 2)
  },
  button: {
    marginRight: 8,
    marginTop: 5
  },
  bottomCard: {
    position: "relative",
    top: 0,
    left: 0
  },
  topCard: {
    position: "absolute",
    top: 100,
    left: 0
  }
}));

const Hand = () => {
  const socket = openSocket("/");

  const [isStateRestored, setIsStateRestored] = useState(false);
  // state to hold all relevant player data
  const [playerState, setPlayerState] = useState(new PlayerState());

  const cookies = new Cookies();
  let history = useHistory();

  useEffect(() => {
    // get player state, if it exists
    const playerId = cookies.get("username");
    axios.get(`/session/player-info?id=${playerId}`).then(res => {
      setIsStateRestored(true);
      if (res.data.state) {
        // if player state exists on server, load it to state
        setPlayerState(res.data.state);
      } else {
        // check if dealer exists and update state
        axios.get("/session/info").then(res => {
          // figure out whether there's a dealer, and set state
          setPlayerState(playerState => ({
            ...playerState,
            dealerExists: res.data.dealerExists
          }));
        });
      }
    });
  }, []);

  // effect will execute everytime playerState is updated
  useEffect(() => {
    // this flag should only be false on refresh; return here to avoid overwriting server data
    if (!isStateRestored) return;
    const updateData = {
      id: cookies.get("username"),
      state: playerState
    };
    axios.post("/session/update-player-state", updateData);
  }, [playerState]);

  // effect with cleanup for listeners
  useEffect(() => {
    socket.on("dealerHasEntered", value => {
      console.log("dealer has entered!");
      setPlayerState(playerState => ({
        ...playerState,
        dealerExists: value
      }));
    });
    socket.on("getCards", value => {
      console.log("dealer has dealt!");
      axios.get("/deck/draw?num=2").then(res => {
        // draw cards and update state
        setPlayerState(playerState => ({
          ...playerState,
          cardsDealt: value,
          cards: res.data
        }));
      });
    });
    socket.on("roundEnded", value => {
      console.log("round is over");
      setPlayerState(playerState => ({
        ...playerState,
        cardsDealt: false,
        cards: [],
        cardsFolded: false
      }));
    });

    // cleanup:
    return () => {
      socket.off("dealerHasEntered");
      socket.off("getCards");
      socket.off("roundEnded");
    };
  });

  function flipCards() {
    setPlayerState(playerState => ({
      ...playerState,
      cardsFaceUp: !playerState.cardsFaceUp
    }));
  }

  function foldRound() {
    setPlayerState(playerState => ({
      ...playerState,
      cardsFolded: true
    }));
  }

  function leaveGame() {
    var userData = {
      id: cookies.get("username")
    };
    axios.post("/session/remove-user", userData).then(res => {
      // redirect to home page
      history.push("/");
    });
  }

  const classes = useStyles();

  const displayContent = () => {
    if (!playerState.dealerExists) {
      return <div>Waiting for dealer</div>;
    } else if (!playerState.cardsDealt) {
      return <div>Waiting for cards...</div>;
    } else if (playerState.cardsFolded) {
      return <div>Folded, waiting for next round</div>;
    } else {
      return (
        <div className={classes.bottomCard}>
          <div>
            <Card
              cardInfo={playerState.cards[0]}
              faceUp={playerState.cardsFaceUp}
            />
          </div>
          <div className={classes.topCard}>
            <Card
              cardInfo={playerState.cards[1]}
              faceUp={playerState.cardsFaceUp}
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className={classes.base}>
      <Typography variant="h5">This is your hand:</Typography>
      <div className={classes.buttonRow}>
        <Button
          onClick={flipCards}
          className={classes.button}
          variant="contained"
          color="primary"
        >
          Flip Cards
        </Button>
        <Button
          onClick={foldRound}
          className={classes.button}
          variant="contained"
          color="primary"
        >
          Fold
        </Button>
        <Button
          onClick={leaveGame}
          className={classes.button}
          variant="contained"
          color="primary"
        >
          Leave Game
        </Button>
      </div>
      {displayContent()}
    </div>
  );
};

export default Hand;
