import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// UI imports:
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
// Cookie imports
import Cookies from 'universal-cookie'

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  button: {
      margin: theme.spacing(3, 0, 2)
  }
}));

const WelcomePage = () => {
  // sessionActive state
  const [sessionActive, setSessionActive] = useState(false);

  const cookies = new Cookies()

  // check to see if session exists before loading
  useEffect(() => {
    // query server here
    setSessionActive(false);
    if (typeof cookies.get("username") === "undefined") {
        cookies.set("username", "testUser")
    }
    console.log("username: " + cookies.get("username"))
  }, []);

  const classes = useStyles();

  return (
    <div className={classes.paper}>
      <Typography component="h1" variant="h5">
        Welcome to LAN Poker
      </Typography>
      <Typography variant="body1">
        {sessionActive ? "Game in Session!" : "You're the first one here!"}
      </Typography>
      <Typography variant="body1">
        {cookies.get("username")}
      </Typography>
      <Button className={classes.button} variant="contained" color="primary" component={Link} to='/user-options'>
        Enter Game
      </Button>
    </div>
  );
};

export default WelcomePage;
