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

const useStyles = makeStyles(theme => ({
  button: {
    marginTop: theme.spacing(2)
  },
  dealerComponents: {
    margin: theme.spacing(2)
  },
  statusText: {
    display: "flex",
    flexDirection: "column"
  },
  cards: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "row"
  }
}));

const Table = () => {
  const socket = openSocket("/");

  const [isStateRestored, setIsStateRestored] = useState(false);
  const [dealerState, setDealerState] = useState(new DealerState());
  const [roundNumber, setRoundNumber] = useState(1);

  const cookies = new Cookies();

  // this runs on page load and refresh
  useEffect(() => {
    // get state, if it exists
    const playerId = cookies.get("username");
    axios.get(`/session/player-info?id=${playerId}`).then(res => {
      setIsStateRestored(true);
      if (res.data.state) {
        // if state exists on server, load it to state
        setDealerState(res.data.state);
        axios.get("/session/round-number").then(res => {
          setRoundNumber(res.data.roundNumber);
        });
      } else {
        // this a new page load
        // init deck to prepare for play
        axios.get("/deck/init");
        // let everyone know dealer has arrived
        socket.emit("dealerEnter");
        // upload initial dealer state to server
        const updateData = {
          id: cookies.get("username"),
          state: dealerState
        };
        axios.post("/session/update-player-state", updateData);
      }
    });
  }, []);

  // effect will execute every time dealerState is updated
  useEffect(() => {
    // this flag should only be false on refresh; return here to avoid overwriting server data
    if (!isStateRestored) return;
    const updateData = {
      id: cookies.get("username"),
      state: dealerState
    };
    axios.post("/session/update-player-state", updateData);
  }, [dealerState]);

  const dealCards = () => {
    if (!dealerState.playerCardsDealt) {
      // if player cards haven't been dealt yet, do that first
      socket.emit("dealCards");
      // update state
      setDealerState(dealerState => ({
        ...dealerState,
        playerCardsDealt: true
      }));
    } else if (dealerState.cards.length < 3) {
      // get flop cards from server
      axios.get("/deck/draw?num=3").then(res => {
        // update state
        setDealerState(dealerState => ({
          ...dealerState,
          cards: res.data
        }));
      });
    } else if (dealerState.cards.length >= 3 && dealerState.cards.length < 5) {
      axios.get("/deck/draw").then(res => {
        // update state
        var tempCards = dealerState.cards;
        tempCards.push(res.data);
        setDealerState(dealerState => ({
          ...dealerState,
          cards: tempCards
        }));
      });
    } else {
      // this is the end round case
      // re-init the deck for next round
      axios.get("/deck/init");
      axios.get("/session/clear-dealer-cards");
      setDealerState(dealerState => ({
        ...dealerState,
        playerCardsDealt: false,
        cards: []
      }));
      socket.emit("endRound");
      // increment round number
      axios
        .post("/session/round-increment", {})
        .then(res => {
          console.log(res.body);
        })
        .then(() => {
          setRoundNumber(roundNumber + 1);
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

  return (
    <div className={classes.dealerComponents}>
      <div className={classes.statusText}>
        <Typography variant="h5">Dealer</Typography>
        <Typography variant="caption">Round: {roundNumber}</Typography>
        <Typography variant="caption">Players: 3</Typography>
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
      <div className={classes.cards}>
        {dealerState.cards.map((card, index) => {
          return <Card key={index} cardInfo={card} faceUp={true} />;
        })}
      </div>
    </div>
  );
};

export default Table;
