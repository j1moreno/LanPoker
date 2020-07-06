import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// UI imports
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
// network imports
import Cookies from "universal-cookie";
import axios from "axios";
import DealerState from "./lib/DealerState";
import PlayerState from "./lib/PlayerState";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  button: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const UserOptions = () => {
  const classes = useStyles();
  const cookies = new Cookies();

  var numberOfUsers;

  const [dealerExists, setDealerExists] = useState(false);
  const [isUserDealer, setIsUserDealer] = useState(false);
  const [isUserInGame, setIsUserInGame] = useState(false);

  useEffect(() => {
    axios
      .get("/session/info")
      .then((res) => {
        numberOfUsers = res.data.numberOfUsers;
        if (res.data.dealerExists) {
          setDealerExists(true);
        }
      })
      .then(() => {
        // if no user has no ID, create one
        if (cookies.get("username") === undefined) {
          console.log("new user!");
          cookies.set("username", "testUser" + numberOfUsers);
        } else {
          console.log("not a new user");
          // get player info to see if role has been assigned
          const playerId = cookies.get("username");
          axios.get(`/session/player-info?id=${playerId}`).then((res) => {
            if (res.data.state) {
              setIsUserInGame(true);
              if (res.data.state.role === "dealer") {
                setIsUserDealer(true);
              }
            }
          });
        }
      });
  }, []);

  const isDealerOptionVisible = () => {
    return !dealerExists || isUserDealer;
  };

  return (
    <div className={classes.paper}>
      <Typography variant="h5">Select your role</Typography>
      {!isUserDealer && (
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          component={Link}
          to="/hand"
          onClick={() => {
            if (!isUserInGame) {
              // if user is already in game, don't overwrite data
              const updateData = {
                id: cookies.get("username"),
                state: new PlayerState(),
              };
              axios.post("/session/update-player-state", updateData);
            }
          }}
        >
          Join as Player
        </Button>
      )}
      {isDealerOptionVisible() && (
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          component={Link}
          to="/table"
          onClick={() => {
            if (!isUserDealer) {
              // if user is already dealer, don't overwrite data
              const updateData = {
                id: cookies.get("username"),
                state: new DealerState(),
              };
              axios.post("/session/update-player-state", updateData);
            }
          }}
        >
          Join as Dealer
        </Button>
      )}
    </div>
  );
};

export default UserOptions;
