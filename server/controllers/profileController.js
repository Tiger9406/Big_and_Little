const Profile = require('../models/Profile');

// Creates a new profile
const createProfile = async (req, res) => {
  try {
    const { organizationId, bio, images, profilePicture, role, numberOfLittles, ranking } = req.body;

    // Verify required data exists
    if (!req.userId || !organizationId || !role) {
      return res.status(400).json({ message: 'userId, organizationId, and role fields required.' });
    }

    // Check if uploadPictures length exceeds max limit of 3
    if (images && images.length > 3) {
      return res.status(400).json({ message: 'Maximum of 3 pictures allowed' });
    }

    const profileObject = { userId, organizationId, bio, images, profilePicture, role, numberOfLittles, ranking };

    const profile = await Profile.create(profileObject);

    if (profile) {
      res.status(201).json({ message: `New profile created.` });
    }
    else {
      return res.status(400).json({ message: 'Invalid profile data received.' });
    }
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get profile by user ID
const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify required data exists
    if (!userId) {
      return res.status(400).json({ message: 'userId field required.' });
    }

    const profile = await Profile.findOne({ userId: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } 
  catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Updates profile
const updateProfile = async (req, res) => {
  try {

    const { userId } = req.params;

    const { interests, major, description, profileName, images, profilePicture, numberOfLittles } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (images && images.length > 3) {
      return res.status(400).json({ message: 'Maximum of 3 pictures allowed' });
    }

    const existingProfile = await Profile.findOne({ userId: userId });
    console.log("Existing Profile Found:", existingProfile);

    if (!existingProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const profileObject = { };

    if(interests) profileObject.interests = interests;
    if (major) profileObject.major = major;
    if (profileName) profileObject.profileName = profileName;
    if (description) profileObject.description = description; 
    if (images) profileObject.images = images; 
    if (profilePicture) profileObject.profilePicture = profilePicture;
    if (numberOfLittles != undefined) profileObject.numberOfLittles = numberOfLittles; //changed this so it will work if numberOfLittles is 0

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: userId },  // Find profile by userId
      { $set: profileObject },  // Update fields
      { new: true, runValidators: true }  // Return updated profile
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(updatedProfile);
  } 
  catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Deletes profile
const deleteProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    if (userId != req.userId) {
      return res.status(401).json({ message: "Cannot delete another User's profile" })
    }

    const profile = await Profile.findOneAndDelete({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProfile, getProfileByUserId, updateProfile, deleteProfile }