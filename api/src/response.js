const ok = (res, data, status = 200) =>
  res.status(status).json({ data, errors: [], status });

const fail = (res, errors, status = 400) =>
  res.status(status).json({
    data: null,
    errors: Array.isArray(errors) ? errors : [String(errors)],
    status,
  });

module.exports = { ok, fail };
