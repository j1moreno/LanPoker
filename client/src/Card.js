import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  card: {
    maxHeight: 303,
    maxWidth: 208
  }
}));

const Card = props => {
  const classes = useStyles();
  const displayCard = () => {
    if (props.faceUp) {
      return (
        <img
          className={classes.card}
          alt=""
          src={
            "/images/SVG-cards-1.3/" +
            props.cardInfo.rank +
            "_of_" +
            props.cardInfo.suit +
            ".svg"
          }
        />
      );
    } else {
      return (
        <img
          className={classes.card}
          alt=""
          src={"/images/SVG-cards-1.3/Card_back_01.svg"}
        />
      );
    }
  };

  return <div>{displayCard()}</div>;
};

export default Card;
