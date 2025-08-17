const fs = require('fs-extra');
const path = require('path');

const DATA_FILE_PATH = path.join(__dirname, '../../EKSdetUseCase.json');

class DataManager {
  constructor() {
    this.dataFile = DATA_FILE_PATH;
  }

  // Read all data from JSON file
  async readData() {
    try {
      const data = await fs.readJson(this.dataFile);
      return data;
    } catch (error) {
      console.error('Error reading data file:', error);
      throw new Error('Failed to read data file');
    }
  }

  // Write data to JSON file
  async writeData(data) {
    try {
      await fs.writeJson(this.dataFile, data, { spaces: 2 });
      return true;
    } catch (error) {
      console.error('Error writing data file:', error);
      throw new Error('Failed to write data file');
    }
  }

  // Find app by appName
  async findAppByAppName(appName) {
    const data = await this.readData();
    return data.find(app => app.appName === appName);
  }

  // Get app by name (alias for findAppByAppName)
  async getAppByName(appName) {
    return await this.findAppByAppName(appName);
  }

  // Get all apps
  async getAllApps() {
    return await this.readData();
  }

  // Search apps by criteria
  async searchApps(criteria) {
    const data = await this.readData();
    return data.filter(app => {
      return Object.keys(criteria).every(key => {
        if (!criteria[key]) return true; // Skip empty criteria
        if (key === 'appName') {
          return app.appName.toLowerCase().includes(criteria[key].toLowerCase());
        } else if (key === 'appOwner') {
          return app.appData.appOwner.toLowerCase().includes(criteria[key].toLowerCase());
        } else if (key === 'isValid') {
          return app.appData.isValid === (criteria[key] === 'true' || criteria[key] === true);
        }
        return true;
      });
    });
  }

  // Update app by appName
  async updateApp(appName, updateData) {
    const data = await this.readData();
    const appIndex = data.findIndex(app => app.appName === appName);
    
    if (appIndex === -1) {
      return null; // Return null instead of throwing error
    }

    // Only allow updating appOwner and isValid fields
    const allowedFields = ['appOwner', 'isValid'];
    const updatedApp = { ...data[appIndex] };
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updatedApp.appData[field] = updateData[field];
      }
    });

    data[appIndex] = updatedApp;
    await this.writeData(data);
    return updatedApp;
  }

  // Delete app by appName
  async deleteApp(appName) {
    const data = await this.readData();
    const appIndex = data.findIndex(app => app.appName === appName);
    
    if (appIndex === -1) {
      return null; // Return null instead of throwing error
    }

    const deletedApp = data[appIndex];
    data.splice(appIndex, 1);
    await this.writeData(data);
    return deletedApp;
  }

  // Validate app data structure
  validateAppData(appData) {
    const requiredFields = ['appName', 'appData'];
    const requiredAppDataFields = ['appPath', 'appOwner', 'isValid'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!appData.hasOwnProperty(field)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Check required appData fields
    for (const field of requiredAppDataFields) {
      if (!appData.appData.hasOwnProperty(field)) {
        throw new Error(`Missing required appData field: ${field}`);
      }
    }

    // Validate data types
    if (typeof appData.appName !== 'string') {
      throw new Error('appName must be a string');
    }
    if (typeof appData.appData.appPath !== 'string') {
      throw new Error('appPath must be a string');
    }
    if (typeof appData.appData.appOwner !== 'string') {
      throw new Error('appOwner must be a string');
    }
    if (typeof appData.appData.isValid !== 'boolean') {
      throw new Error('isValid must be a boolean');
    }

    return true;
  }
}

module.exports = DataManager; 