import React from "react";

const Card = props => {
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
};

export default Card;
