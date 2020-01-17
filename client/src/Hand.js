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

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(3, 2, 2)
  }
}));

const Hand = () => {
  const socket = openSocket("/");

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

  const [dealerExists, setDealerExists] = useState(false);
  const [cardsDealt, setCardsDealt] = useState(false);
  const [isStateRestored, setIsStateRestored] = useState(false);

  const cookies = new Cookies();
  let history = useHistory();

  useEffect(() => {
    // first check if game is already running
    const playerId = cookies.get("username");
    axios.get(`/session/player-info?id=${playerId}`).then(res => {
      console.log("response from player info: ");
      console.log(res.data);
      if (res.data.cards && res.data.cards.length > 0) {
        setIsStateRestored(true);
        setDealerExists(true);
        setCardsDealt(true);
        // load cards
        setCards(res.data.cards);
      } else {
        // update user role
        var userData = {
          id: cookies.get("username"),
          role: "player"
        };
        axios
          .post("/session/set-user-role", userData)
          .then(res => {
            console.log(res.data);
          })
          .then(
            axios.get("/session/info").then(res => {
              setDealerExists(res.data.dealerExists);
            })
          );
      }
    });
  }, []);

  // effect with cleanup for listeners
  useEffect(() => {
    socket.on("dealerHasEntered", value => {
      console.log("dealer has entered!");
      setDealerExists(value);
    });
    socket.on("getCards", value => {
      console.log("dealer has dealt!");
      axios.get("/deck/draw?num=2").then(res => {
        setCardsDealt(value);
        setCards(res.data);
      });
    });
    socket.on("roundEnded", value => {
      console.log("round is over");
      setCardsDealt(false);
      setIsStateRestored(false);
    });

    // cleanup:
    return () => {
      socket.off("dealerHasEntered");
      socket.off("getCards");
    };
  });

  // execute everytime cards are updated
  useEffect(() => {
    if (!isStateRestored && cardsDealt) {
      // post cards to session:
      // build card data
      const cardData = {
        cards: cards
      };
      // build data to post, including id
      const id = cookies.get("username");
      const postData = {
        id: id,
        cardData: cardData
      };
      // post to session
      axios.post("/session/add-player-cards", postData).then(res => {
        console.log("player cards added to session");
      });
    }
  }, [cards]);

  function flipCards() {
    setCardsFaceUp(!cardsFaceUp);
  }

  function leaveGame() {
    var userData = {
      id: cookies.get("username")
    };
    axios.post("/session/remove-user", userData).then(res => {
      console.log(res.data);
      // redirect to home page
      history.push("/");
    });
  }

  const classes = useStyles();

  const displayContent = () => {
    if (!dealerExists) {
      return <div>Waiting for dealer</div>;
    } else if (!cardsDealt) {
      return <div>Waiting for cards...</div>;
    } else {
      return (
        <div>
          <Card cardInfo={cards[0]} faceUp={cardsFaceUp} />
          <Card cardInfo={cards[1]} faceUp={cardsFaceUp} />
        </div>
      );
    }
  };

  return (
    <div>
      <Typography variant="h5">This is your hand:</Typography>
      {displayContent()}
      <Button
        onClick={flipCards}
        className={classes.button}
        variant="contained"
        color="primary"
      >
        Flip Cards
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
  );
};

export default Hand;
