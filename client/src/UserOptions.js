import React, { useEffect } from "react";
import { Link } from "react-router-dom";
// UI imports
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
// network imports
import Cookies from "universal-cookie";
import axios from "axios";

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

const UserOptions = () => {
  const classes = useStyles();
  const cookies = new Cookies();

  var numberOfUsers;

  useEffect(() => {
    axios
      .get("/session/info")
      .then(res => {
        numberOfUsers = res.data.numberOfUsers;
      })
      .then(() => {
        // if no user has no ID, create one
        if (cookies.get("username") === undefined) {
          console.log("new user!");
          cookies.set("username", "testUser" + numberOfUsers);
        } else {
          console.log("not a new user");
        }
        console.log(cookies.get("username"));
        var newUserData = {
          id: cookies.get("username")
        };
        axios
          .post("/session/adduser", newUserData)
          .then(res => console.log(res.data));
      });
  }, []);

  return (
    <div className={classes.paper}>
      <Typography variant="h5">Select your role</Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        component={Link}
        to="/hand"
      >
        Join as Player
      </Button>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        component={Link}
        to="/table"
      >
        Join as Dealer
      </Button>
    </div>
  );
};

export default UserOptions;
