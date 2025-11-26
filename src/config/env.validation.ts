import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  CONTENTFUL_SPACE_ID: Joi.string().required(),
  CONTENTFUL_ACCESS_TOKEN: Joi.string().required(),
  CONTENTFUL_ENVIRONMENT: Joi.string().required(),
  CONTENTFUL_CONTENT_TYPE: Joi.string().required(),

  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_SYNCHRONIZE: Joi.boolean().default(false),
  DATABASE_LOGGING: Joi.boolean().default(false),

  PORT: Joi.number().default(3000),
});

