const assert = require('assert');
const sinon = require('sinon');
const { buildContainer } = require('./index');

describe('framework', () => {
  describe('dependencyInjection', () => {
    describe('container', () => {
      describe('buildContainer', () => {
        it('should build a container and get a service without dependencies', () => {
          const config = {
            services: {
              foo: {
                factory: sinon.stub().returns('foo'),
              },
            },
          };

          const container = buildContainer(config);

          const foo = container.get('@foo');

          assert(config.services.foo.factory.called);
          assert.equal(foo, 'foo');
        });

        it('should build a container and get a service with dependencies', () => {
          const config = {
            services: {
              foo: {
                factory: bar => `foo ${bar}`,
                dependencies: ['@bar'],
              },
              bar: {
                factory: () => 'bar',
              },
            },
          };

          const container = buildContainer(config);

          const fooBar = container.get('@foo');

          assert.equal(fooBar, 'foo bar');
        });


        it('should build a container and get a service with named dependencies', () => {
          const config = {
            services: {
              foo: {
                factory: ({ bar, baz }) => `foo ${bar} ${baz}`,
                dependencies: {
                  bar: '@bar',
                  baz: '@baz',
                },
              },
              bar: {
                factory: () => 'bar',
              },
              baz: {
                factory: () => 'baz',
              },
            },
          };

          const container = buildContainer(config);

          const fooBar = container.get('@foo');

          assert.equal(fooBar, 'foo bar baz');
        });


        it('should get parameters', () => {
          const config = {
            parameters: {
              foo: 'bar',
            },
          };

          const container = buildContainer(config);

          assert.equal(container.get('%foo'), 'bar');
        });

        it('should inject parameters', () => {
          const config = {
            services: {
              foo: {
                factory: bar => bar,
                dependencies: ['%bar'],
              },
            },
            parameters: {
              bar: 'bar',
            },
          };

          const container = buildContainer(config);

          assert.equal(container.get('@foo'), 'bar');
        });


        it('throws error if service doesn\'t exist', () => {
          const config = { services: {}, parameters: {} };

          const container = buildContainer(config);

          assert.throws(() => { container.get('@nonexistingservice'); }, Error);
        });

        it('throws error if parameter doesn\'t exist', () => {
          const config = { services: {}, parameters: {} };

          const container = buildContainer(config);

          assert.throws(() => { container.get('%non existing parameter%'); }, Error);
        });

        it('throws an error if getting not a service or parameter', () => {
          const config = { services: {}, parameters: {} };

          const container = buildContainer(config);
          assert.throws(() => { container.get('not a valid argument'); });
        });
      });

      describe('createScope', () => {
        it('should create a scope and utilize scope value', () => {
          const config = {
            services: {
              foo: {
                factory: () => () => 'foo',
              },
              bar: {
                factory: (foo, baz) => () => `${foo()} bar ${baz}`,
                dependencies: ['@foo', '#baz'],
                scopes: ['someScope'],
              },
            },
            scopeTypes: {
              someScope: ['baz'],
            },
          };

          const container = buildContainer(config);

          assert.equal(container.get('@foo')(), 'foo');

          const someScope = container.createScope('someScope', { baz: 'bazz' });

          assert.equal(someScope.get('@bar')(), 'foo bar bazz');
        });

        it('should create a multiple scopes and utilize different scope values', () => {
          const config = {
            services: {
              foo: {
                factory: () => () => 'foo',
              },
              bar: {
                factory: (foo, baz) => () => `${foo()} bar ${baz}`,
                dependencies: ['@foo', '#baz'],
                scopes: ['someScope'],
              },
            },
            scopeTypes: {
              someScope: ['baz'],
            },
          };

          const container = buildContainer(config);

          assert.equal(container.get('@foo')(), 'foo');

          const someScope = container.createScope('someScope', { baz: 'bazz' });
          const someScope2 = container.createScope('someScope', { baz: 'bazz 2' });

          assert.equal(someScope.get('@bar')(), 'foo bar bazz');
          assert.equal(someScope2.get('@bar')(), 'foo bar bazz 2');
        });
      });
    });
  });
});
