import React, { useState, useEffect } from "react";
import Card from "./Card";
// UI imports:
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
// network imports:
import axios from "axios";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(3, 0, 2)
  }
}));

const Hand = () => {
  const [cardsFaceUp, setCardsFaceUp] = useState(false);
  const [cards, setCards] = useState([
    {
      rank: "none",
      suit: "none"
    },
    {
      rank: "none",
      suit: "none"
    }
  ]);

  useEffect(() => {
    axios.get("/deck/draw?num=2").then(res => {
      setCards(res.data);
    });
  }, []);

  function flipCards() {
    setCardsFaceUp(!cardsFaceUp);
  }

  const classes = useStyles();

  return (
    <div>
      <Typography variant="h5">This is your hand:</Typography>
      <div>
        <Card cardInfo={cards[0]} faceUp={cardsFaceUp} />
        <Card cardInfo={cards[1]} faceUp={cardsFaceUp} />
      </div>
      <Button
        onClick={flipCards}
        className={classes.button}
        variant="contained"
        color="primary"
      >
        Flip Cards
      </Button>
    </div>
  );
};

export default Hand;
