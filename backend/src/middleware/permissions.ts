import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../../ormconfig';
import { User } from '../models/user';
import { Company } from '../models/company';
import { AuthenticatedRequest } from './auth';

/**
 * Check if user has admin privileges
 */
export const isAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user || !user.isActive) {
      res.status(403).json({
        success: false,
        message: 'User not found or inactive'
      });
      return;
    }

    // For now, check if user email contains 'admin' or has specific admin flag
    // In production, you should have a proper role system
    const isAdminUser = user.email.includes('admin') || 
                       user.username.includes('admin') ||
                       (user as any).isAdmin === true;

    if (!isAdminUser) {
      res.status(403).json({
        success: false,
        message: 'Admin privileges required'
      });
      return;
    }

    req.user = { ...req.user, isAdmin: true };
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during permission check'
    });
  }
};

/**
 * Check if user owns the company or is admin
 */
export const isCompanyOwnerOrAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const companyId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const companyRepository = AppDataSource.getRepository(Company);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user || !user.isActive) {
      res.status(403).json({
        success: false,
        message: 'User not found or inactive'
      });
      return;
    }

    // Check if user is admin
    const isAdminUser = user.email.includes('admin') || 
                       user.username.includes('admin') ||
                       (user as any).isAdmin === true;

    if (isAdminUser) {
      req.user = { ...req.user, isAdmin: true };
      next();
      return;
    }

    // Check company ownership (you can implement this based on your business logic)
    const company = await companyRepository.findOne({ where: { id: companyId } });
    if (!company) {
      res.status(404).json({
        success: false,
        message: 'Company not found'
      });
      return;
    }

    // For now, allow any authenticated user to edit (implement proper ownership later)
    // TODO: Add company ownership table or field
    // Example: if (company.ownerId !== userId) { ... }

    next();
  } catch (error) {
    console.error('Company ownership check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during permission check'
    });
  }
};

/**
 * Check if user can claim companies (rate limiting)
 */
export const canClaimCompany = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const companyRepository = AppDataSource.getRepository(Company);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user || !user.isActive) {
      res.status(403).json({
        success: false,
        message: 'User not found or inactive'
      });
      return;
    }

    // Check if user has already claimed companies recently (rate limiting)
    const recentClaims = await companyRepository
      .createQueryBuilder('company')
      .where('company.createdAt > :recentDate', {
        recentDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      })
      .getCount();

    // Limit to 3 claims per day per user
    if (recentClaims >= 3) {
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. You can claim up to 3 companies per day.'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Company claim permission check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during permission check'
    });
  }
};

/**
 * Optional authentication middleware
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
        req.user = decoded;
      } catch (error) {
        // Token is invalid, but we continue without authentication
        req.user = undefined;
      }
    }
    next();
  } catch (error) {
    next();
  }
};
