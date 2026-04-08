function toCamel(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function transformKeys(obj) {
  if (Array.isArray(obj)) return obj.map(transformKeys);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamel(k), transformKeys(v)])
    );
  }
  return obj;
}

function camelCaseResponse(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body && typeof body === 'object') {
      body = transformKeys(body);
    }
    return originalJson(body);
  };
  next();
}

module.exports = camelCaseResponse;
