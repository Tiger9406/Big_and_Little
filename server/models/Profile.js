// MONGOOSE DATA MODEL FOR PROFILES
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Profile must be linked to a user!"],
    ref: 'User'
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Profile must be linked to an organization!"],
    ref: 'Organization'
  },
  description: { // Would this make more sense to be called bio? (if it gets changed, change it in controller and profile.js)
    type: String,
    maxLength: 500,
    default: ""
  },
  major: { 
    type: String,
    maxLength: 50,
    default: ""
  },              //change change length of these fields if we need
  profileName: { 
    type: String,
    maxLength: 50,
    default: ""
  },
  images: {
    type: [String]
  },
  interests: {
    type: [String]
  },
  role: {
    type: String,
    required: [true, "Role is required!"],
    enum: ['Big', 'Little']
  },
  numberOfLittles: { // Only applies for Bigs
    type: Number
  },
  profilePic: {
    type: String,
    default: "DEFAULT_PROFILE_PIC_ID"
  },
  maxSpots: { 
    type: Number, 
    default: 1 
  },
  rankings: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Profile' },
    timestamp: Date
  }],
  matches: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Profile' 
  }],
});

module.exports = mongoose.model('Profile', profileSchema);
