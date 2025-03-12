// MONGOOSE DATA MODEL FOR ORGANIZATIONS
const mongoose = require("mongoose");

/*
  When creating an organization, care must be taken to ensure
  rounds, roundWeighting, swipesPerRound, and currentRound are all
  logically set. (i.e. rounds === roundWeighting.length ===)
*/
const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required!"],
  },
  description: {
    type: String,
    maxLength: 500,
    default: ""
  },
  logo: {
    type: String,
    default: "DEFAULT_LOGO_ID"
  },
  isPublic: {
    type: Boolean,
    required: [true, "Organization must be classified as public/private!"],
  },
  joinCode: { // Should this be automatically generated or set by the owner?
    type: Number, // Should this be a number/alphanumeric/etc.?
    required: true,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: [true, "Owner is required!"],
  },
  isMatching: {
    type: Boolean,
    required: [true, "Organization must be classified as matching/not matching!"]
  },
  members: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
      }
    ]
  },
  rounds: {
    type: Number,
    required: true,
    default: 3,
    min: 1
  },
  roundWeighting: {
    type: [Number],
    required: true,
    default: [1, 3, 5]
  },
  swipesPerRound: { // Should this be automatically determined by a percentage or manually configured?
    type: [Number],
    required: true
  },
  currentRound: { // 0-indexed
    type: Number,
    default: 0
  },
  unMatched: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
      }
    ]
  }
});

module.exports = mongoose.model("Organization", organizationSchema);
