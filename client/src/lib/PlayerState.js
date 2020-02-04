export default class PlayerState {
  role = "player";
  cardsFaceUp = false;
  dealerExists = false;
  cardsDealt = false;
  cardsFolded = false;
  cards = [];

  constructor() {}

  loadState(inputObject) {
    this.cardsFaceUp = inputObject.cardsFaceUp;
    this.cards = inputObject.cards;
    this.dealerExists = inputObject.dealerExists;
    this.cardsDealt = inputObject.cardsDealt;
    this.cardsFolded = inputObject.cardsFolded;
  }
}
