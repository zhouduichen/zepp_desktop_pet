const path = require('path');
const _resolve = path.resolve;
path.resolve = function () {
  var args = [];
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i] != null ? arguments[i] : '');
  }
  return _resolve.apply(null, args);
};
