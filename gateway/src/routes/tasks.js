const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const CORE_API_URL = process.env.CORE_API_URL || 'http://localhost:5000';

// All routes require authentication
router.use(authenticateToken);

// Ensure user exists in Core API
const ensureUserInCoreAPI = async (user) => {
  try {
    // First, check if user exists by email (to handle gateway restarts)
    try {
      const response = await axios.get(`${CORE_API_URL}/api/users/email/${encodeURIComponent(user.email)}`);
      // User exists with this email - update the user object to use the correct ID from database
      if (response.data && response.data.id !== user.id) {
        console.log(`User ${user.email} exists with different ID. Using database ID: ${response.data.id}`);
        user.id = response.data.id;
      }
      return; // User exists
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        throw error; // Some other error
      }
      // User doesn't exist by email, continue to create
    }

    // Create user in Core API
    try {
      await axios.post(`${CORE_API_URL}/api/users`, {
        id: user.id,
        email: user.email,
        name: user.name
      });
    } catch (createError) {
      // If it's a 409 (Conflict), the user already exists - that's fine
      if (createError.response && createError.response.status === 409) {
        console.log(`User ${user.email} already exists in Core API`);
        return;
      }
      throw createError;
    }
  } catch (error) {
    console.error(`Failed to ensure user in Core API: ${error.message}`);
    throw error;
  }
};

// Proxy to Core API with user context
const proxyToCoreAPI = async (req, res, next) => {
  // Ensure user exists in Core API before proxying
  try {
    await ensureUserInCoreAPI(req.user);
  } catch (error) {
    return res.status(503).json({ error: 'Unable to access user service' });
  }

  try {
    const response = await axios({
      method: req.method,
      url: `${CORE_API_URL}${req.originalUrl.replace('/api/tasks', '/api')}`,
      data: req.body,
      headers: {
        'X-User-Id': req.user.id,
        'X-User-Email': req.user.email,
        'Content-Type': 'application/json'
      }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      console.error(`Core API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Request error: ${error.message}`);
      next(error);
    }
  }
};

// Workspaces
router.get('/workspaces', proxyToCoreAPI);
router.post('/workspaces', proxyToCoreAPI);
router.get('/workspaces/:id', proxyToCoreAPI);
router.put('/workspaces/:id', proxyToCoreAPI);
router.delete('/workspaces/:id', proxyToCoreAPI);

// Boards
router.get('/workspaces/:workspaceId/boards', proxyToCoreAPI);
router.post('/workspaces/:workspaceId/boards', proxyToCoreAPI);
router.get('/boards/:id', proxyToCoreAPI);
router.put('/boards/:id', proxyToCoreAPI);
router.delete('/boards/:id', proxyToCoreAPI);

// Lists
router.get('/boards/:boardId/lists', proxyToCoreAPI);
router.post('/boards/:boardId/lists', proxyToCoreAPI);
router.get('/lists/:id', proxyToCoreAPI);
router.put('/lists/:id', proxyToCoreAPI);
router.delete('/lists/:id', proxyToCoreAPI);

// Cards (Tasks)
router.get('/lists/:listId/cards', proxyToCoreAPI);
router.post('/lists/:listId/cards', proxyToCoreAPI);
router.get('/cards/:id', proxyToCoreAPI);
router.put('/cards/:id', proxyToCoreAPI);
router.delete('/cards/:id', proxyToCoreAPI);

module.exports = router;
