const { sendResponse, AppError } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const Car = require("../models/Car");
const carController = {};

carController.createCar = async (req, res, next) => {
  //post input validation
  const allowData = [
    "make",
    "model",
    "release_date",
    "transmission_type",
    "size",
    "style",
    "price",
  ];
  try {
    const info = req.body;
    const infoKeys = Object.keys(info);

    //find update requests that are not allowed

    infoKeys.map((key) => {
      if (!allowData.includes(key)) {
        throw new AppError(401, `Key ${key} is not allowed`);
      }
    });

    if (!info) throw new AppError(402, "Bad Request", "Create Car Error");
    //mongoose query
    const created = await Car.create(info);
    sendResponse(
      res,
      200,
      true,
      { data: created },
      null,
      "Created Car Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

carController.getCars = async (req, res, next) => {
  //input validation

  const allowedFilter = ["search", "page", "limit"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    //mongoose filter
    const filter = {};

    //allow search, page and limit query only
    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        throw AppError(401, `Query ${key} is not allowed`, "Get Cars Error");
      }
      if (!filterQuery[key]) delete filterQuery[key];
      if (allowedFilter.includes(key)) {
        if (key === "search") {
          filter.$or = [
            { make: { $regex: filterQuery[key], $options: "i" } },
            { model: { $regex: filterQuery[key], $options: "i" } },
          ];
        }
      }
    });

    //processing logic
    //Number of items skip for selection
    let offset = limit * (page - 1);

    //mongoose query

    let listOfFound = await Car.find(filter);
    const totalPages = Math.ceil(listOfFound.length / limit);
    //select number of result by offset
    listOfFound = listOfFound.slice(offset, offset + limit);

    //send response
    sendResponse(
      res,
      200,
      true,
      { cars: listOfFound, page: page, total: totalPages },
      null,
      "Get Car List Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

carController.editCar = async (req, res, next) => {
  //post input validation
  const allowData = [
    "make",
    "model",
    "release_date",
    "transmission_type",
    "size",
    "style",
    "price",
  ];
  const { id: targetId } = req.params;
  const updateItem = req.body;
  const updateItemKeys = Object.keys(updateItem);
  const options = { new: true };

  try {
    const selectedCar = await Car.findById(targetId);
    if (!selectedCar) {
      throw new AppError(404, "Car Not Found", "Edit Car Error");
    }

    //find update requests that are not allowed

    updateItemKeys.map((key) => {
      if (!allowData.includes(key)) {
        throw new AppError(
          401,
          `Update key ${key} is not allowed`,
          "Edit Car Error"
        );
      }
    });

    //mongoose query
    const updated = await Car.findByIdAndUpdate(targetId, updateItem, options);
    sendResponse(
      res,
      200,
      true,
      { data: updated },
      null,
      "Update Car Successfully"
    );
  } catch (err) {
    next(err);
  }
};

carController.deleteCar = async (req, res, next) => {
  const { id: targetId } = req.params;
  const options = { new: true };
  try {
    const selectedCar = await Car.findById(targetId);
    if (!selectedCar) {
      throw new AppError(404, "Car Not Found", "Delete Car Error");
    }
    //mongoose query
    const updated = await Car.findByIdAndDelete(targetId, options);
    sendResponse(
      res,
      200,
      true,
      { data: updated },
      null,
      "Delete car successfully!"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = carController;
