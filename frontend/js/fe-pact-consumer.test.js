const path = require('path');
const { Pact } = require('@pact-foundation/pact');
const { Matchers } = require('@pact-foundation/pact');
const axios = require('axios');

const { eachLike, like, boolean } = Matchers;

describe('Frontend API Consumer Pact', () => {
  const provider = new Pact({
    consumer: 'frontend',
    provider: 'backend-provider',
    port: 1234,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'INFO',
  });

  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  describe('GET /apps?search=:term', () => {
    beforeAll(() =>
      provider.addInteraction({
        state: 'apps exist for search',
        uponReceiving: 'a request to search apps',
        withRequest: {
          method: 'GET',
          path: '/apps',
          query: 'search=appOne',
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: eachLike({
            AppName: like('appOne'),
            AppPath: like('/path/to/appOne'),
            Owner: like('Alice'),
            isValid: boolean(true),
          }),
        },
      })
    );

    it('returns search results', async () => {
      const response = await axios.get('http://localhost:1234/apps?search=appOne');
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            AppName: 'appOne',
            AppPath: '/path/to/appOne',
            Owner: 'Alice',
            isValid: true,
          }),
        ])
      );
    });
  });

  describe('PUT /apps/:appName', () => {
    beforeAll(() =>
      provider.addInteraction({
        state: 'app appOne exists',
        uponReceiving: 'a request to update an app',
        withRequest: {
          method: 'PUT',
          path: '/apps/appOne',
          headers: { 'Content-Type': 'application/json' },
          body: {
            Owner: 'Bob',
            isValid: false,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            AppName: 'appOne',
            AppPath: '/path/to/appOne',
            Owner: 'Bob',
            isValid: false,
          },
        },
      })
    );

    it('updates the app record', async () => {
      const response = await axios.put('http://localhost:1234/apps/appOne', {
        Owner: 'Bob',
        isValid: false,
      });
      expect(response.status).toBe(200);
      expect(response.data.Owner).toBe('Bob');
      expect(response.data.isValid).toBe(false);
    });
  });

  describe('DELETE /apps/:appName', () => {
    beforeAll(() =>
      provider.addInteraction({
        state: 'app appOne exists',
        uponReceiving: 'a request to delete an app',
        withRequest: {
          method: 'DELETE',
          path: '/apps/appOne',
        },
        willRespondWith: {
          status: 200,
        },
      })
    );

    it('deletes the app record', async () => {
      const response = await axios.delete('http://localhost:1234/apps/appOne');
      expect(response.status).toBe(200);
    });
  });
});
