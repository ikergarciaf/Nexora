import pino from 'pino';

const transport = pino.transport({
  targets: [
    { target: 'pino/file', options: { destination: 1 } },
    ...(process.env.NODE_ENV === 'production'
      ? [{ target: 'pino/file', options: { destination: 'logs/app.log', mkdir: true } }]
      : []),
  ],
});

const logger = pino(
  {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    redact: {
      paths: ['req.headers.authorization', 'req.body.password', 'req.body.token', 'passwordHash'],
      censor: '[REDACTED]',
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        headers: { 'x-tenant-id': req.headers?.['x-tenant-id'] },
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
      err: pino.stdSerializers.err,
    },
  },
  transport,
);

export default logger;
