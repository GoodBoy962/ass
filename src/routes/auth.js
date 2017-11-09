'use strict';

const config = require('../config');
const AccessDenied = require('../models/Error').AccessDeniedError;
/**
 * @swagger
 *   securityDefinitions:
 *     BasicAuth:
 *       type: apiKey
 *       name: Authorization
 *       in: header
 */
function BasicAuth(req, def, token, callback){
  if(token===config.apiKey){
    return callback();
  }
  return req.res
    .status(403)
    .json(new AccessDenied());
}

Object.assign(exports, {
  BasicAuth
});