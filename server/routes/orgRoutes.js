const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const orgController = require('../controllers/orgController');

router.route('/organizations')
  .get(orgController.getOrganizations);

router.route('/create-org')
  .post(orgController.createOrganization);

router.route('/organizations/:orgId')
  .get(orgController.getOrganizationById);

router.route('/organizations/:orgId/members')
  .get(orgController.getOrganizationMembers);

// User must be logged in for matches
router.use('/organizations/:orgId/matches', verifyToken);

router.route('/organizations/:orgId/matches/profiles')
  .get(orgController.getMatchProfiles);

router.route('/organizations/:orgId/matches/swipeLeft/:profileId')
  .post(orgController.swipeLeft);

router.route('/organizations/:orgId/matches/swipeRight/:profileId')
  .post(orgController.swipeRight);

module.exports = router;