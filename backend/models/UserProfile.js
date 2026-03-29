import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  role: String,
  experience: String,
  stack: [String],
  goal: String,
  hoursPerWeek: String,
  targetDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("UserProfile", userProfileSchema);
