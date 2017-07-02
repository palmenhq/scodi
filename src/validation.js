const helpers = require('./helpers');

const validateConfig = (services, parameters, scopeTypes) => {
  const serviceNames = Object.keys(services);
  const scopes = Object.keys(scopeTypes);
  scopes.push(helpers.SCOPE_GLOBAL);

  serviceNames.forEach((serviceName) => {
    const serviceDefinition = services[serviceName];

    if (typeof serviceDefinition.factory !== 'function') {
      throw new Error(`The service "${serviceName}"'s factory is not a function`);
    }

    if (
      serviceDefinition.scopes.indexOf(helpers.SCOPE_GLOBAL) > -1
      && serviceDefinition.scopes.length > 1
    ) {
      throw new Error(`The service "@${serviceName}" is both in the global scope and in subscope(s)`);
    }

    serviceDefinition.scopes.forEach((scope) => {
      if (scopes.indexOf(scope) === -1) {
        throw new Error(`The service "@${serviceName}" belongs to an undefined scope "${scope}"`);
      }
    });

    const dependencies = helpers.getDependencyNames(serviceDefinition.dependencies);

    // Don't do any validation if no dependencies are found
    if (dependencies.length === 0) {
      return;
    }

    dependencies.forEach((dependency) => {
      if (
        !helpers.isService(dependency)
        && !helpers.isParameter(dependency)
        && !helpers.isScopeValue(dependency)
      ) {
        throw new Error(`The service "@${serviceName}" has an invalid dependency declaration (must be a service, parameter, or scope value, found "${dependency}")`);
      }

      if (helpers.isScopeValue(dependency)) {
        if (serviceDefinition.scopes.indexOf(helpers.SCOPE_GLOBAL) > -1) {
          throw new Error(`The service "@${serviceName} as a dependency on the scope value "${dependency}", but is in the global scope`);
        }

        const scopesThatHaveScopeValue = serviceDefinition.scopes.filter(scope => (
          scopeTypes[scope].indexOf(helpers.getScopeValueNameFromDeclaration(dependency)) > -1
        ));
        if (scopesThatHaveScopeValue.length === 0) {
          throw new Error(`The service "@${serviceName}" is dependent on a non-existsing scope value "${dependency}"`);
        }

        return;
      }

      if (helpers.isParameter(dependency)) {
        // Check so parameter exists
        if (Object.keys(parameters).indexOf(helpers.getParameterNameFromDeclaration(dependency)) === -1) {
          throw new Error(`The service "@${serviceName}" is dependent on a non-existing parameter "${dependency}"`);
        }

        return;
      }

      // The dependency is a service
      const dependencyName = helpers.getServiceNameFromDeclaration(dependency);
      const dependencyDefinition = services[dependencyName];

      // Check so service exists
      if (serviceNames.indexOf(dependencyName) === -1) {
        throw new Error(`The service "@${serviceName}" is dependent on a non-existing service "${dependency}"`);
      }

      // Check so service is in at least one of the same scopes
      const commonScopes = serviceDefinition.scopes.filter(scope => (
        dependencyDefinition.scopes.indexOf(scope) > -1
      ));
      if (commonScopes.length === 0 && dependencyDefinition.scopes[0] !== helpers.SCOPE_GLOBAL) {
        throw new Error(`The service "@${serviceName}" is dependent on the service "${dependency}", which is not accessible in the current scope`);
      }

      // Detect circular references
      const dependencyDependencies = helpers.getDependencyNames(dependencyDefinition.dependencies);
      dependencyDependencies.forEach((dependencysDependencyDeclaration) => {
        if (helpers.getServiceNameFromDeclaration(dependencysDependencyDeclaration) === serviceName) {
          throw new Error(`Circular dependency detected! (The service "@${serviceName}" is dependent on "${dependency}", which depends on "@${serviceName}")`);
        }
      });
    });
  });
};

const validateScope = (scope, scopeConfig, scopeTypes) => {
  if (scope === helpers.SCOPE_GLOBAL) {
    return;
  }

  if (scopeTypes[scope] === undefined) {
    throw new Error(`Undefined scope "${scope}"`);
  }

  scopeTypes[scope].forEach((scopeValueName) => {
    if (Object.keys(scopeConfig).indexOf(scopeValueName) === -1) {
      throw new Error(`Missing scope value "#${scopeValueName}"`);
    }
  });
};

module.exports = { validateConfig, validateScope };
