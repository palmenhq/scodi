const assert = require('assert');

const validation = require('./validation');

describe('framework', () => {
  describe('dependencyInjection', () => {
    describe('container', () => {
      describe('validateConfig', () => {
        it('throws error if service\'s factory is not a function', () => {
          const config = { services: { foo: {} } };

          assert.throws(() => { validation.validateConfig(config); });
        });

        it('throws an error if trying to build container with service dependent on non-existing service', () => {
          const config = {
            services: {
              foo: {
                factory: () => {},
                dependencies: ['@non-existing-service'],
              },
            },
            parameters: {},
          };

          assert.throws(() => { validation.validateConfig(config); });
        });

        it('throws an error if trying to build container with service dependent on non-existing parameter', () => {
          const config = {
            services: {
              foo: {
                factory: () => {},
                dependencies: ['%non-existing-parameter%'],
              },
            },
            parameters: {},
          };

          assert.throws(() => { validation.validateConfig(config); });
        });

        it('throws an error if trying to build container with service dependent on invalid dependency declaration', () => {
          const config = {
            services: {
              foo: {
                factory: () => {},
                dependencies: ['invalid declaration'],
              },
            },
            parameters: {},
          };

          assert.throws(() => { validation.validateConfig(config); });
        });

        it('throws an error if trying to build container with circular reference', () => {
          const config = {
            services: {
              foo: {
                factory: () => {},
                dependencies: ['@bar'],
              },
              bar: {
                factory: () => {},
                dependencies: ['@foo'],
              },
            },
            parameters: {},
          };

          assert.throws(() => { validation.validateConfig(config); });
        });
      });

      describe('validateScope', () => {
        it('should throw error on undefined scope', () => {
          assert.throws(() => { validation.validateScope('undefined scope', {}, { someScope: [] }); });
        });

        it('should throw error on missing scope value', () => {
          const scopeTypes = { foo: ['bar', 'baz'] };

          assert.throws(() => {
            validation.validateScope('foo', { bar: 'some value' }, scopeTypes);
          });
        });

        it('should not throw errors on valid scope', () => {
          const scopeTypes = { foo: ['bar', 'baz'] };
          const scopeValues = { bar: 'some value', baz: 'some other value' };
          validation.validateScope('foo', scopeValues, scopeTypes);
        });

        it('should not throw errors on valid scope', () => {
          const scopeTypes = { foo: ['bar', 'baz'] };
          const scopeValues = { bar: 'some value', baz: 'some other value' };
          validation.validateScope('foo', scopeValues, scopeTypes);
        });
      });
    });
  });
});
