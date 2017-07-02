function FactoryIsNotAFunctionError(serviceName) {
  this.message = `The service "${serviceName}"'s factory is not a function`;
}
FactoryIsNotAFunctionError.prototype = Object.create(Error.prototype);

function GlobalAndScopedServiceError(serviceName) {
  this.message = `The service "@${serviceName}" is both in the global scope and in subscope(s)`;
}
GlobalAndScopedServiceError.prototype = Object.create(Error.prototype);

function UndefinedScopeBeloningError(serviceName, scope) {
  this.message = `The service "@${serviceName}" belongs to an undefined scope "${scope}"`;
}
UndefinedScopeBeloningError.prototype = Object.create(Error.prototype);

function ScopedValueDependencyFromGlobalScopeError(serviceName, dependency) {
  this.message = `The service "@${serviceName} as a dependency on the scope value "${dependency}", but is in the global scope`;
}
ScopedValueDependencyFromGlobalScopeError.prototype = Object.create(Error.prototype);

function NonExistingScopeValueDependencyError(serviceName, dependency) {
  this.message = `The service "@${serviceName}" is dependent on a non-existsing scope value "${dependency}"`;
}
NonExistingScopeValueDependencyError.prototype = Object.create(Error.prototype);

function InvalidDependencyDeclarationError(serviceName, dependency) {
  this.message = `The service "@${serviceName}" has an invalid dependency declaration (must be a service, parameter, or scope value, found "${dependency}")`;
}
InvalidDependencyDeclarationError.prototype = Object.create(Error.prototype);

function NonExistingServiceDependencyError(serviceName, dependency) {
  this.message = `The service "@${serviceName}" is dependent on a non-existing service "${dependency}"`;
}
NonExistingServiceDependencyError.prototype = Object.create(Error.prototype);

function NonExistingParameterDependencyError(serviceName, dependency) {
  this.message = `The service "@${serviceName}" is dependent on a non-existing parameter "${dependency}"`;
}
NonExistingParameterDependencyError.prototype = Object.create(Error.prototype);

function DependencyNotAccessibleInScopeError(serviceName, dependency) {
  this.message = `The service "@${serviceName}" is dependent on the service "${dependency}", which is not accessible in the current scope`;
}
DependencyNotAccessibleInScopeError.prototype = Object.create(Error.prototype);

function CircularDependencyError(serviceName, dependency) {
  this.message = `Circular dependency detected! (The service "@${serviceName}" is dependent on "${dependency}", which depends on "@${serviceName}")`;
}
CircularDependencyError.prototype = Object.create(Error.prototype);

module.exports = {
  FactoryIsNotAFunctionError,
  GlobalAndScopedServiceError,
  UndefinedScopeBeloningError,
  ScopedValueDependencyFromGlobalScopeError,
  InvalidDependencyDeclarationError,
  NonExistingScopeValueDependencyError,
  NonExistingServiceDependencyError,
  NonExistingParameterDependencyError,
  DependencyNotAccessibleInScopeError,
  CircularDependencyError,
};
