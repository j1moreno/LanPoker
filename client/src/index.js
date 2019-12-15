import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import WelcomePage from "./WelcomePage";
import * as serviceWorker from "./serviceWorker";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import UserOptions from "./UserOptions";
import Hand from "./Hand";
import Table from "./Table";

ReactDOM.render(
  <Router>
    <Switch>
      <Route exact path="/">
        <WelcomePage />
      </Route>
      <Route path="/user-options">
        <UserOptions />
      </Route>
      <Route path="/hand">
        <Hand />
      </Route>
      <Route path="/table">
        <Table />
      </Route>
    </Switch>
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
