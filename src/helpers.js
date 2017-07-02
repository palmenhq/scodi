const TYPE_SINGLETON = 'SINGLETON';
const TYPE_EVERY_INSTANCE = 'EVERY_INSTANCE';
const SCOPE_GLOBAL = 'global';
const isService = dependency => dependency.match(/^@/);
const isParameter = dependency => dependency.match(/^%/);
const isScopeValue = dependency => dependency.match(/^#/);
const isSingleton = service => service.type === TYPE_SINGLETON;
const isServiceInScope = (service, scope) => (
  service.scopes.indexOf(scope) > -1 || service.scopes.indexOf(SCOPE_GLOBAL) > -1
);
const getServiceNameFromDeclaration = name => name.replace('@', '');
const getParameterNameFromDeclaration = name => name.replace('%', '');
const getScopeValueNameFromDeclaration = name => name.replace('#', '');
const getServiceDefinitonWithDefaults = service => Object.assign(
  {},
  {
    dependencies: [],
    type: TYPE_SINGLETON,
    scopes: [SCOPE_GLOBAL],
  },
  service
);
const getDependencyNames = (dependencies) => {
  if (dependencies instanceof Array) {
    return dependencies;
  }
  if (typeof dependencies === 'object') {
    return Object.values(dependencies);
  }

  return null;
};
const setServicesDefaults = (services) => {
  const servicesWithDefaults = {};
  Object.keys(services).forEach((serviceName) => {
    servicesWithDefaults[serviceName] = getServiceDefinitonWithDefaults(services[serviceName]);
  });

  return servicesWithDefaults;
};

module.exports = {
  TYPE_SINGLETON,
  TYPE_EVERY_INSTANCE,
  SCOPE_GLOBAL,
  isService,
  isParameter,
  isScopeValue,
  isSingleton,
  isServiceInScope,
  getServiceNameFromDeclaration,
  getParameterNameFromDeclaration,
  getScopeValueNameFromDeclaration,
  getServiceDefinitonWithDefaults,
  getDependencyNames,
  setServicesDefaults,
};
