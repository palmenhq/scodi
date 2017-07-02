const assert = require('assert');
const helpers = require('./helpers');

describe('framework', () => {
  describe('dependencyInjection', () => {
    describe('container', () => {
      describe('helpers', () => {
        it('should check if is service', () => {
          assert(helpers.isService('@foo'));
          assert(!helpers.isService('#foo'));
        });
        it('should check if is parameter', () => {
          assert(helpers.isParameter('%foo'));
          assert(!helpers.isParameter('#foo'));
        });
        it('should check if is scope value', () => {
          assert(helpers.isScopeValue('#foo'));
          assert(!helpers.isScopeValue('%foo'));
        });

        it('should check if is singleton', () => {
          assert(helpers.isSingleton({ type: helpers.TYPE_SINGLETON }));
          assert(!helpers.isSingleton({ type: helpers.TYPE_EVERY_INSTANCE }));
        });

        it('should check if service is in scope', () => {
          assert(helpers.isServiceInScope({ scopes: ['foo', 'bar'] }, 'foo'));
          assert(!helpers.isServiceInScope({ scopes: ['foo', 'bar'] }, 'baz'));
          assert(helpers.isServiceInScope({ scopes: [helpers.SCOPE_GLOBAL] }, 'foo'));
        });

        it('should get service name from declaration', () => {
          assert.equal(helpers.getServiceNameFromDeclaration('@foo'), 'foo');
        });
        it('should get parameter name from declaration', () => {
          assert.equal(helpers.getParameterNameFromDeclaration('%foo'), 'foo');
        });
        it('should get scope value name from declaration', () => {
          assert.equal(helpers.getScopeValueNameFromDeclaration('#foo'), 'foo');
        });

        it('should get service defition with defaults', () => {
          const serviceDefinition = { factory: () => {} };
          const result = helpers.getServiceDefinitonWithDefaults(serviceDefinition);
          const expectedResult = {
            factory: serviceDefinition.factory,
            dependencies: [],
            type: helpers.TYPE_SINGLETON,
            scopes: [helpers.SCOPE_GLOBAL],
          };
          assert.deepEqual(result, expectedResult);
        });

        it('should get dependency names if dependencies are array', () => {
          const dependencies = ['@foo', '@bar'];
          const result = helpers.getDependencyNames(dependencies);

          assert.deepEqual(result, dependencies);
        });

        it('should get dependency names with named dependencies', () => {
          const dependencies = { foo: '@foo', bar: '@bar' };
          const result = helpers.getDependencyNames(dependencies);

          assert.deepEqual(result, ['@foo', '@bar']);
        });

        it('should set multiple services with defaults', () => {
          const services = {
            foo: { factory: () => {} },
            bar: { factory: () => {} },
          };
          const result = helpers.setServicesDefaults(services);
          const expectedResult = {
            foo: {
              factory: services.foo.factory,
              dependencies: [],
              type: helpers.TYPE_SINGLETON,
              scopes: [helpers.SCOPE_GLOBAL],
            },
            bar: {
              factory: services.bar.factory,
              dependencies: [],
              type: helpers.TYPE_SINGLETON,
              scopes: [helpers.SCOPE_GLOBAL],
            },
          };

          assert.deepEqual(result, expectedResult);
        });
      });
    });
  });
});
