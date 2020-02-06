export default class DealerState {
  role = "dealer";
  playerCardsDealt = false;
  cards = [];

  loadState(inputObject) {
    this.playerCardsDealt = inputObject.playerCardsDealt;
    this.cards = inputObject.cards;
  }
}
