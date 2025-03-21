const Organization = require('../models/Organization');
const { Error } = require('mongoose');
const crypto = require('crypto');
const Profile = require('../models/Profile');

// Function to generate a unique joinCode
const generateUniqueJoinCode = async () => {
  let joinCode;
  let isUnique = false;

  while (!isUnique) {
    joinCode = crypto.randomInt(100000, 999999); 

    const existingOrg = await Organization.findOne({ joinCode }).exec();
    if (!existingOrg) {
      isUnique = true; 
    }
  }
  return joinCode;
};

// @desc Get public organizations
// @route GET /organizations
// @access Public
const getOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find({ isPublic: true, isMatching: false }).exec();
    return res.json(orgs);
  } catch (err) { // Server error (Probably a Mongoose connection issue)
    return res.status(500).send();
  }
}

// @desc Create a new organization
// @route POST /create-org
const createOrganization = async (req, res) => {
  const { name, description, owner } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Organization name is required" });
  }

  try {
    const joinCode = await generateUniqueJoinCode();
    const newOrg = new Organization({
      name,
      description: description || "",
      logo: "DEFAULT_LOGO_ID",
      isPublic: true,
      isMatching: false,
      joinCode: joinCode,
      owner: owner, // This should be a valid Profile ObjectId, rn it is a userID
      members: [owner], // Add owner as the first member
      rounds: 3,
      roundWeighting: [1, 3, 5],
      swipesPerRound: [20, 10, 5],
      currentRound: 0
    });

    await newOrg.save();
    return res.status(201).json({ message: "Organization created successfully", org: newOrg });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


// @desc Get a specific organization
// @route GET /organizations/:orgId
// @access Private
const getOrganizationById = async (req, res) => {
  try {
    const { orgId } = req.params;
    if (!orgId) {
      return res.status(400).json({ message: 'id field required.' });
    }

    const org = await Organization.findById(orgId);
    if (org) {
      return res.json(org);
    }

    return res.status(404).send();
  }
  catch (err) {
    return res.status(500).send();
  }
};

// @desc Get a specific organizations members
// @route GET /organizations/:orgId/members
// @access Private
const getOrganizationMembers = async (req, res) => {
  try {
    const { orgId } = req.params;
    if (!orgId) {
      return res.status(400).json({ message: 'id field required.' });
    }

    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).send();
    }

    const profiles = await Profile.find({ _id: { $in: org?.members } }).exec();

    if (!profiles) {
      return res.status(404).send();
    }

    return res.json(profiles);
  }
  catch (err) {
    return res.status(500).send();
  }
};

// @desc Get matches for a profile
// @route GET /organizations/:orgId/matches/profiles
// @access Private
const getMatchProfiles = async (req, res) => {
  const { orgId } = req.params;
  const userProfiles = req.profiles;
  if (!orgId) return res.status(400).send('Organization ID is required!');
  
  const org = await Organization.findById(orgId);
  if (!org) return res.status(400).send(`No organization with ID ${orgId} exists!`);
  if (!org.isMatching) return res.status(400).send('Organization is not currently matching!');
  
  const userProfileId = userProfiles.find(p => p.organizationId === orgId)?.id;
  if (!userProfileId) return res.status(400).send('User is not a member of the organization!');
  
  const userProfile = await Profile.findById(userProfileId);
  
  // Get all members in the organization
  let profiles = await Profile.find({ _id: { $in: org.members } }).exec();
  
  // Get Bigs for Littles, and Littles for Bigs
  profiles = profiles.filter(p => p.role !== userProfile.role);
  
  // Filter out members that user has already swiped on
  const round = userProfile.rounds[org.currentRound];
  let swipes = [];
  if (round) {
    swipes = round.swipesLeft.concat(round.swipesRight);
    profiles = profiles.filter(p => !swipes.map(id => id.toString()).includes(p._id.toString()));
  }

  // Determine number of swipes user has left
  const remainingSwipes = org.swipesPerRound[org.currentRound] - swipes.length;
  
  return res.json({
    "profiles": profiles,
    "swipes": remainingSwipes
  });
}

// @desc Swipes left on a profile
// @route POST /organizations/:orgId/matches/swipeLeft/:profileId
// @access Private
const swipeLeft = async (req, res) => {
  const { orgId, profileId } = req.params;
  const userProfiles = req.profiles;
  if (!orgId || !profileId) return res.status(400).send('Please provide an organization and profile ID!');

  const org = await Organization.findById(orgId);
  if (!org) return res.status(400).send(`Organization with ID ${orgId} does not exist!`);
  if (!org.isMatching) return res.status(400).send('Organization is not currently matching!');

  const userProfileId = userProfiles.find(p => p.organizationId === orgId).id;
  const userProfile = await Profile.findById(userProfileId);
  
  let round = userProfile.rounds[org.currentRound];
  if (!round) {
    round = {
      swipesLeft: [],
      swipesRight: []
    };
  }
  
  // Check validity of swipe
  if (round.swipesLeft.length + round.swipesRight.length === org.swipesPerRound[org.currentRound]) {
    return res.status(400).send('User has no more swipes!');
  } else if (round.swipesLeft.includes(profileId) || round.swipesRight.includes(profileId)) {
    return res.status(400).send('User has already swiped on this profile!');
  }
  
  const profile = await Profile.findById(profileId);
  if (!profile) return res.status(400).send(`Profile with ID ${profileId} does not exist!`);
  round.swipesLeft.push(profile._id);

  // Save
  userProfile.rounds[org.currentRound] = round;
  await userProfile.save();
  
  return res.status(200).send();
}

// @desc Swipes right on a profile
// @route POST /organizations/:orgId/matches/swipeRight/:profileId
// @access Private
const swipeRight = async (req, res) => {
  const { orgId, profileId } = req.params;
  const userProfiles = req.profiles;
  if (!orgId || !profileId) return res.status(400).send('Please provide an organization and profile ID!');

  const org = await Organization.findById(orgId);
  if (!org) return res.status(400).send(`Organization with ID ${orgId} does not exist!`);
  if (!org.isMatching) return res.status(400).send('Organization is not currently matching!');

  const userProfileId = userProfiles.find(p => p.organizationId === orgId).id;
  const userProfile = await Profile.findById(userProfileId);
  
  let round = userProfile.rounds[org.currentRound];
  if (!round) {
    round = {
      swipesLeft: [],
      swipesRight: []
    };
  }
  
  // Check validity of swipe
  if (round.swipesLeft.length + round.swipesRight.length === org.swipesPerRound[org.currentRound]) {
    return res.status(400).send('User has no more swipes!');
  } else if (round.swipesLeft.includes(profileId) || round.swipesRight.includes(profileId)) {
    return res.status(400).send('User has already swiped on this profile!');
  }
  
  const profile = await Profile.findById(profileId);
  if (!profile) return res.status(400).send(`Profile with ID ${profileId} does not exist!`);
  round.swipesRight.push(profile._id);

  // Save
  userProfile.rounds[org.currentRound] = round;
  await userProfile.save();

  return res.status(200).send();
}


module.exports = {
  getOrganizations,
  getOrganizationById,
  getOrganizationMembers,
  createOrganization,
  getMatchProfiles,
  swipeLeft,
  swipeRight
};