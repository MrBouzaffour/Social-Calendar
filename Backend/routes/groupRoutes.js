const express = require('express');
const GroupController = require('../controllers/groupController');
const router = express.Router();

/**
 * @route POST /api/groups
 * @description Creates a new group with a shared calendar.
 * @access Protected - requires user authentication
 * 
 * Headers:
 * - Authorization: Bearer <token>
 * 
 * Request Body:
 * - name (string): The name of the group.
 * - description (string, optional): A description of the group’s purpose.
 * 
 * Response:
 * - Success: Status 201 with a message and group details.
 * - Error: Status 400 if validation fails or 500 for server errors.
 */
router.post('/', GroupController.createGroup);

/**
 * @route POST /api/groups/:groupId/add
 * @description Adds a member to an existing group.
 * @access Protected - requires user authentication
 * 
 * Headers:
 * - Authorization: Bearer <token>
 * 
 * URL Params:
 * - groupId (string): The ID of the group to add a member to.
 * 
 * Request Body:
 * - userId (string): The ID of the user to add to the group.
 * 
 * Response:
 * - Success: Status 200 with a confirmation message and updated group members.
 * - Error: Status 400 for validation errors or 500 for server errors.
 */
router.post('/:groupId/add', GroupController.addMember);

/**
 * @route DELETE /api/groups/:groupId/members/:userId
 * @description Removes a member from the group.
 * @access Protected - requires user authentication
 * 
 * Headers:
 * - Authorization: Bearer <token>
 * 
 * URL Params:
 * - groupId (string): The ID of the group.
 * - userId (string): The ID of the user to remove from the group.
 * 
 * Response:
 * - Success: Status 200 with a confirmation message.
 * - Error: Status 400 if the user is not found in the group or 500 for server errors.
 */
router.delete('/:groupId/members/:userId', GroupController.removeMember);

/**
 * @route GET /api/groups/:groupId/calendar
 * @description Retrieves the calendar for the specified group.
 * @access Protected - requires user authentication
 * 
 * Headers:
 * - Authorization: Bearer <token>
 * 
 * URL Params:
 * - groupId (string): The ID of the group whose calendar is being retrieved.
 * 
 * Response:
 * - Success: Status 200 with the group's calendar details.
 * - Error: Status 404 if the group or calendar is not found or 500 for server errors.
 */
router.get('/:groupId/calendar', GroupController.getGroupCalendar);


/**
 * @route POST /api/groups/:groupId/invitations
 * @description Sends an invitation to a user to join a group.
 * @access Protected - requires user authentication
 * 
 * Headers:
 * - Authorization: Bearer <token> (JWT token for user authentication)
 * 
 * URL Parameters:
 * - groupId: ID of the group to which the invitation will be sent
 * 
 * Request Body:
 * {
 *   "recipientId": "<USER_ID>" // ID of the user to be invited
 * }
 * 
 * Response:
 * - Success: Status 201 with invitation details:
 *   {
 *     "message": "Invitation sent successfully",
 *     "invitation": {
 *       "id": "<INVITATION_ID>",
 *       "groupId": "<GROUP_ID>",
 *       "senderId": "<SENDER_USER_ID>",
 *       "recipientId": "<RECIPIENT_USER_ID>",
 *       "status": "pending",
 *       "createdAt": "<TIMESTAMP>"
 *     }
 *   }
 * - Error: Status 400 or 500 with error details if there was an issue.
 */
router.post('/:groupId/invite', GroupController.sendInvitation);

/**
 * @route GET /api/groups/:groupId/invitations
 * @description Gets all pending invitations for a group.
 * @access Protected - requires user authentication
 * 
 * Headers:
 * - Authorization: Bearer <token> (JWT token for user authentication)
 * 
 * URL Parameters:
 * - groupId: ID of the group for which to retrieve invitations
 * 
 * Response:
 * - Success: Status 200 with a list of pending invitations:
 *   {
 *     "invitations": [
 *       {
 *         "id": "<INVITATION_ID>",
 *         "groupId": "<GROUP_ID>",
 *         "senderId": "<SENDER_USER_ID>",
 *         "recipientId": "<RECIPIENT_USER_ID>",
 *         "status": "pending",
 *         "createdAt": "<TIMESTAMP>"
 *       },
 *       // more invitations...
 *     ]
 *   }
 * - Error: Status 400 or 500 with error details if there was an issue.
 */
router.get('/requests', GroupController.getInvitations);


// TODO :  all group invitation for a authentificated use




/**
 * @route POST /api/groups/:groupId/invitations/:invitationId/respond
 * @description Accepts or declines a group invitation.
 * @access Protected - requires user authentication
 * 
 * Headers:
 * - Authorization: Bearer <token> (JWT token for user authentication)
 * 
 * URL Parameters:
 * - groupId: ID of the group associated with the invitation
 * - invitationId: ID of the invitation to respond to
 * 
 * Request Body:
 * {
 *   "action": "accept" | "decline" // User's response to the invitation
 * }
 * 
 * Response:
 * - Success (Accepted): Status 200 with message:
 *   {
 *     "message": "Invitation accepted and user added to group"
 *   }
 * - Success (Declined): Status 200 with message:
 *   {
 *     "message": "Invitation declined"
 *   }
 * - Error: Status 400, 404, or 500 with error details if there was an issue.
 */
router.post('/:groupId/invitations/:invitationId', GroupController.respondToInvitation);


router.get('/:groupId/members', GroupController.getGroupMembers); // get a group memeber by group ID


// Retrieve the details of a specific event
router.get('/:groupId/info', GroupController.getGroupById);

module.exports = router;
