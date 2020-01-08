import React, { useState, useEffect } from "react";
import Card from "./Card";
import "./Table.css";
// UI imports
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
// server imports
import Axios from "axios";
import Cookies from "universal-cookie";
import openSocket from "socket.io-client";

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

  const [flopFaceUp, setFlopFaceUp] = useState(false);
  const [turnFaceUp, setTurnFaceUp] = useState(false);
  const [riverFaceUp, setRiverFaceUp] = useState(false);

  const [flopCards, setFlopCards] = useState([]);
  const [turnCard, setTurnCard] = useState({});
  const [riverCard, setRiverCard] = useState({});

  const [playerCardsDealt, setPlayerCardsDealt] = useState(false);
  const [isStateRestored, setIsStateRestored] = useState(false);

  const cookies = new Cookies();

  // this runs on page load and refresh
  useEffect(() => {
    // first check if game is already running
    Axios.get("/session/info").then(res => {
      if (res.data.currentGame.dealerCards.length > 0) {
        setIsStateRestored(true);
        setPlayerCardsDealt(true);
        // load flop cards if they exist
        if (res.data.currentGame.dealerCards.length >= 3) {
          setFlopCards([
            res.data.currentGame.dealerCards[0],
            res.data.currentGame.dealerCards[1],
            res.data.currentGame.dealerCards[2]
          ]);
          setFlopFaceUp(true);
        }
        // load turn card if it exists
        if (res.data.currentGame.dealerCards.length >= 4) {
          setTurnCard(res.data.currentGame.dealerCards[3]);
          setTurnFaceUp(true);
        }
        // load river card if it exists
        if (res.data.currentGame.dealerCards.length >= 5) {
          setRiverCard(res.data.currentGame.dealerCards[4]);
          setRiverFaceUp(true);
        }
      } else {
        Axios.get("/deck/init").then(res => {
          console.log(res.data);
        });
        // update user role
        var userData = {
          id: cookies.get("username"),
          role: "dealer"
        };
        Axios.post("/session/set-user-role", userData).then(res => {
          console.log(res.data);
        });
        socket.emit("dealerEnter");
      }
    });
  }, []);

  // this runs on flopCard change
  useEffect(() => {
    if (!isStateRestored && flopCards.length > 1) {
      Axios.post("/session/add-dealer-cards", flopCards).then(res => {
        console.log(res.data);
      });
    }
  }, [flopCards]);
  // this runs on turnCard change
  useEffect(() => {
    if (!isStateRestored && Object.entries(turnCard).length > 0) {
      Axios.post("/session/add-dealer-cards", turnCard).then(res => {
        console.log(res.data);
      });
    }
  }, [turnCard]);
  // this runs on riverCard change
  useEffect(() => {
    if (!isStateRestored && Object.entries(turnCard).length > 0) {
      Axios.post("/session/add-dealer-cards", riverCard).then(res => {
        console.log(res.data);
      });
    }
  }, [riverCard]);

  const dealCards = () => {
    // clear state restore flag in order to allow posting new data
    setIsStateRestored(false);
    if (!playerCardsDealt) {
      // if player cards haven't been dealt yet, do that first
      socket.emit("dealCards");
      setPlayerCardsDealt(true);
    } else if (!flopFaceUp) {
      // get flop cards from server
      Axios.get("/deck/draw?num=3")
        .then(res => {
          setFlopCards(res.data);
          console.log(flopCards);
        })
        .then(() => {
          setFlopFaceUp(true);
        });
    } else if (!turnFaceUp) {
      Axios.get("/deck/draw")
        .then(res => {
          setTurnCard(res.data);
          console.log(turnCard);
        })
        .then(() => {
          setTurnFaceUp(true);
        });
    } else if (!riverFaceUp) {
      Axios.get("/deck/draw")
        .then(res => {
          setRiverCard(res.data);
          console.log(riverCard);
        })
        .then(() => {
          setRiverFaceUp(true);
        });
    } else {
      Axios.get("/deck/init").then(res => {
        console.log(res.data);
      });
      Axios.get("/session/clear-dealer-cards").then(res => {
        console.log(res.data);
      });
      setFlopFaceUp(false);
      setTurnFaceUp(false);
      setRiverFaceUp(false);
      setPlayerCardsDealt(false);
      socket.emit("endRound");
    }
  };

  const classes = useStyles();

  const displayDealButton = () => {
    if (riverFaceUp) {
      return "End Round";
    } else {
      return "Deal";
    }
  };

  return (
    <div className={classes.paper}>
      <Typography variant="h5">This is a table:</Typography>
      {playerCardsDealt && (
        <Typography varint="h3">Player cards dealt</Typography>
      )}
      <div className="Table-cards">
        {flopFaceUp && (
          <div className="Table-cards">
            <Card cardInfo={flopCards[0]} faceUp={flopFaceUp} />
            <Card cardInfo={flopCards[1]} faceUp={flopFaceUp} />
            <Card cardInfo={flopCards[2]} faceUp={flopFaceUp} />
          </div>
        )}
        {turnFaceUp && (
          <div>
            <Card cardInfo={turnCard} faceUp={turnFaceUp} />
          </div>
        )}
        {riverFaceUp && (
          <div>
            <Card cardInfo={riverCard} faceUp={riverFaceUp} />
          </div>
        )}
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
