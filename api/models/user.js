const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: [true, "Name is required"] },
  email: { type: String, required: [true, "Email is required"], unique: true },
  password: { type: String, required: [true, "Password is required"]},
});

//VALIDATORS
userSchema.plugin(uniqueValidator, {message: "Error, email already exists"})
userSchema.methods.toJSON = function(){
  var obj = this.toObject();
  delete obj.password
  return obj;
}

const User = mongoose.model("User", userSchema);

module.exports = User;