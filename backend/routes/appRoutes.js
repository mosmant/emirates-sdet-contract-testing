const express = require('express');
const router = express.Router();
const DataManager = require('../utils/dataManager');

const dataManager = new DataManager();

/**
 * @swagger
 * components:
 *   schemas:
 *     AppData:
 *       type: object
 *       properties:
 *         appPath:
 *           type: string
 *           description: Application path
 *         appOwner:
 *           type: string
 *           description: Application owner
 *         isValid:
 *           type: boolean
 *           description: Application validity status
 *     Application:
 *       type: object
 *       properties:
 *         appName:
 *           type: string
 *           description: Application name
 *         appData:
 *           $ref: '#/components/schemas/AppData'
 *     SearchCriteria:
 *       type: object
 *       properties:
 *         appName:
 *           type: string
 *           description: Application name to search
 *         appOwner:
 *           type: string
 *           description: Application owner to search
 *         isValid:
 *           type: boolean
 *           description: Application validity status to search
 */

/**
 * @swagger
 * /api/apps:
 *   get:
 *     summary: Get all applications
 *     description: Retrieve all applications from the data source
 *     tags: [Applications]
 *     responses:
 *       200:
 *         description: List of all applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *                 count:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const apps = await dataManager.getAllApps();
    res.json({
      success: true,
      data: apps,
      count: apps.length
    });
  } catch (error) {
    console.error('Error getting all apps:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve applications' 
    });
  }
});

/**
 * @swagger
 * /api/apps/search:
 *   get:
 *     summary: Search applications
 *     description: Search applications by name, owner, or validity status
 *     tags: [Applications]
 *     parameters:
 *       - in: query
 *         name: appName
 *         schema:
 *           type: string
 *         description: Application name to search
 *       - in: query
 *         name: appOwner
 *         schema:
 *           type: string
 *         description: Application owner to search
 *       - in: query
 *         name: isValid
 *         schema:
 *           type: boolean
 *         description: Application validity status to search
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *                 count:
 *                   type: integer
 *                 criteria:
 *                   $ref: '#/components/schemas/SearchCriteria'
 *       500:
 *         description: Internal server error
 */
router.get('/search', async (req, res) => {
  try {
    const { appName, appOwner, isValid } = req.query;
    const criteria = { appName, appOwner, isValid };
    
    const results = await dataManager.searchApps(criteria);
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      criteria
    });
  } catch (error) {
    console.error('Error searching apps:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to search applications' 
    });
  }
});

/**
 * @swagger
 * /api/apps/{appName}:
 *   get:
 *     summary: Get application by name
 *     description: Retrieve a specific application by its name
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: appName
 *         required: true
 *         schema:
 *           type: string
 *         description: Application name
 *     responses:
 *       200:
 *         description: Application found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 */
router.get('/:appName', async (req, res) => {
  try {
    const { appName } = req.params;
    const app = await dataManager.getAppByName(appName);
    
    if (!app) {
      return res.status(404).json({ 
        success: false,
        error: 'Application not found' 
      });
    }
    
    res.json({
      success: true,
      data: app
    });
  } catch (error) {
    console.error('Error getting app by name:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve application' 
    });
  }
});

/**
 * @swagger
 * /api/apps/{appName}:
 *   put:
 *     summary: Update application
 *     description: Update an application's owner or validity status
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: appName
 *         required: true
 *         schema:
 *           type: string
 *         description: Application name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appOwner:
 *                 type: string
 *                 description: New application owner
 *               isValid:
 *                 type: boolean
 *                 description: New validity status
 *     responses:
 *       200:
 *         description: Application updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid update data
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 */
router.put('/:appName', async (req, res) => {
  try {
    const { appName } = req.params;
    const updateData = req.body;
    
    // Validate that only allowed fields are being updated
    const allowedFields = ['appOwner', 'isValid'];
    const invalidFields = Object.keys(updateData).filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid update fields',
        message: `Only ${allowedFields.join(', ')} can be updated`,
        invalidFields
      });
    }
    
    const updatedApp = await dataManager.updateApp(appName, updateData);
    
    if (!updatedApp) {
      return res.status(404).json({ 
        success: false,
        error: 'Application not found' 
      });
    }
    
    res.json({
      success: true,
      data: updatedApp,
      message: 'App updated successfully'
    });
  } catch (error) {
    console.error('Error updating app:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update application' 
    });
  }
});

/**
 * @swagger
 * /api/apps/{appName}:
 *   delete:
 *     summary: Delete application
 *     description: Delete an application by its name
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: appName
 *         required: true
 *         schema:
 *           type: string
 *         description: Application name
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *                 message:
 *                   type: string
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:appName', async (req, res) => {
  try {
    const { appName } = req.params;
    const deletedApp = await dataManager.deleteApp(appName);
    
    if (!deletedApp) {
      return res.status(404).json({ 
        success: false,
        error: 'Application not found' 
      });
    }
    
    res.json({
      success: true,
      data: deletedApp,
      message: 'App deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting app:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete application' 
    });
  }
});

module.exports = router; 