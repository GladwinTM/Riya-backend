import Joi from 'joi';

export const configuration = () => ({
  port: Number(process.env.PORT ?? 3001),

  database: {
    url: process.env.DATABASE_URL,
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    jwksUrl: process.env.SUPABASE_JWKS_URL,
  },
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
    SUPABASE_URL: Joi.string().uri().optional(),
    SUPABASE_PUBLISHABLE_KEY: Joi.string().optional(),
    SUPABASE_SECRET_KEY: Joi.string().optional(),
    SUPABASE_JWKS_URL: Joi.string().uri().optional(),
  }).unknown(true);
  const { error, value } = schema.validate(config, { abortEarly: false });
  if (error) throw new Error(`Environment validation failed: ${error.message}`);
  return value;
}
