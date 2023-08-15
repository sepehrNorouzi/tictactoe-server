const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const morgan = require("morgan");
const cors = require("cors");
const sequelize = require("./db.util");

// Init db
require("./models/user.model");

//config
require("dotenv").config();

// Body parser
app.use(express.json());

// Logger
app.use(morgan("combined"));

// CORS
const cors_options = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(cors_options));

server.on("listening", () => {
  console.log(
    `App listening on port ${process.env.DEFAULT_HOST}:${process.env.DEFAULT_PORT}...`
  );
});

sequelize
  .sync({ force: false })
  .then(() => {
    server.listen(process.env.DEFAULT_PORT || 3000, process.env.DEFAULT_HOST);
    require("./socket").init(server);
  })
  .catch((err) => {
    console.error(err);
  });
