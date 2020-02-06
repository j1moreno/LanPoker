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
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  button: {
    margin: theme.spacing(3, 0, 2)
  }
}));

const Table = () => {
  const socket = openSocket("/");

  const [isStateRestored, setIsStateRestored] = useState(false);
  const [dealerState, setDealerState] = useState(new DealerState());

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
    <div className={classes.paper}>
      <Typography variant="h5">This is a table:</Typography>
      {dealerState.playerCardsDealt && (
        <Typography varint="h3">Player cards dealt</Typography>
      )}
      <div className="Table-cards">
        {dealerState.cards.map((card, index) => {
          return <Card key={index} cardInfo={card} faceUp={true} />;
        })}
      </div>
      <Button
        onClick={dealCards}
        className={classes.button}
        variant="contained"
        color="primary"
      >
        {displayDealButton()}
      </Button>
    </div>
  );
};

export default Table;
