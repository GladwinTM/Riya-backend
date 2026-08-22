import Joi from 'joi';

export const configuration = () => ({
  port: Number(process.env.PORT ?? 3001),
  database: { url: process.env.DATABASE_URL },
});

export function validateEnvironment(config: Record<string, unknown>) {
  const schema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'test', 'production')
      .default('development'),
    PORT: Joi.number().port().default(3001),
    DATABASE_URL: Joi.string()
      .uri({ scheme: ['postgres', 'postgresql'] })
      .required(),
    FRONTEND_URL: Joi.string().uri().optional(),
    DASHBOARD_URL: Joi.string().uri().optional(),
    COOKIE_SECRET: Joi.string().min(32).optional(),
  }).unknown(true);
  const { error, value } = schema.validate(config, { abortEarly: false });
  if (error) throw new Error(`Environment validation failed: ${error.message}`);
  return value;
}
