import { deepStrictEqual, ok } from 'node:assert';
import { describe, before, beforeEach, afterEach, it } from 'node:test';

const BASE_URL = 'http://localhost:5555';

describe('API Products Test Suite', () => {
  before(async () => {
    try {
      console.log('Starting server...');
      const { server } = await import('../api');
      await new Promise((resolve) => server.once('listening', resolve));
      console.log('Server started successfully!');
    } catch (error) {
      console.error('Error starting server:', error);
    }
  });

  afterEach(async () => {
    const { server } = require('../api');
    await new Promise((resolve) => server.close(resolve));
    console.log('Server closed successfully!');
  });

  async function makeRequest(url: string, data: any): Promise<any> {
    try {
      const request = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          authorization: _globalToken,
          'Content-Type': 'application/json',
        },
      });

      deepStrictEqual(request.status, 200);
      return request.json();
    } catch (error) {
      console.error('Error making request:', error);
      throw error;
    }
  }

  let _globalToken: string;

  beforeEach(async () => {
    try {
      const input = {
        user: 'vitordias',
        password: '123',
      };

      const data = await makeRequest(`${BASE_URL}/login`, input);
      ok(data.token, 'token should be present');
      _globalToken = data.token;
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  });

  it('it should create a premium product', async () => {
    const input = {
      description: 'pasta de dente',
      price: 101,
    };
    const data = await makeRequest(`${BASE_URL}/products`, input);
    deepStrictEqual(data.category, 'premium');
  });

  it('it should create a regular product', async () => {
    const input = {
      description: 'escova de dente',
      price: 70,
    };
    const data = await makeRequest(`${BASE_URL}/products`, input);
    deepStrictEqual(data.category, 'regular');
  });

  it('it should create a basic product', async () => {
    const input = {
      description: 'fio',
      price: 2,
    };
    const data = await makeRequest(`${BASE_URL}/products`, input);
    deepStrictEqual(data.category, 'basic');
  });
});
