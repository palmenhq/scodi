const helpers = require('./helpers');
const validation = require('./validation');

const buildContainer = (config) => {
  const serviceDefinitions = helpers.setServicesDefaults(config.services || {});
  const parameters = config.parameters || {};
  const scopeTypes = config.scopeTypes || {};

  const getParameter = (parameter) => {
    const parameterName = helpers.getParameterNameFromDeclaration(parameter);
    if (parameters[parameterName] === undefined) {
      throw new Error(`The parameter "${parameter}" deos not exist`);
    }

    return parameters[parameterName];
  };

  const createScope = (scope, scopeConfig) => {
    const instantiatedSingletonServices = {};

    const instantiateService = (serviceName, serviceDefinition, callFactory) => {
      try {
        const instantiatedService = callFactory(serviceDefinition);
        if (helpers.isSingleton(serviceDefinition)) {
          instantiatedSingletonServices[serviceName] = instantiatedService;
        }
        return instantiatedService;
      } catch (e) {
        const error = new Error(`Error instantiating "${serviceName}": ${e.message}`);
        error.stack = e.stack;
        throw error;
      }
    };

    const getService = (service) => {
      const serviceName = helpers.getServiceNameFromDeclaration(service);

      if (serviceDefinitions[serviceName] === undefined) {
        throw Error(`The service "${service}" does not exist`);
      }

      const serviceDefinition = serviceDefinitions[serviceName];

      if (!helpers.isServiceInScope(serviceDefinition, scope)) {
        throw new Error(`Service "@${service}" is not in the ${scope} scope`);
      }

      if (helpers.isSingleton(serviceDefinition) && instantiatedSingletonServices[serviceName]) {
        return instantiatedSingletonServices[serviceName];
      }

      if (serviceDefinition.dependencies instanceof Array) {
        // Regular dependencies
        // eslint-disable-next-line no-use-before-define
        const dependencies = serviceDefinition.dependencies.map(dependency => get(dependency, scope));
        return instantiateService(
          service,
          serviceDefinition,
          serviceToInstantiate => serviceToInstantiate.factory(...dependencies)
        );
      }

      if (typeof serviceDefinition.dependencies === 'object') {
        // Named dependencies
        const dependencies = {};
        Object.keys(serviceDefinition.dependencies).forEach((dependency) => {
          // eslint-disable-next-line no-use-before-define
          dependencies[dependency] = get(serviceDefinition.dependencies[dependency]);
        });

        return instantiateService(
          service,
          serviceDefinition,
          serviceToInstantiate => serviceToInstantiate.factory(dependencies)
        );
      }

      throw new Error(`Invalid dependency definition for service "@${serviceName}", expected Array or Object`);
    };

    const getScopeValue = (scopeValue) => {
      const scopeValueName = helpers.getScopeValueNameFromDeclaration(scopeValue);

      if (scopeConfig[scopeValueName] === undefined) {
        throw new Error(`The scope value "${scopeValue}" does not exist`);
      }


      return scopeConfig[scopeValueName];
    };

    const get = (dependency) => {
      if (helpers.isParameter(dependency)) {
        return getParameter(dependency);
      }

      if (helpers.isService(dependency)) {
        return getService(dependency);
      }

      if (helpers.isScopeValue(dependency)) {
        return getScopeValue(dependency);
      }

      throw new Error(`The requested dependency must be a service, parameter or scope value, no type given. Did you mean "@${dependency}", "%${dependency}" or "#${dependency}"?`);
    };

    validation.validateScope(scope, scopeConfig, scopeTypes);

    return { get, createScope };
  };

  validation.validateConfig(serviceDefinitions, parameters, scopeTypes);

  return createScope(helpers.SCOPE_GLOBAL, {}, []);
};

module.exports = { buildContainer };
