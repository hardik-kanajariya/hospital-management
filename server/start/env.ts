/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for JWT authentication
  |----------------------------------------------------------
  */
  JWT_SECRET: Env.schema.string(),
  JWT_EXPIRE: Env.schema.string(),
  JWT_REFRESH_SECRET: Env.schema.string(),
  JWT_REFRESH_EXPIRE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for CORS configuration
  |----------------------------------------------------------
  */
  CORS_ORIGIN: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for rate limiting
  |----------------------------------------------------------
  */
  RATE_LIMIT_WINDOW: Env.schema.number(),
  RATE_LIMIT_MAX_REQUESTS: Env.schema.number(),

  /*
  |----------------------------------------------------------
  | Variables for file uploads
  |----------------------------------------------------------
  */
  UPLOAD_MAX_SIZE: Env.schema.number(),
  UPLOAD_PATH: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for email configuration
  |----------------------------------------------------------
  */
  EMAIL_HOST: Env.schema.string.optional(),
  EMAIL_PORT: Env.schema.number.optional(),
  EMAIL_USER: Env.schema.string.optional(),
  EMAIL_PASSWORD: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for encryption
  |----------------------------------------------------------
  */
  BCRYPT_SALT_ROUNDS: Env.schema.number()
})
