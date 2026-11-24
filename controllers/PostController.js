// controllers/PostController.js — Sequelize version
const { Post, PostTag, PostLike, PostComment, User } = require("../models/index");

// Helper: convert a Post Sequelize instance to the JSON shape the frontend expects
// — likedBy becomes array of userId strings
// — tags becomes array of tag strings  
// — comments stays as array of comment objects
// — adds _id alias
function serializePost(post) {
  const p = post.toJSON ? post.toJSON() : { ...post };
  p._id = p.id;

  // Flatten tags to string array (original: post.tags = [String])
  if (p.tags) {
    p.tags = p.tags.map(t => t.tag);
  }
  // Flatten likedBy to string array (original: post.likedBy = [String])
  if (p.likedBy) {
    p.likedBy = p.likedBy.map(l => String(l.userId));
  }
  // Add _id to comments
  if (p.comments) {
    p.comments = p.comments.map(c => ({ ...c, _id: c.id }));
  }
  return p;
}

const POST_INCLUDE = [
  { model: PostTag,     as: "tags" },
  { model: PostLike,    as: "likedBy" },
  { model: PostComment, as: "comments" },
];

module.exports = {
  // Create a new post
  createPost: async (req, res) => {
    console.log("Create Post Request Received");
    try {
      const { petName, ownerName, caption, category, tags } = req.body;
      console.log("Body:", req.body);

      let imagePath = "";
      let mediaType = "image";
      if (req.file) {
        console.log("File detected:", req.file.filename);
        imagePath = "/images/" + req.file.filename;
        if (req.file.mimetype.startsWith("video")) mediaType = "video";
      } else {
        console.log("No file detected");
      }

      const newPost = await Post.create({
        petName,
        ownerName,
        ownerId: req.user,
        image: imagePath,
        mediaType,
        caption,
        category,
      });

      // Save tags
      const parsedTags = tags ? JSON.parse(tags) : [];
      if (parsedTags.length) {
        await PostTag.bulkCreate(parsedTags.map(tag => ({ postId: newPost.id, tag })));
      }

      const full = await Post.findByPk(newPost.id, { include: POST_INCLUDE });
      console.log("Post saved successfully");
      res.json(serializePost(full));
    } catch (err) {
      console.log("Create Post Error:", err);
      res.status(500).json({ msg: err.message });
    }
  },

  // Get all posts
  getAllPosts: async (req, res) => {
    try {
      const posts = await Post.findAll({
        include: POST_INCLUDE,
        order: [["createdAt", "DESC"]],
      });
      res.json(posts.map(serializePost));
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Get posts by category
  getPostsByCategory: async (req, res) => {
    try {
      const { cat } = req.params;
      const where = cat !== "All" ? { category: cat } : {};
      const posts = await Post.findAll({
        where,
        include: POST_INCLUDE,
        order: [["createdAt", "DESC"]],
      });
      res.json(posts.map(serializePost));
    } catch (err) {
      res.status(500).json({ status: "error", msg: err.message });
    }
  },

  // Get posts by specific user (for Profile)
  getPostsByUser: async (req, res) => {
    try {
      const userId = req.params.id;
      // Validate it's a numeric ID (MySQL uses integers, not Mongo ObjectIds)
      if (!userId || isNaN(Number(userId))) {
        return res.json([]); // Return empty if invalid ID
      }

      const posts = await Post.findAll({
        where: { ownerId: userId },
        include: POST_INCLUDE,
        order: [["createdAt", "DESC"]],
      });
      res.json(posts.map(serializePost));
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: err.message });
    }
  },

  // Delete Post (Only Owner)
  deletePost: async (req, res) => {
    try {
      console.log("Attempting to delete post:", req.params.id);
      const post = await Post.findByPk(req.params.id);
      if (!post) {
        console.log("Post not found");
        return res.status(404).json({ msg: "Post not found" });
      }

      console.log("Post Owner:", post.ownerId, "Request User:", req.user);
      const postOwnerId = post.ownerId ? String(post.ownerId) : null;
      if (postOwnerId !== String(req.user)) {
        console.log("Unauthorized deletion attempt");
        return res.status(401).json({ msg: "Not authorized to delete this post" });
      }

      await post.destroy(); // cascades to tags/likes/comments
      console.log("Post deleted successfully");
      res.json({ msg: "Post deleted" });
    } catch (err) {
      console.error("Delete Error:", err);
      res.status(500).json({ msg: err.message });
    }
  },

  // Add Comment
  addComment: async (req, res) => {
    try {
      const { text, userName } = req.body;
      const post = await Post.findByPk(req.params.id);
      if (!post) return res.status(404).json({ msg: "Post not found" });

      await PostComment.create({
        postId: post.id,
        text,
        userName,
        ownerId: String(req.user),
      });

      const full = await Post.findByPk(post.id, { include: POST_INCLUDE });
      res.json(serializePost(full));
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Repost
  repost: async (req, res) => {
    try {
      const { caption } = req.body;
      const originalPost = await Post.findByPk(req.params.id, { include: POST_INCLUDE });
      if (!originalPost) return res.status(404).json({ msg: "Original post not found" });

      const currentUser = await User.findByPk(req.user);

      const newPost = await Post.create({
        petName: originalPost.petName,
        ownerName: currentUser.displayName,
        ownerId: req.user,
        image: originalPost.image,
        caption: caption || originalPost.caption,
        category: originalPost.category,
        repostFrom: originalPost.ownerName,
        mediaType: originalPost.mediaType,
      });

      // Clone tags from original
      const originalTags = originalPost.tags || [];
      if (originalTags.length) {
        await PostTag.bulkCreate(originalTags.map(t => ({ postId: newPost.id, tag: t.tag })));
      }

      const full = await Post.findByPk(newPost.id, { include: POST_INCLUDE });
      res.json(serializePost(full));
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: err.message });
    }
  },

  // Like a post (Toggle)
  likePost: async (req, res) => {
    try {
      const post = await Post.findByPk(req.params.id);
      if (!post) return res.status(404).json({ msg: "Post not found" });

      const userId = String(req.user);
      const existingLike = await PostLike.findOne({ where: { postId: post.id, userId } });

      if (existingLike) {
        // Unlike
        await existingLike.destroy();
      } else {
        // Like
        await PostLike.create({ postId: post.id, userId });
      }

      const full = await Post.findByPk(post.id, { include: POST_INCLUDE });
      res.json(serializePost(full));
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};
