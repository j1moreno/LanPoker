import React, { useState, useEffect } from "react";
import Card from "./Card";
import "./Table.css";
// UI imports
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
// server imports
import Axios from 'axios'

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
  const [flopFaceUp, setFlopFaceUp] = useState(false);
  const [turnFaceUp, setTurnFaceUp] = useState(false);
  const [riverFaceUp, setRiverFaceUp] = useState(false);

  const [flopCards, setFlopCards] = useState([
    {
      "rank": "huh",
      "suit": "HUH"
    },
    {
      "rank": "huh",
      "suit": "HUH"
    },
    {
      "rank": "huh",
      "suit": "HUH"
    }
  ])

  const [turnCard, setTurnCard] = useState(
    {
      "rank": "huh",
      "suit": "HUH"
    })

  const [riverCard, setRiverCard] = useState(
    {
      "rank": "huh",
      "suit": "HUH"
    })

  useEffect(() => {
    Axios.get('/deck/init').then(res => {
      console.log(res.data)
    })
  }, [])

  const dealCards = () => {
    if (!flopFaceUp) {
      // get flop cards from server
      Axios.get('/deck/draw?num=3').then(res => {
        setFlopCards(res.data)
        console.log(flopCards)
      })
      setFlopFaceUp(true);
    } else if (!turnFaceUp) {
      Axios.get('/deck/draw').then(res => {
        setTurnCard(res.data)
        console.log(turnCard)
      })
      setTurnFaceUp(true);
    } else if (!riverFaceUp) {
      Axios.get('/deck/draw').then(res => {
        setRiverCard(res.data)
        console.log(riverCard)
      })
      setRiverFaceUp(true);
    } else {
      Axios.get('/deck/init').then(res => {
        console.log(res.data)
      })
      setFlopFaceUp(false);
      setTurnFaceUp(false);
      setRiverFaceUp(false);
    }
  };

  const classes = useStyles();

  return (
    <div className={classes.paper}>
      <Typography variant="h5">This is a table:</Typography>
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
        Deal
      </Button>
    </div>
  );
};

export default Table;
