const jwt = require('jsonwebtoken');

const Profile = require('../models/Profile');
const Organization = require('../models/Organization');

const createProfile = async (req, res) => {
  try {
    const { 
      userId,
      organizationId, 
      interests,
      major,
      description,
      profileName,
      images,
      profilePicture,
      role,
      numberOfLittles 
    } = req.body;

    // Verify required data exists
    if (!userId || !organizationId || !role) {
      return res.status(400).json({ 
        message: 'userId, organizationId, and role fields required.' 
      });
    }

    // Check if profile already exists for this user in this organization
    const existingProfile = await Profile.findOne({ 
      userId, 
      organizationId 
    });

    if (existingProfile) {
      return res.status(400).json({ 
        message: 'Profile already exists for this user in this organization' 
      });
    }

    // Check if uploadPictures length exceeds max limit of 3
    if (images && images.length > 3) {
      return res.status(400).json({ 
        message: 'Maximum of 3 pictures allowed' 
      });
    }

    const profileObject = {
      userId,
      organizationId,
      role,
      interests: interests || [],
      major: major || '',
      description: description || '',
      profileName: profileName || '',
      images: images || [],
      profilePicture: profilePicture || '',
      numberOfLittles: role === 'Big' ? (numberOfLittles || 0) : undefined
    };

    //use session to make sure creation of profile and add to org; atomic
    const session = await Profile.startSession();
    let profile;

    try {
      await session.withTransaction(async () => {
        // create the profile
        profile = await Profile.create([profileObject], { session });
        profile = profile[0]; // create returns an array when used with session

        // Add user to organization's members
        await Organization.findByIdAndUpdate(
          organizationId,
          { $addToSet: { members: profile._id } }, // $addToSet prevents duplicate entries
          { session }
        );

        // get all user's profiles for token update
        const allProfiles = await Profile.find({ userId })
          .populate('organizationId')
          .session(session)  // same session
          .exec();

        const profilesArray = allProfiles.map(p => ({
          id: p._id,
          organizationId: p.organizationId._id,
          isOwner: p.organizationId.owner.equals(userId)
        }));

        // Create new JWT
        const accessToken = jwt.sign(
          {
            'UserInfo': {
              'userId': userId,
              'profiles': profilesArray
            }
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: '7d' }
        );
        res.status(201).json({profile, accessToken});
      });
    } catch (error) {
      throw error;
    }
    finally {
      await session.endSession();
    }
  }
  catch (err) {
    console.error('Profile creation error:', err);
    res.status(400).json({ 
      message: err.message 
    });
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
    if (description != undefined) profileObject.description = description; 
    if (images) profileObject.images = images; 
    if (profilePicture != undefined) profileObject.profilePicture = profilePicture;
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

const deleteProfile = async (req, res) => {
  try {
      const { userId, organizationId } = req.body;  // Add organizationId to request body

      if (userId != req.userId) {
          return res.status(401).json({ message: "Cannot delete another User's profile" })
      }

      const profile = await Profile.findOne({ 
          userId: req.userId,
          organizationId: organizationId  // Add this condition
      });
      
      if (!profile) {
          return res.status(404).json({ message: 'Profile not found' });
      }

      const session = await Profile.startSession();
      try {
          await session.withTransaction(async () => {
              // Remove user from organization's members using profile ID
              await Organization.findByIdAndUpdate(
                  organizationId,
                  { $pull: { members: profile._id } },
                  { session }
              );

              // Remove the specific profile
              await Profile.findOneAndDelete({ 
                  userId: req.userId,
                  organizationId: organizationId  // Add this condition
              }, { session });
          });
          await session.endSession();
          res.json({ message: 'Profile deleted successfully' });
      } catch (error) {
          await session.endSession();
          throw error;
      }
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

module.exports = { createProfile, getProfileByUserId, updateProfile, deleteProfile }