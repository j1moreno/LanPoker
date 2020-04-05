export default class PlayerState {
  role = "player";
  cardsFaceUp = false;
  dealerExists = false;
  cardsDealt = false;
  cardsFolded = false;
  cards = [];
  roundNumber = 1;

  constructor() {}

  loadState(inputObject) {
    this.cardsFaceUp = inputObject.cardsFaceUp;
    this.cards = inputObject.cards;
    this.dealerExists = inputObject.dealerExists;
    this.cardsDealt = inputObject.cardsDealt;
    this.cardsFolded = inputObject.cardsFolded;
    this.roundNumber = inputObject.roundNumber;
  }
}
