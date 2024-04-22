import { validateAndStrip } from '@ct/utils';
import { BadRequestException, Logger } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

/**
 * Validates, strips and transforms each item. Items not adhering to DTO are excluded from the result and logged.
 * @param dto DTO or class to validate items against
 * @returns a function to be used in Array.reduce()
 */
export function getAllReducer<T>(
  dto: ClassConstructor<T>,
  logger: Logger
): (arr: T[], item: T) => T[] {
  return (finalArray, item) => {
    try {
      finalArray.push(validateAndStrip(item, dto, logger));
    } catch (error) {
      // Ignore given item in output, just log - single bad db item should not break getAll endpoint
      logger.error({ item, error }, 'getAllReducer.invalidDbItemFound');
    }
    return finalArray;
  };
}

export function encodeToBase64(input: string | Record<string, unknown>) {
  return Buffer.from(JSON.stringify(input)).toString('base64url');
}

export function decodeFromBase64(encodedString: string) {
  try {
    return JSON.parse(
      Buffer.from(encodedString, 'base64url').toString('utf-8')
    );
  } catch (error) {
    throw new BadRequestException();
  }
}
