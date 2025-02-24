const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const verifyToken = require('../middleware/authMiddleware');

// User must be logged in to edit/view profiles
router.use('/profiles', verifyToken);

router.route('/profiles')
  .post(profileController.createProfile)

router.route('/profiles/:userId')
  .get(profileController.getProfileByUserId)
  .put((req, res, next) => {
    console.log("Received PUT request for userId:", req.params.userId);
    console.log("Request body:", req.body);
    console.log("Headers:", req.headers);
    next();
}, profileController.updateProfile)
  .delete(profileController.deleteProfile);

module.exports = router;
