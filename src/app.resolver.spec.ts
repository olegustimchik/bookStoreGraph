import { AppResolver } from './app.resolver';

describe('AppResolver', () => {
  it('returns the starter health check message', () => {
    expect(new AppResolver().healthCheck()).toBe('bookStoreGraph GraphQL is running');
  });
});
