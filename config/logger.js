const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'aperoland' },
    transports: [
        new transports.File({ filename: 'logs/aperoland-error.log', level: 'error' }),
        new transports.File({ filename: 'logs/aperoland-combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'prod') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

module.exports = logger;
