# Scodi - Scoped Dependency Injection Container

A Dependency Injection Container/Service Locator for JavaScript.

*Note:* When reading this, it's assumed you're familiar with
[IoC](https://en.wikipedia.org/wiki/Inversion_of_control) and [DI](https://en.wikipedia.org/wiki/Dependency_injection).

Scodi provides easy dependency management with 3 basic concepts - services, parameters and scopes.

## Basic usage

```javascript
const { buildContainer } = require('scodi');

const getHelloPhrase = () => 'Hello';

const config = {
  services: {
    getHelloPhrase: {
      // A factory must always wrap the returned service in a function, even when there are no dependencies
      factory: (/* no dependencies */) => getHelloPhrase,
    },
    sayHi: {
      factory: (getPhrase, what) => () => `${getPhrase()} ${what}!`,
      // The specified dependencies are injected to the factory in the order they're defined here
      dependencies: ['@getHelloPhrase', '%whatToSayHiTo'],
    },
  },

  parameters: {
    whatToSayHiTo: 'world',
  },

  scopes: {},
}

const container = buildContainer(config);

const sayHi = container.get('@sayHi');

sayHi() // "Hello world!"
```

## Services

A **service** is a function that can have dependencies. A dependency can be another *service*, a *parameter*, or a
  *scope value* (if the service is in a scope that has that value). Services are created with *factory functions*, which
  get dependencies as parameters. Services always belong to a *scope* (however the default is the special scope called
  `SCOPE_GLOBAL` - meaning it's accessible from anywhere). A service can only depend on services or scope values that
  are accessible from the current scope. Services are prefixed with `@`. They are defined in the `services` prop in the config.

### Configuration
  - `factory` - `Function` that instantiates the service, meaning it should take dependencies as parameters and return the service
    function. Required.
  - `dependencies` - `Array`|`Object` that takes the dependencies that'll be passed to the factory. Use array to get dependencies as
    anonymous parameters, and object to get named dependencies. Optional, defaults to empty array.
  - `scopes` - `Array[String]` of scope types the service belongs to. Optional, defaults to `[SCOPE_GLOBAL]` (meaning it's accessible from
    all scopes).
  - `type` - `String` - should be `TYPE_SINGLETON` or `TYPE_EVERY_INSTANCE`. Defines how the service should be instantiated.
    `TYPE_SINGLETON` will return the same instance every time the service is requested, and `TYPE_EVERY_INSTANCE` will return a
    new instance of the service every time. Optional, defaults to `TYPE_SINGLETON`.

The default service configuration:

```javascript
{
  factory: () => {}, // REQUIRED
  dependencies: [],
  type: TYPE_SINGLETON,
  scopes: [SCOPE_GLOBAL],
}
```

Example:

```javascript
const { buildContainer } = require('scodi');

const createBar = baz => () => {
  console.log('bar says: ', baz);
};

const createFoo = bar => (something) => {
  bar();

  console.log('foo says: ', something);
};

const config = {
  services: {
    foo: {
      factory: createFoo,
      dependencies: ['@bar'],
    },

    bar: {
      factory: createBar,
      dependencies: ['%baz'],
    },
  },

  parameters: {
    baz: 'whatever',
  },

  scopes: {}, // See section Scopes to learn what this is
}

const container = buildContainer(config);

const foo = container.get('@foo');
const bar = container.get('@bar');

foo('1') // "bar says: whatever, foo says: 1"
foo('1337') // "bar says: whatever, foo says: 1337"
bar() // "bar says: whatever"
```

#### Anonymous vs named dependencies

Dependencies can be defined in two ways; anonymous and named. With anonymous dependencies, you simply pass an array of dependencies, which
  you will later receive as function parameters in your factory. This can, however, become inconvenient if your service has many
  dependencies (since you have to keep track of which order you pass them in). If this is the case you can use named
  dependencies like so:

```javascript
{
  services: {
    // Anonymous dependencies
    serviceWithAnonymousDependencies: {
      factory: (foo, bar, baz) => () => { foo(); bar(); baz(); },
      dependencies: ['@foo', '@bar', '@baz'],
    },

    // Named dependencies
    serviceWithNamedDependencies: {
      factory: (deps) => () => { deps.foo(); deps.bar(); deps.baz(); },
      dependencies: {
        foo: '@foo',
        bar: '@bar',
        baz: '@baz',
      },
    },

    // Decompose!
    serviceWithDepcomposedNamedDependencies: {
      factory: ({ foo, bar, baz }) => () => { foo(); bar(); baz(); },
      dependencies: {
        foo: '@foo',
        bar: '@bar',
        baz: '@baz',
      },
    },

    // ...
  },
}
```

#### Singleton vs every instance

```javascript
const { buildContainer, TYPE_EVERY_INSTANCE } = require('scodi');

const config = {
  services: {
    singleton: {
      factory: (random) => {
        const randomValue = random(); // Save value in factory

        return () => randomValue;
      },
      dependencies: ['@random'],
      // No need to specify `type: TYPE_SINGLETON`, since it's the default
    },
    everyInstance: {
      factory: (random) => {
        const randomValue = random(); // Save value in factory

        return () => randomValue;
      },
      dependencies: ['@random'],
      type: TYPE_EVERY_INSTANCE,
    },
    random: {
      factory: () => Math.random,
    },
  },

  parameters: {},
  scopes: {},
};

const container = buildContainer(config)

container.get('@singleton')(); // i.e. 0.33941396275422875
container.get('@singleton')(); // same value (0.33941396275422875)

container.get('@everyInstance')(); // i.e. 0.808203227270367
container.get('@everyInstance')(); // another value, i.e. 0.7816774947232212
```


## Parameters

A **parameter** is value that does not have any dependencies (so basically a key-value object). It should mainly be
  used for configuration etc. Parameters are always in the global scope. Parameters are prefixed with `%`.

Example:

```javascript
const { buildContainer } = require('scodi');

const config = {
  services: {
    foo: {
      factory: bar => () => bar,
      dependencies: ['%bar'],
    },
  },

  parameters: {
    bar: 'whatever',
  },

  scopes: {},
}

const container = buildContainer(config);

container.get('%bar') // "whatever"
container.get('@foo')() // "whatever"
```

## Scopes

A **scope** is basically new instance of the container, created during runtime, that has *scope values*. Scope values are like parameters, but
  are passed when creating the scope (during runtime), meaning they are very useful for i.e. passing the current request's user or locale as a
  dependency instead of a regular function parameter to the services. Scope values are prefixed with `#`, and scope types are defined in the `scopes`
  props in the config. A scope type simply defines which scope value must be passed when creating the scope.

A service within a subscope can depend on a service from the global scope, or the same scope, but a service from the global scope can not depend on
  a service from a subscope. In the below example the service "@bar" is dependent on "@foo", but "@foo" could not be dependent on "@bar". Also,
  a service in the global scope can not be dependent on a scope value, meaning "@foo" can not depend on "#baz".

Example usage:

```javascript
const { buildContainer } = require('scodi');

const config = {
  services: {
    foo: {
      factory: () => () => 'im foo!',
    },
    bar: {
      factory: (foo, baz) => () => `${foo()} - bar says: ${baz}`,
      dependencies: ['@foo', '#baz'],
      scopes: ['someScope'], // Specify it should be in the "someScope" scope
    },
  },

  parameters: {},

  scopes: {
    // Define that the scope type "someScope" must be created with the value "baz"
    someScope: ['baz'],
  },
};

const container = buildContainer(config);

// Normal container .get
const foo = container.get('@foo');
foo(); // "im foo!"

container.get('@bar'); // Error thrown! 'Service "@bar" is not in the global scope'

conatiner.createScope('someScope') // Error thrown! 'Missing scope value "#baz"'

const scope1container = container.createScope('someScope', { baz: 'a value' });
const scope2container = container.createScope('someScope', { baz: 'another value' });

scope1container.get('@foo')() // "im foo!", returns the same instance as from the global scope, meaning container.get('@foo') === scope1container.get('@foo')
scope1container.get('@bar')() // "im foo! - bar says: a value"
scope2container.get('@bar')() // "im foo! - bar says: another value"
```
