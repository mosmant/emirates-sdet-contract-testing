const { Verifier } = require('@pact-foundation/pact');
const path = require('path');

describe('Backend Provider Verification for Frontend Consumer', () => {
  const PROVIDER_BASE_URL = 'http://localhost:3000';

  it('should verify the frontend consumer contract against the running backend', async () => {
    console.log(' Starting Backend Provider Verification for Frontend Consumer...');

    const opts = {
      provider: 'backend-provider',
      providerBaseUrl: PROVIDER_BASE_URL,
      pactFilesOrDirs: [
        path.resolve(__dirname, '../../frontend/pacts/frontend-consumer-backend-provider.json')
      ],
      logLevel: 'info',
      requestFilter: (req, res, next) => {
        console.log(` Verifying Frontend Contract: ${req.method} ${req.path}`);
        next();
      },
      stateHandlers: {
        // Frontend consumer states - matching exactly what's in the pact file
        'apps exist in backend': () => {
          console.log(' State Handler: Setting up "apps exist in backend"');
          // In a real scenario, you might seed test data here
          return Promise.resolve();
        },
        'searchable apps exist in backend': () => {
          console.log(' State Handler: Setting up "searchable apps exist in backend"');
          // Setup data that can be searched
          return Promise.resolve();
        },
        'app appOne exists in backend': () => {
          console.log('🎭 State Handler: Setting up "app appOne exists in backend"');
          // Ensure appOne exists in the backend
          return Promise.resolve();
        },
        'app appOne exists for update in backend': () => {
          console.log(' State Handler: Setting up "app appOne exists for update in backend"');
          // Ensure appOne exists and is ready for update
          return Promise.resolve();
        },
        'app appOne exists for deletion in backend': () => {
          console.log(' State Handler: Setting up "app appOne exists for deletion in backend"');
          // Ensure appOne exists and can be deleted
          return Promise.resolve();
        },
        'backend is healthy': () => {
          console.log(' State Handler: Setting up "backend is healthy"');
          // Ensure backend health endpoint is working
          return Promise.resolve();
        }
      },
      // Add timeout for verification
      timeout: 30000
    };

    try {
      console.log('⏳ Verifying Frontend Consumer Pact contract...');
      console.log(`📋 Contract file: ${opts.pactFilesOrDirs[0]}`);
      
      await new Verifier(opts).verifyProvider();
      console.log(` Frontend Consumer Pact verification completed successfully against ${PROVIDER_BASE_URL}`);
    } catch (error) {
      console.error('Frontend Consumer Pact verification failed:', error);
      
      // More detailed error information
      if (error.message) {
        console.error('Error message:', error.message);
      }
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
      
      throw error;
    } finally {
      console.log(' Frontend Consumer Pact verification process finished.');
    }
  });

  // Optional: Add a test to verify the pact file exists and is readable
  it('should have a valid pact file', async () => {
    const fs = require('fs');
    const pactFilePath = path.resolve(__dirname, '../../frontend/pacts/frontend-consumer-backend-provider.json');
    
    expect(fs.existsSync(pactFilePath)).toBe(true);
    
    const pactContent = JSON.parse(fs.readFileSync(pactFilePath, 'utf8'));
    
    expect(pactContent.consumer.name).toBe('frontend-consumer');
    expect(pactContent.provider.name).toBe('backend-provider');
    expect(pactContent.interactions).toBeDefined();
    expect(pactContent.interactions.length).toBeGreaterThan(0);
    
    console.log(` Pact file contains ${pactContent.interactions.length} interactions`);
  });
}); 
