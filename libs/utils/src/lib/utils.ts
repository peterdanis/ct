import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import type { Logger } from '@nestjs/common';

/**
 * Use to validate objects from outside of this service
 * @throws InternalServerErrorException
 */
export function validateAndStrip<T>(
  object: unknown,
  dto: ClassConstructor<T>,
  logger: Logger
): T {
  const instance = plainToInstance(dto, object);
  const errors = validateSync(instance as Record<string, unknown>, {
    whitelist: true,
  });
  if (errors.length > 0) {
    logger.warn(errors);
    throw new Error('Some of the validated object did not pass validation');
  }
  return instance;
}

export const extractFirstKey = (object) => Object.keys(object)[0];

export const extractSecondKey = (object) => Object.keys(object)[1];
