import React from "react";
import { Link } from "react-router-dom";
// UI imports
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button"

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
        Join as Table
      </Button>
    </div>
  );
};

export default UserOptions;
