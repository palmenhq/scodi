const assert = require('assert');

const { SCOPE_GLOBAL } = require('./helpers');
const validation = require('./validation');
const errors = require('./errors');

describe('framework', () => {
  describe('dependencyInjection', () => {
    describe('container', () => {
      describe('validateConfig', () => {
        it('throws error if service\'s factory is not a function', () => {
          const services = { foo: {} };

          assert.throws(
            () => { validation.validateConfig(services, {}, {}); },
            errors.FactoryIsNotAFunctionError
          );
        });

        it('throws error if service is both global and scoped', () => {
          const services = {
            foo: {
              factory: () => {},
              scopes: [SCOPE_GLOBAL, 'someScope'],
            },
          };
          const scopes = { someScope: [] };

          assert.throws(
            () => { validation.validateConfig(services, {}, scopes); },
            errors.GlobalAndScopedServiceError
          );
        });

        it('throws error if service belongs to an undefined scope', () => {
          const services = {
            foo: {
              factory: () => {},
              scopes: ['unknownScope'],
            },
          };
          const scopes = {};

          assert.throws(
            () => { validation.validateConfig(services, {}, scopes); },
            errors.UndefinedScopeBeloningError
          );
        });

        it('throws error if service is dependent on a scope value but is in the global scope', () => {
          const services = {
            foo: {
              factory: () => {},
              dependencies: ['#foo'],
              scopes: [SCOPE_GLOBAL],
            },
          };
          const scopes = { someScope: ['foo'] };

          assert.throws(
            () => { validation.validateConfig(services, {}, scopes); },
            errors.ScopedValueDependencyFromGlobalScopeError
          );
        });

        it('throws error if service is dependent on a scope value which is not in any of its scopes', () => {
          const services = {
            foo: {
              factory: () => {},
              dependencies: ['#foo'],
              scopes: ['someOtherScope'],
            },
          };
          const scopes = { someScope: ['foo'], someOtherScope: [] };

          assert.throws(
            () => { validation.validateConfig(services, {}, scopes); },
            errors.NonExistingScopeValueDependencyError
          );
        });

        it('throws an error if trying to build container with service dependent on non-existing service', () => {
          const services = {
            foo: {
              factory: () => {},
              dependencies: ['@non-existing-service'],
              scopes: [SCOPE_GLOBAL],
            },
          };

          assert.throws(
            () => { validation.validateConfig(services, {}, {}); },
            errors.NonExistingServiceDependencyError
          );
        });

        it('throws an error if trying to build container with service dependent on non-existing parameter', () => {
          const services = {
            foo: {
              factory: () => {},
              dependencies: ['%non-existing-parameter'],
              scopes: [SCOPE_GLOBAL],
            },
          };

          assert.throws(
            () => { validation.validateConfig(services, {}, {}); },
            errors.NonExistingParameterDependencyError
          );
        });

        it('throws an error if trying to build container with service dependent on invalid dependency declaration', () => {
          const services = {
            foo: {
              factory: () => {},
              dependencies: ['invalid declaration'],
              scopes: [SCOPE_GLOBAL],
            },
          };

          assert.throws(
            () => { validation.validateConfig(services, {}, {}); },
            errors.InvalidDependencyDeclarationError
          );
        });

        it('throws an error when a service is dependent on a service from a different scope', () => {
          const services = {
            foo: {
              factory: () => {},
              dependencies: [],
              scopes: ['someScope'],
            },
            bar: {
              factory: () => {},
              dependencies: ['@foo'],
              scopes: ['someOtherScope'],
            },
          };
          const scopes = { someScope: [], someOtherScope: [] };

          assert.throws(
            () => { validation.validateConfig(services, {}, scopes); },
            errors.DependencyNotAccessibleInScopeError
          );
        });

        it('throws an error if trying to build container with circular reference', () => {
          const services = {
            foo: {
              factory: () => {},
              dependencies: ['@bar'],
              scopes: [SCOPE_GLOBAL],
            },
            bar: {
              factory: () => {},
              dependencies: ['@foo'],
              scopes: [SCOPE_GLOBAL],
            },
          };

          assert.throws(
            () => { validation.validateConfig(services, {}, {}); },
            errors.CircularDependencyError
          );
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
