const express = require('express');

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');
const postsController = require('../controllers/posts');

const router = express.Router();

router.post('', checkAuth, extractFile, postsController.postPost);

router.put('/:id', checkAuth, extractFile, postsController.putPost);

router.get('/:id', postsController.getPost);

router.get('', postsController.getPosts);

router.delete('/:id', checkAuth, postsController.deletePost);

module.exports = router;
