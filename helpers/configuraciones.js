const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const appConfiguraciones = (app) => {
  app.use(cookieParser());
  app.use(express.json());
  app.set("views", path.join(__dirname, "../src/views"));
  app.set("view engine", "ejs");
  app.use(express.static(path.join(__dirname, "../public")));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
};

module.exports = appConfiguraciones;