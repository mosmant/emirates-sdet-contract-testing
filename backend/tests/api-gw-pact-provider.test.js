const { Verifier } = require('@pact-foundation/pact');
const path = require('path');

describe('Pact Provider Verification', () => {
  const PROVIDER_BASE_URL = 'http://localhost:3000';

  it('should verify the consumer contract against the running backend', async () => {
    console.log('🔹 Starting Pact verification...');

    const opts = {
      provider: 'backend-provider',
      providerBaseUrl: PROVIDER_BASE_URL,
      pactFilesOrDirs: [
        path.resolve(__dirname, '../../api-gateway/target/pacts/api-gateway-backend-provider.json')
      ],
      logLevel: 'info',
      requestFilter: (req, res, next) => next(),
      stateHandlers: {
        'apps exist': () => Promise.resolve(),
        'apps exist for search': () => Promise.resolve(),
        'app appOne exists': () => Promise.resolve(),
        'backend is healthy': () => Promise.resolve()
      }
    };

    try {
      console.log('⏳ Verifying Pact contract...');
      await new Verifier(opts).verifyProvider();
      console.log(`✅ Pact verification completed successfully against ${PROVIDER_BASE_URL}`);
    } catch (error) {
      console.error('❌ Pact verification failed:', error);
      throw error;
    } finally {
      console.log('🔹 Pact verification process finished.');
    }
  });
});
