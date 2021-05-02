const Sentry = require('@sentry/node');

const { SENTRY_DSN } = process.env;

Sentry.init({
  dsn: SENTRY_DSN,
});

exports.exit = async error => {
  Sentry.captureException(error);
  await Sentry.flush();

  console.error(error);
  process.exit(1);
};
