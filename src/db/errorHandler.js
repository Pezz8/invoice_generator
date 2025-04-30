import { Prisma } from '../../generated/prisma';

export function errorHandler(error) {
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      message: 'Invalid data provided',
      details: error.message,
    };
  }

  return {
    message: 'Internal error',
    details: error.message,
  };
}
