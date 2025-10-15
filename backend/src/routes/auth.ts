import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  await authController.register(req, res);
});

/**
 * @route POST /auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', async (req, res) => {
  await authController.login(req, res);
});

/**
 * @route GET /auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  await authController.getMe(req, res);
});

/**
 * @route PUT /auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  await authController.updateProfile(req, res);
});

/**
 * @route PUT /auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
  await authController.changePassword(req, res);
});

/**
 * @route POST /auth/verify-token
 * @desc Verify JWT token validity
 * @access Public
 */
router.post('/verify-token', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Token is required'
      });
      return;
    }

    const decoded = AuthController.verifyToken(token);
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: decoded.id,
          email: decoded.email,
          username: decoded.username
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

/**
 * @route GET /auth/health
 * @desc Check authentication service health
 * @access Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
