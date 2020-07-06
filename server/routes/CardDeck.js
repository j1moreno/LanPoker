const DECK_SIZE = 52;

const indexToRank = [
  "Ace",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "jack",
  "queen",
  "king",
];

const indexToSuit = ["spades", "clubs", "diamonds", "hearts"];

class CardDeck {
  constructor() {
    this.numbers = Array.from(Array(DECK_SIZE).keys());
  }

  drawCard() {
    do {
      if (this.numbers.length < 1) return { rank: -1, suit: "none" };
      var randomIndex = Math.floor(Math.random() * DECK_SIZE);
    } while (!this.numbers.includes(randomIndex));
    // if we got here, a new card index was selected;
    // remove it from array so we don't get it again
    var index = this.numbers.indexOf(randomIndex);
    if (index > -1) {
      this.numbers.splice(index, 1);
    }

    return {
      index: randomIndex,
      rank: indexToRank[randomIndex % 13],
      suit: indexToSuit[randomIndex % 4],
    };
  }

  drawCards(numberOfCards) {
    let cards = [];
    for (let i = 0; i < numberOfCards; i++) {
      cards.push(this.drawCard());
    }

    return cards;
  }
}

module.exports = CardDeck;
