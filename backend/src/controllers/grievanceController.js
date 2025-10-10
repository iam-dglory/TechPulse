const { validationResult } = require('express-validator');
const { pool } = require('../config/database');
const aiService = require('../services/aiService');

// Get grievances with pagination and filtering
const getGrievances = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const risk_level = req.query.risk_level;
    const status = req.query.status;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (category) {
      whereConditions.push('category = ?');
      queryParams.push(category);
    }

    if (risk_level) {
      whereConditions.push('risk_level = ?');
      queryParams.push(risk_level);
    }

    if (status) {
      whereConditions.push('status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM grievances ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // Get grievances
    const [grievances] = await pool.execute(
      `SELECT g.*, u.username, u.role,
              (SELECT COUNT(*) FROM grievance_votes gv WHERE gv.grievance_id = g.id AND gv.vote_type = 'upvote') as upvotes,
              (SELECT COUNT(*) FROM grievance_votes gv WHERE gv.grievance_id = g.id AND gv.vote_type = 'downvote') as downvotes
       FROM grievances g
       LEFT JOIN users u ON g.user_id = u.id
       ${whereClause}
       ORDER BY g.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      grievances,
    });
  } catch (error) {
    console.error('Error fetching grievances:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit a new grievance
const submitGrievance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      is_anonymous = false,
      tags = [],
      evidence_files = [],
      location = null,
    } = req.body;

    const userId = req.user.id;

    // Use AI to categorize and assess risk
    const aiAnalysis = await aiService.analyzeGrievance({
      title,
      description,
      category,
    });

    const risk_level = aiAnalysis.risk_level;
    const ai_confidence = aiAnalysis.confidence;
    const suggested_tags = aiAnalysis.suggested_tags;

    // Combine user tags with AI suggestions
    const final_tags = [...new Set([...tags, ...suggested_tags])];

    const [result] = await pool.execute(
      `INSERT INTO grievances 
       (user_id, title, description, category, risk_level, ai_confidence, 
        is_anonymous, tags, evidence_files, location) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        description,
        category,
        risk_level,
        ai_confidence,
        is_anonymous,
        JSON.stringify(final_tags),
        JSON.stringify(evidence_files),
        location ? JSON.stringify(location) : null,
      ]
    );

    // If high risk, automatically escalate
    if (risk_level === 'high' || risk_level === 'critical') {
      await pool.execute(
        'UPDATE grievances SET status = ?, priority = ? WHERE id = ?',
        ['escalated', 'urgent', result.insertId]
      );
    }

    res.status(201).json({
      message: 'Grievance submitted successfully',
      grievance_id: result.insertId,
      ai_analysis: aiAnalysis,
    });
  } catch (error) {
    console.error('Error submitting grievance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get grievance by ID
const getGrievanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT g.*, u.username, u.role,
              (SELECT COUNT(*) FROM grievance_votes gv WHERE gv.grievance_id = g.id AND gv.vote_type = 'upvote') as upvotes,
              (SELECT COUNT(*) FROM grievance_votes gv WHERE gv.grievance_id = g.id AND gv.vote_type = 'downvote') as downvotes
       FROM grievances g
       LEFT JOIN users u ON g.user_id = u.id
       WHERE g.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    const grievance = rows[0];

    // Parse JSON fields
    grievance.tags = JSON.parse(grievance.tags || '[]');
    grievance.evidence_files = JSON.parse(grievance.evidence_files || '[]');
    grievance.location = grievance.location ? JSON.parse(grievance.location) : null;

    res.json(grievance);
  } catch (error) {
    console.error('Error fetching grievance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update grievance status (for admins/moderators)
const updateGrievanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, resolution_notes, assigned_to } = req.body;

    // Check if user has permission to update
    if (!['admin', 'moderator', 'government'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    await pool.execute(
      `UPDATE grievances 
       SET status = ?, priority = ?, resolution_notes = ?, assigned_to = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, priority, resolution_notes, assigned_to, id]
    );

    res.json({ message: 'Grievance status updated successfully' });
  } catch (error) {
    console.error('Error updating grievance status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vote on grievance
const voteGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote_type } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;

    // Check if user already voted
    const [existingVote] = await pool.execute(
      'SELECT * FROM grievance_votes WHERE grievance_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingVote.length > 0) {
      // Update existing vote
      await pool.execute(
        'UPDATE grievance_votes SET vote_type = ? WHERE grievance_id = ? AND user_id = ?',
        [vote_type, id, userId]
      );
    } else {
      // Create new vote
      await pool.execute(
        'INSERT INTO grievance_votes (grievance_id, user_id, vote_type) VALUES (?, ?, ?)',
        [id, userId, vote_type]
      );
    }

    res.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Error voting on grievance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get grievance statistics
const getGrievanceStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_grievances,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN risk_level = 'critical' THEN 1 END) as critical_risk,
        COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk,
        COUNT(CASE WHEN category = 'privacy_breach' THEN 1 END) as privacy_breaches,
        COUNT(CASE WHEN category = 'security_vulnerability' THEN 1 END) as security_issues
      FROM grievances
    `);

    const [categoryStats] = await pool.execute(`
      SELECT category, COUNT(*) as count
      FROM grievances
      GROUP BY category
      ORDER BY count DESC
    `);

    res.json({
      overview: stats[0],
      category_breakdown: categoryStats,
    });
  } catch (error) {
    console.error('Error fetching grievance stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getGrievances,
  submitGrievance,
  getGrievanceById,
  updateGrievanceStatus,
  voteGrievance,
  getGrievanceStats,
};
