// models/user.model.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  resume: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});
const User=mongoose.model("User",UserSchema);
export default User
