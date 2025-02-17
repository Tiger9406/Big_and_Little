const Organization = require('../models/Organization');
const { Error } = require('mongoose');
const crypto = require('crypto');

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
        const orgsArray = orgs.map(org => ({
            name: org.name,
            description: org.description,
            logo: org.logo,
            size: org.members.length
        }));
        return res.status(200).send(orgsArray);
    } catch (err) { // Server error (Probably a Mongoose connection issue)
        return res.status(500).send();
    }
}

// @desc Create a new organization
// @route POST /organizations
const createOrganization = async (req, res) => {
    const { name, description, owner } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Organization name is required" });
    }
    console.log(name);
    console.log(description);
    console.log(owner);

    try {
        const joinCode = await generateUniqueJoinCode();
        const newOrg = new Organization({
            name,
            description: description || "",
            logo: "DEFAULT_LOGO_ID",
            isPublic: true,
            isMatching: false,
            joinCode: joinCode,
            owner: owner, // This should be a valid Profile ObjectId
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

module.exports = { getOrganizations, createOrganization };