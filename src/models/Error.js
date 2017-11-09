'use strict';

/**
 * @swagger
 * definitions:
 *   RpcError:
 *     type: object
 *     properties:
 *       code:
 *         type: integer
 *         format: int32
 *         example: 500
 *       message:
 *         type: string
 *         example: Error
 */
class RpcError extends Error{

  constructor(message = 'error', code = 500){
    super(message);
    Object.assign(this, { code, message });
  }

  toJSON(){
    const { code, message } = this;
    return { code, message };
  }

}

/**
 * @swagger
 * definitions:
 *   InternalError:
 *     type: object
 *     properties:
 *       code:
 *         type: integer
 *         format: int32
 *         example: 500
 *       message:
 *         type: string
 *         example: Internal error
 */
class InternalError extends RpcError{
  constructor(){
    super('Internal error', 500);
  }
}

/**
 * @swagger
 * definitions:
 *   AccessDeniedError:
 *     type: object
 *     properties:
 *       code:
 *         type: integer
 *         format: int32
 *         example: 403
 *       message:
 *         type: string
 *         example: Access denied
 */
class AccessDeniedError extends RpcError{
  constructor(){
    super('Access denied', 403);
  }
}

/**
 * @swagger
 * definitions:
 *   NotFoundError:
 *     type: object
 *     properties:
 *       code:
 *         type: integer
 *         format: int32
 *         example: 404
 *       message:
 *         type: string
 *         example: Not found
 */
class NotFoundError extends RpcError{
  constructor(){
    super('Not found', 404);
  }
}

/**
 * @swagger
 * definitions:
 *   AlreadyExistError:
 *     type: object
 *     properties:
 *       code:
 *         type: integer
 *         format: int32
 *         example: 400
 *       message:
 *         type: string
 *         example: Already exist
 */
class AlreadyExistError extends RpcError{
  constructor(){
    super('Already exist', 400);
  }
}

Object.assign(exports, {
  RpcError,
  AccessDeniedError,
  AlreadyExistError,
  InternalError,
  NotFoundError
});