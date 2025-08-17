const { Pact } = require('@pact-foundation/pact');
const path = require('path');

describe('Frontend → Backend Consumer Contract Tests', () => {
  const BASE_PORT = 3010; // Starting port for tests
  let portCounter = 0;

  const createProvider = (testName) => {
    const port = BASE_PORT + portCounter++;
    return new Pact({
      consumer: 'frontend-consumer',
      provider: 'backend-provider',
      port: port,
      log: path.resolve(process.cwd(), 'logs', `frontend-backend-${testName}.log`),
      dir: path.resolve(process.cwd(), 'pacts'),
      logLevel: 'INFO'
    });
  };

  describe('GET /api/apps - Retrieve All Apps', () => {
    it('should successfully fetch all apps from backend', async () => {
      console.log('🧪 Testing Frontend → Backend: GET /api/apps');
      
      const provider = createProvider('get-all-apps');
      
      await provider.setup();

      const interaction = {
        state: 'apps exist in backend',
        uponReceiving: 'a frontend request to load all apps from backend',
        withRequest: {
          method: 'GET',
          path: '/api/apps',
          headers: {
            'Accept': 'application/json'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            success: true,
            data: [
              {
                appName: 'appOne',
                appData: {
                  appPath: '/appSix',
                  appOwner: 'Osman',
                  isValid: true
                }
              },
              {
                appName: 'appTwo',
                appData: {
                  appPath: '/appTwo',
                  appOwner: 'Emirates',
                  isValid: false
                }
              }
            ],
            count: 2
          }
        }
      };

      await provider.addInteraction(interaction);

      const response = await fetch(`http://localhost:${provider.opts.port}/api/apps`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].appName).toBe('appOne');
      expect(data.data[0].appData.appOwner).toBe('Osman');
      expect(data.count).toBe(2);
      
      console.log('✅ Frontend → Backend: All apps fetched successfully');
      
      await provider.verify();
      await provider.finalize();
    });
  });

  describe('GET /api/apps/search - Search Apps by Criteria', () => {
    it('should successfully search apps by appName', async () => {
      console.log('🧪 Testing Frontend → Backend: GET /api/apps/search');
      
      const provider = createProvider('search-by-name');
      
      await provider.setup();

      const interaction = {
        state: 'searchable apps exist in backend',
        uponReceiving: 'a frontend search request by appName to backend',
        withRequest: {
          method: 'GET',
          path: '/api/apps/search',
          headers: {
            'Accept': 'application/json'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            success: true,
            data: [
              {
                appName: 'appOne',
                appData: {
                  appPath: '/appSix',
                  appOwner: 'Osman',
                  isValid: true
                }
              }
            ],
            count: 1,
            criteria: {
              appName: 'app'
            }
          }
        }
      };

      await provider.addInteraction(interaction);

      const response = await fetch(`http://localhost:${provider.opts.port}/api/apps/search`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].appData.appOwner).toBe('Osman');
      expect(data.count).toBe(1);
      
      console.log('✅ Frontend → Backend: Search completed successfully');
      
      await provider.verify();
      await provider.finalize();
    });
  });

  describe('PUT /api/apps/:appName - Update App Record', () => {
    it('should successfully update app owner (dynamic field)', async () => {
      console.log('🧪 Testing Frontend → Backend: PUT /api/apps/appOne (update owner)');
      
      const provider = createProvider('update-owner');
      
      await provider.setup();

      const interaction = {
        state: 'app appOne exists for update in backend',
        uponReceiving: 'a frontend request to update app owner in backend',
        withRequest: {
          method: 'PUT',
          path: '/api/apps/appOne',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: {
            appOwner: 'NewOwner',
            isValid: true
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            success: true,
            data: {
              appName: 'appOne',
              appData: {
                appPath: '/appSix',
                appOwner: 'NewOwner',
                isValid: true
              }
            },
            message: 'App updated successfully'
          }
        }
      };

      await provider.addInteraction(interaction);

      const updateData = {
        appOwner: 'NewOwner',
        isValid: true
      };

      const response = await fetch(`http://localhost:${provider.opts.port}/api/apps/appOne`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.appData.appOwner).toBe('NewOwner');
      expect(data.data.appData.isValid).toBe(true);
      // AppName and AppPath should remain unchanged (fixed fields)
      expect(data.data.appName).toBe('appOne');
      expect(data.data.appData.appPath).toBe('/appSix');
      expect(data.message).toBe('App updated successfully');
      
      console.log('✅ Frontend → Backend: App owner updated successfully');
      
      await provider.verify();
      await provider.finalize();
    });
  });

  describe('DELETE /api/apps/:appName - Delete App Record', () => {
    it('should successfully delete an app record', async () => {
      console.log('🧪 Testing Frontend → Backend: DELETE /api/apps/appOne');
      
      const provider = createProvider('delete-app');
      
      await provider.setup();

      const interaction = {
        state: 'app appOne exists for deletion in backend',
        uponReceiving: 'a frontend request to delete app from backend',
        withRequest: {
          method: 'DELETE',
          path: '/api/apps/appOne',
          headers: {
            'Accept': 'application/json'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            success: true,
            message: 'App appOne deleted successfully'
          }
        }
      };

      await provider.addInteraction(interaction);

      const response = await fetch(`http://localhost:${provider.opts.port}/api/apps/appOne`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.message).toBe('App appOne deleted successfully');
      
      console.log('✅ Frontend → Backend: App deleted successfully');
      
      await provider.verify();
      await provider.finalize();
    });
  });

  describe('GET /health - Backend Health Check', () => {
    it('should successfully check backend health', async () => {
      console.log('🧪 Testing Frontend → Backend: GET /health');
      
      const provider = createProvider('health-check');
      
      await provider.setup();

      const interaction = {
        state: 'backend is healthy',
        uponReceiving: 'a frontend health check request to backend',
        withRequest: {
          method: 'GET',
          path: '/health',
          headers: {
            'Accept': 'application/json'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            status: 'UP',
            service: 'Backend Service',
            timestamp: '2024-01-01T00:00:00Z'
          }
        }
      };

      await provider.addInteraction(interaction);

      const response = await fetch(`http://localhost:${provider.opts.port}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.status).toBe('UP');
      expect(data.service).toBe('Backend Service');
      expect(data.timestamp).toBeDefined();
      
      console.log('✅ Frontend → Backend: Health check successful');
      
      await provider.verify();
      await provider.finalize();
    });
  });
}); 