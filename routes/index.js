var express = require("express");
const { AppError, sendResponse } = require("../helpers/utils");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to CoderCars! Vroom!");
});

const carAPI = require("./car.api.js");
router.use("/cars", carAPI);

module.exports = router;
