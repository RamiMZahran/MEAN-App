const express = require('express');
const multer = require('multer');

const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid Mime Type');
    if (isValid) {
      error = null;
    }
    cb(error, 'backend/images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(' ')
      .join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});
router.post(
  '',
  checkAuth,
  multer({ storage }).single('image'),
  async (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + '/images/' + req.file.filename
    });
    const savedPost = await post.save();

    res.status(201).json({
      message: 'Post Added Successfully',
      post: savedPost
    });
  }
);

router.put(
  '/:id',
  checkAuth,
  multer({ storage }).single('image'),
  async (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + '://' + req.get('host');
      imagePath = url + '/images/' + req.file.filename;
    }
    const post = new Post({
      _id: req.body._id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath
    });
    console.log(post);
    await Post.updateOne({ _id: req.params.id }, post);

    res.status(201).json({
      message: 'Post Updated Successfully'
    });
  }
);

router.get('/:id', async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    res.status(200).json({
      message: 'Post Fetched successfully',
      post
    });
  } else {
    res.status(404).json({
      message: 'Post Not Found'
    });
  }
});

router.get('', async (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  const posts = await postQuery;

  const count = await Post.count();

  res.status(200).json({
    message: 'Posts Fetched successfully',
    maxPosts: count,
    posts
  });
});

router.delete('/:id', checkAuth, async (req, res, next) => {
  await Post.findByIdAndDelete(req.params.id);
  res.status(200).json({
    message: 'Post Deleted successfully'
  });
});

module.exports = router;
