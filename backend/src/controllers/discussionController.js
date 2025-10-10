const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

// Get discussions with pagination and filtering
const getDiscussions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const discussion_type = req.query.discussion_type;
    const sort = req.query.sort || 'newest'; // newest, popular, trending
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (category) {
      whereConditions.push('category = ?');
      queryParams.push(category);
    }

    if (discussion_type) {
      whereConditions.push('discussion_type = ?');
      queryParams.push(discussion_type);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    let orderClause = '';
    switch (sort) {
      case 'popular':
        orderClause = 'ORDER BY (upvotes - downvotes) DESC, created_at DESC';
        break;
      case 'trending':
        orderClause = 'ORDER BY (upvotes - downvotes) / GREATEST(TIMESTAMPDIFF(HOUR, created_at, NOW()), 1) DESC';
        break;
      default:
        orderClause = 'ORDER BY is_pinned DESC, created_at DESC';
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM discussions ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // Get discussions
    const [discussions] = await pool.execute(
      `SELECT d.*, u.username, u.role, u.avatar_url,
              (SELECT COUNT(*) FROM discussion_comments dc WHERE dc.discussion_id = d.id) as comment_count
       FROM discussions d
       LEFT JOIN users u ON d.user_id = u.id
       ${whereClause}
       ${orderClause}
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      discussions,
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new discussion
const createDiscussion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      category,
      discussion_type = 'question',
      tags = [],
      attachments = [],
    } = req.body;

    const userId = req.user.id;

    const [result] = await pool.execute(
      `INSERT INTO discussions 
       (user_id, title, content, category, discussion_type, tags, attachments) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        content,
        category,
        discussion_type,
        JSON.stringify(tags),
        JSON.stringify(attachments),
      ]
    );

    res.status(201).json({
      message: 'Discussion created successfully',
      discussion_id: result.insertId,
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get discussion by ID
const getDiscussionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get discussion details
    const [discussionRows] = await pool.execute(
      `SELECT d.*, u.username, u.role, u.avatar_url
       FROM discussions d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [id]
    );

    if (discussionRows.length === 0) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const discussion = discussionRows[0];

    // Parse JSON fields
    discussion.tags = JSON.parse(discussion.tags || '[]');
    discussion.attachments = JSON.parse(discussion.attachments || '[]');

    // Increment view count
    await pool.execute(
      'UPDATE discussions SET views = views + 1 WHERE id = ?',
      [id]
    );

    // Get comments
    const [comments] = await pool.execute(
      `SELECT c.*, u.username, u.role, u.avatar_url,
              (SELECT COUNT(*) FROM discussion_comments cc WHERE cc.parent_id = c.id) as reply_count
       FROM discussion_comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.discussion_id = ? AND c.parent_id IS NULL
       ORDER BY c.created_at ASC`,
      [id]
    );

    // Get replies for each comment
    for (let comment of comments) {
      const [replies] = await pool.execute(
        `SELECT r.*, u.username, u.role, u.avatar_url
         FROM discussion_comments r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.parent_id = ?
         ORDER BY r.created_at ASC`,
        [comment.id]
      );
      comment.replies = replies;
    }

    discussion.comments = comments;

    res.json(discussion);
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add comment to discussion
const addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { discussion_id } = req.params;
    const { content, parent_id = null } = req.body;
    const userId = req.user.id;

    const [result] = await pool.execute(
      `INSERT INTO discussion_comments 
       (discussion_id, user_id, content, parent_id) 
       VALUES (?, ?, ?, ?)`,
      [discussion_id, userId, content, parent_id]
    );

    // Update comment count
    await pool.execute(
      'UPDATE discussions SET comment_count = comment_count + 1 WHERE id = ?',
      [discussion_id]
    );

    res.status(201).json({
      message: 'Comment added successfully',
      comment_id: result.insertId,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vote on discussion
const voteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote_type } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;

    // Check if user already voted
    const [existingVote] = await pool.execute(
      'SELECT * FROM discussion_votes WHERE discussion_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingVote.length > 0) {
      // Update existing vote
      await pool.execute(
        'UPDATE discussion_votes SET vote_type = ? WHERE discussion_id = ? AND user_id = ?',
        [vote_type, id, userId]
      );
    } else {
      // Create new vote
      await pool.execute(
        'INSERT INTO discussion_votes (discussion_id, user_id, vote_type) VALUES (?, ?, ?)',
        [id, userId, vote_type]
      );
    }

    res.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Error voting on discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Pin/Unpin discussion (admin/moderator only)
const pinDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_pinned } = req.body;

    // Check permissions
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    await pool.execute(
      'UPDATE discussions SET is_pinned = ? WHERE id = ?',
      [is_pinned, id]
    );

    res.json({ message: 'Discussion pin status updated successfully' });
  } catch (error) {
    console.error('Error updating discussion pin status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get trending discussions
const getTrendingDiscussions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [discussions] = await pool.execute(
      `SELECT d.*, u.username, u.role,
              (SELECT COUNT(*) FROM discussion_comments dc WHERE dc.discussion_id = d.id) as comment_count
       FROM discussions d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       ORDER BY (d.upvotes - d.downvotes) / GREATEST(TIMESTAMPDIFF(HOUR, d.created_at, NOW()), 1) DESC
       LIMIT ?`,
      [limit]
    );

    res.json(discussions);
  } catch (error) {
    console.error('Error fetching trending discussions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDiscussions,
  createDiscussion,
  getDiscussionById,
  addComment,
  voteDiscussion,
  pinDiscussion,
  getTrendingDiscussions,
};
