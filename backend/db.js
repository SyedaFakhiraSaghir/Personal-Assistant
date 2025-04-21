const mongoose = require("mongoose");

const db = async () => {
  try {
    mongoose.set("strictQuery", false); // Optional: remove deprecation warning
    await mongoose.connect("mongodb+srv://k224499:NoAdoNrSmqXRPH9Z@cluster0.lb8y9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {});
    console.log("Db connected");
  } catch (error) {
    console.log("Db Connection error:", error.message); // Log actual error
  }
};

module.exports = { db }; // Correct export
