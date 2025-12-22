const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const CORE_API_URL = process.env.CORE_API_URL || 'http://localhost:5000';

// All routes require authentication
router.use(authenticateToken);

// Proxy to Core API with user context
const proxyToCoreAPI = async (req, res, next) => {
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
      res.status(error.response.status).json(error.response.data);
    } else {
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
