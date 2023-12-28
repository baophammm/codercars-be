// INITIAL CAR DATA UPLOAD
require("dotenv").config();
const mongoose = require("mongoose");
mongoURI = process.env.MONGODB_URI;

const fs = require("fs");
const csv = require("csvtojson");
const Car = require("./models/Car");

const uploadCarDataMongoDB = async () => {
  let carData = await csv().fromFile("cars_data.csv");

  //connect to mongoose
  mongoose
    .connect(mongoURI)
    .then(console.log(`connect success ${mongoURI}`))
    .catch((err) => console.log(err));

  // Check if database is empty
  let listOfFound = await Car.find({});
  // If not empty => Delete all to reset
  const checkEmptyAndDelete = async () => {
    if (listOfFound.length) {
      const listOfIds = listOfFound.map((car) => car._id.toString());
      listOfIds.map(async (carId) => {
        await Car.findByIdAndDelete(carId, { new: true });
        console.log("delete car success");
      });
    }
  };

  await checkEmptyAndDelete();

  // push car data from CSV to MongoDB database
  carData.map(async (car) => {
    try {
      carInfo = {
        make: car.Make,
        model: car.Model,
        release_date: parseInt(car.Year),
        transmission_type: car["Transmission Type"],
        size: car["Vehicle Size"],
        style: car["Vehicle Style"],
        price: parseInt(car.MSRP),
        isDeleted: false,
      };

      await Car.create(carInfo);
      console.log(carInfo);
      console.log("successfully upload on MongoDB");
    } catch (err) {
      console.log(err);
    }
  });
};

uploadCarDataMongoDB().catch((err) => console.log(err));
