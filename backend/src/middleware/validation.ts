import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};

/**
 * Company claim validation rules
 */
export const validateCompanyClaim = [
  body('name')
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Company name must be between 2 and 255 characters')
    .trim(),
  
  body('slug')
    .notEmpty()
    .withMessage('Company slug is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Company slug must be between 2 and 255 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Company slug can only contain lowercase letters, numbers, and hyphens')
    .trim(),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  
  body('sectorTags')
    .isArray({ min: 1 })
    .withMessage('At least one sector tag is required')
    .custom((tags) => {
      if (!Array.isArray(tags)) return false;
      return tags.every(tag => typeof tag === 'string' && tag.length > 0);
    })
    .withMessage('All sector tags must be non-empty strings'),
  
  body('fundingStage')
    .isIn([
      'pre-seed', 'seed', 'series-a', 'series-b', 
      'series-c', 'series-d', 'series-e', 'ipo', 
      'acquired', 'private'
    ])
    .withMessage('Invalid funding stage'),
  
  body('investors')
    .optional()
    .isArray()
    .withMessage('Investors must be an array'),
  
  body('hqLocation')
    .optional()
    .isLength({ max: 255 })
    .withMessage('HQ location must be less than 255 characters'),
  
  body('ethicsStatementUrl')
    .optional()
    .isURL()
    .withMessage('Ethics statement URL must be a valid URL'),
  
  body('privacyPolicyUrl')
    .optional()
    .isURL()
    .withMessage('Privacy policy URL must be a valid URL'),
  
  body('logoUrl')
    .optional()
    .isURL()
    .withMessage('Logo URL must be a valid URL'),
  
  handleValidationErrors
];

/**
 * Company update validation rules
 */
export const validateCompanyUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Company name must be between 2 and 255 characters')
    .trim(),
  
  body('slug')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Company slug must be between 2 and 255 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Company slug can only contain lowercase letters, numbers, and hyphens')
    .trim(),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  
  body('sectorTags')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one sector tag is required')
    .custom((tags) => {
      if (!Array.isArray(tags)) return false;
      return tags.every(tag => typeof tag === 'string' && tag.length > 0);
    })
    .withMessage('All sector tags must be non-empty strings'),
  
  body('fundingStage')
    .optional()
    .isIn([
      'pre-seed', 'seed', 'series-a', 'series-b', 
      'series-c', 'series-d', 'series-e', 'ipo', 
      'acquired', 'private'
    ])
    .withMessage('Invalid funding stage'),
  
  body('investors')
    .optional()
    .isArray()
    .withMessage('Investors must be an array'),
  
  body('hqLocation')
    .optional()
    .isLength({ max: 255 })
    .withMessage('HQ location must be less than 255 characters'),
  
  body('ethicsStatementUrl')
    .optional()
    .isURL()
    .withMessage('Ethics statement URL must be a valid URL'),
  
  body('privacyPolicyUrl')
    .optional()
    .isURL()
    .withMessage('Privacy policy URL must be a valid URL'),
  
  body('logoUrl')
    .optional()
    .isURL()
    .withMessage('Logo URL must be a valid URL'),
  
  handleValidationErrors
];

/**
 * Company ID validation
 */
export const validateCompanyId = [
  param('id')
    .isUUID()
    .withMessage('Company ID must be a valid UUID'),
  
  handleValidationErrors
];

/**
 * Company query validation
 */
export const validateCompanyQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('ethicsScoreMin')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Ethics score minimum must be between 0 and 100'),
  
  query('fundingStage')
    .optional()
    .isIn([
      'pre-seed', 'seed', 'series-a', 'series-b', 
      'series-c', 'series-d', 'series-e', 'ipo', 
      'acquired', 'private'
    ])
    .withMessage('Invalid funding stage'),
  
  query('verified')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Verified must be true or false'),
  
  query('sector')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Sector must be between 1 and 100 characters'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Search term must be between 1 and 255 characters'),
  
  handleValidationErrors
];

/**
 * Password change validation
 */
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

/**
 * User profile validation
 */
export const validateUserProfile = [
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('First name must be between 1 and 255 characters')
    .trim(),
  
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Last name must be between 1 and 255 characters')
    .trim(),
  
  body('industry')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Industry must be between 1 and 100 characters')
    .trim(),
  
  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio must be less than 1000 characters')
    .trim(),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  
  handleValidationErrors
];

/**
 * Story creation validation rules
 */
export const validateStoryCreation = [
  body('title')
    .notEmpty()
    .withMessage('Story title is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Story title must be between 10 and 500 characters')
    .trim(),
  
  body('content')
    .notEmpty()
    .withMessage('Story content is required')
    .isLength({ min: 50, max: 10000 })
    .withMessage('Story content must be between 50 and 10000 characters')
    .trim(),
  
  body('sourceUrl')
    .optional()
    .isURL()
    .withMessage('Source URL must be a valid URL'),
  
  body('companyId')
    .optional()
    .isUUID()
    .withMessage('Company ID must be a valid UUID'),
  
  body('sectorTag')
    .notEmpty()
    .withMessage('Sector tag is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Sector tag must be between 1 and 100 characters')
    .trim(),
  
  body('impactTags')
    .isArray({ min: 1 })
    .withMessage('At least one impact tag is required')
    .custom((tags) => {
      if (!Array.isArray(tags)) return false;
      return tags.every(tag => typeof tag === 'string' && tag.length > 0 && tag.length <= 50);
    })
    .withMessage('All impact tags must be non-empty strings between 1 and 50 characters'),
  
  body('publishedAt')
    .optional()
    .isISO8601()
    .withMessage('Published date must be a valid ISO 8601 date'),
  
  handleValidationErrors
];

/**
 * Story update validation rules
 */
export const validateStoryUpdate = [
  body('title')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Story title must be between 10 and 500 characters')
    .trim(),
  
  body('content')
    .optional()
    .isLength({ min: 50, max: 10000 })
    .withMessage('Story content must be between 50 and 10000 characters')
    .trim(),
  
  body('sourceUrl')
    .optional()
    .isURL()
    .withMessage('Source URL must be a valid URL'),
  
  body('companyId')
    .optional()
    .isUUID()
    .withMessage('Company ID must be a valid UUID'),
  
  body('sectorTag')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Sector tag must be between 1 and 100 characters')
    .trim(),
  
  body('impactTags')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one impact tag is required')
    .custom((tags) => {
      if (!Array.isArray(tags)) return false;
      return tags.every(tag => typeof tag === 'string' && tag.length > 0 && tag.length <= 50);
    })
    .withMessage('All impact tags must be non-empty strings between 1 and 50 characters'),
  
  body('realityCheck')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Reality check must be less than 1000 characters')
    .trim(),
  
  body('publishedAt')
    .optional()
    .isISO8601()
    .withMessage('Published date must be a valid ISO 8601 date'),
  
  handleValidationErrors
];

/**
 * Story query validation rules
 */
export const validateStoryQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['hot', 'new', 'top', 'trending'])
    .withMessage('Sort must be one of: hot, new, top, trending'),
  
  query('sectorTag')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Sector tag must be between 1 and 100 characters'),
  
  query('companyId')
    .optional()
    .isUUID()
    .withMessage('Company ID must be a valid UUID'),
  
  query('impactTag')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Impact tag must be between 1 and 50 characters'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Search term must be between 1 and 255 characters'),
  
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),
  
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date'),
  
  handleValidationErrors
];

/**
 * Story ID validation
 */
export const validateStoryId = [
  param('id')
    .isUUID()
    .withMessage('Story ID must be a valid UUID'),
  
  handleValidationErrors
];

/**
 * Discussion validation rules
 */
export const validateDiscussion = [
  body('industry')
    .notEmpty()
    .withMessage('Industry is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Industry must be between 1 and 100 characters')
    .trim(),
  
  body('voteValue')
    .isIn(['helpful', 'harmful', 'neutral'])
    .withMessage('Vote value must be one of: helpful, harmful, neutral'),
  
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters')
    .trim(),
  
  handleValidationErrors
];

/**
 * User impact validation rules
 */
export const validateUserImpact = [
  body('job')
    .notEmpty()
    .withMessage('Job is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Job must be between 1 and 100 characters')
    .trim(),
  
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters')
    .trim(),
  
  body('techUsed')
    .isArray({ min: 1 })
    .withMessage('At least one technology must be selected')
    .custom((techUsed) => {
      if (!Array.isArray(techUsed)) return false;
      return techUsed.every(tech => typeof tech === 'string' && tech.length > 0 && tech.length <= 100);
    })
    .withMessage('All technologies must be non-empty strings between 1 and 100 characters'),
  
  body('industry')
    .notEmpty()
    .withMessage('Industry is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Industry must be between 1 and 100 characters')
    .trim(),
  
  handleValidationErrors
];

/**
 * User ID validation
 */
export const validateUserId = [
  param('id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  handleValidationErrors
];
