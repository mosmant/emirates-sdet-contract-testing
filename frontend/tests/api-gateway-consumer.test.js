const { Pact } = require('@pact-foundation/pact');
const path = require('path');
const fetch = require('node-fetch');

describe('External Consumer → API Gateway Consumer Contract Tests (Real API GW)', () => {
  const BASE_PORT = 3030;
  let portCounter = 0;

  const createProvider = (testName) => {
    const port = BASE_PORT + portCounter++;
    return new Pact({
      consumer: 'external-consumer',
      provider: 'api-gateway-provider',
      port: port,
      log: path.resolve(process.cwd(), 'logs', `external-api-gateway-${testName}.log`),
      dir: path.resolve(process.cwd(), 'pacts'),
      logLevel: 'INFO'
    });
  };

  const getRealResponse = async (method, url, body) => {
    const opts = {
      method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'External-Consumer/1.0'
      }
    };
    if (body) opts.body = JSON.stringify(body);

    const response = await fetch(url, opts);
    return await response.json();
  };

  const normalizeDynamicFields = (data, pathUrl) => {
    if (!data) return data;
    if (Array.isArray(data)) return data.map((d) => normalizeDynamicFields(d, pathUrl));
    if (typeof data === 'object') {
      const copy = { ...data };
      if (pathUrl === "/health" && "timestamp" in copy) {
        delete copy.timestamp; // sadece health responseda sil
      }
      return Object.fromEntries(Object.entries(copy).map(([k, v]) => [k, normalizeDynamicFields(v, pathUrl)]));
    }
    return data;
  };

  const runInteractionTest = (testName, method, pathUrl, state, description) => {
    it(description, async () => {
      const provider = createProvider(testName);
      await provider.setup();
  
      let realData = await getRealResponse(method, `http://localhost:8080${pathUrl}`);
      realData = normalizeDynamicFields(realData, pathUrl);
  
      const interaction = {
        state,
        uponReceiving: description,
        withRequest: {
          method,
          path: pathUrl,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'External-Consumer/1.0'
          }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: realData
        }
      };

      await provider.addInteraction(interaction);

      const testResponse = await getRealResponse(method, `http://localhost:${provider.opts.port}${pathUrl}`);
      const normalizedTestResponse = normalizeDynamicFields(testResponse, pathUrl);
  
      expect(normalizedTestResponse).toEqual(realData);
  
      await provider.verify();
      await provider.finalize();
    });
  };

  describe('GET /api/apps', () => {
    runInteractionTest(
      'get-all-apps',
      'GET',
      '/api/apps',
      'apps exist and api gateway is ready',
      'should fetch all apps and update Pact file'
    );
  });

  describe('GET /api/apps/search', () => {
    runInteractionTest(
      'search-apps',
      'GET',
      '/api/apps/search',
      'searchable apps exist and api gateway is ready',
      'should search apps and update Pact file'
    );
  });

  describe('GET /health', () => {
    runInteractionTest(
      'health-check',
      'GET',
      '/health',
      'api gateway is healthy',
      'should check health and update Pact file'
    );
  });
});