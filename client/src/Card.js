import React from "react";

const Card = props => {
  const displayCard = () => {
    if (props.faceUp) {
      return (
        <img
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
      return <img alt="" src={"/images/SVG-cards-1.3/black_joker.svg"} />;
    }
  };

  return <div>{displayCard()}</div>;
};

export default Card;
