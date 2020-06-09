var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var app = express();
// attach io object to be able to use it in routes
app.io = require("socket.io")();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var cardDeckRouter = require("./routes/deck");
var sessionRouter = require("./routes/session");
var gameStateRouter = require("./routes/game-state")(app.io);

app.use(logger("common"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", usersRouter);
app.use("/deck", cardDeckRouter);
app.use("/session", sessionRouter);
app.use("/game-state", gameStateRouter);

app.use("/", express.static(path.join(__dirname, "build")));

module.exports = app;
