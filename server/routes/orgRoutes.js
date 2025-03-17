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

router.route('/organizations/:joinCode/get-org')
    .get(orgController.getOrganizationByJoinCode);

module.exports = router;