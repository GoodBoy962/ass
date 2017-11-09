'use strict';

const { db } = require('../config');
const {
  InternalError,
  AccessDeniedError,
  NotFoundError,
  AlreadyExistError
} = require('../models/Error');
const log = require('../config/logger')('name');

function toHex(str){
  return new Buffer(str, 'utf-8').toString('hex');
}

function toValue(data){
  if(!!!data){
    return null;
  }
  return new Buffer(data.toString(), 'hex')
    .toString()
    .split('#')[1]
}

/**
 * @swagger
 * /name/{network}/{alias}:
 *   get:
 *     x-swagger-router-controller:
 *       name
 *     operationId:
 *       read
 *     tags:
 *       - Name
 *     description: Get address by alias
 *     security:
 *       - BasicAuth: []
 *     x-security-scopes:
 *       - all
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: network
 *         description: Network type
 *         in: path
 *         required: true
 *         type: string
 *       - name: alias
 *         description: Alias of address
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       default:
 *         description: Return address for {alias}
 *         schema:
 *           type: string
 *       403:
 *         description: Access denied
 *         schema:
 *           $ref: '#/definitions/AccessDeniedError'
 *       404:
 *         description: Not found
 *         schema:
 *           $ref: '#/definitions/NotFoundError'
 *       500:
 *         description: Internal error
 *         schema:
 *           $ref: '#/definitions/InternalError'
 */
function read(req, res){
  const network = req.swagger.params.network.value;
  const alias = req.swagger.params.alias.value;

  db.get(toHex(`${network}#${alias}`))
    .then(
      data =>
        new Buffer(data.toString(), 'hex')
          .toString()
          .split('#')[1]
    )
    .then(
      address =>
        res
          .status(200)
          .json(address)
    )
    .catch(
      error =>
        (error.name === 'NotFoundError')
          ? res.status(404).json(new NotFoundError())
          : res.status(500).json(new InternalError())
    );
}

/**
 * @swagger
 * /name/{network}/{alias}/{address}:
 *   post:
 *     x-swagger-router-controller:
 *       name
 *     operationId:
 *       create
 *     tags:
 *       - Name
 *     description: Create address for alias
 *     security:
 *       - BasicAuth: []
 *     x-security-scopes:
 *       - all
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: network
 *         description: Network type
 *         in: path
 *         required: true
 *         type: string
 *       - name: alias
 *         description: Alias of address
 *         in: path
 *         required: true
 *         type: string
 *       - name: address
 *         description: Network address
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       default:
 *         description: Create alias for address. Http code 200
 *       200:
 *         description: empty body
 *       400:
 *         description: Already exist
 *         schema:
 *           $ref: '#/definitions/AlreadyExistError'
 *       403:
 *         description: Access denied
 *         schema:
 *           $ref: '#/definitions/AccessDeniedError'
 *       500:
 *         description: Internal error
 *         schema:
 *           $ref: '#/definitions/InternalError'
 */
function create(req, res){
  const network = req.swagger.params.network.value;
  const address = req.swagger.params.address.value;
  const alias = req.swagger.params.alias.value;
  
  const naddr = toHex(`${network}#${address}`);
  const nalias = toHex(`${network}#${alias}`);

  Promise.all([
    db.get(naddr),
    db.get(nalias)
  ])
  .then(
    () =>
      Promise.reject(new AlreadyExistError()),
    err =>
      Promise.all([
        db.put(naddr, nalias),
        db.put(nalias, naddr)
      ])
  )
  .then(
    () =>
      res
        .status(200)
        .end()
  )
  .catch(
    err =>
      (
        err instanceof AlreadyExistError ||
        err instanceof InternalError
      )
        ? res.status(err.code).json(err)
        : res.status(500).json(new InternalError())
  );
}

/**
 * @swagger
 * /name/{network}/{alias}/{address}:
 *   delete:
 *     x-swagger-router-controller:
 *       name
 *     operationId:
 *       remove
 *     tags:
 *       - Name
 *     description: Remove address and alias
 *     security:
 *       - BasicAuth: []
 *     x-security-scopes:
 *       - all
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: network
 *         description: Network type
 *         in: path
 *         required: true
 *         type: string
 *       - name: alias
 *         description: Alias of address
 *         in: path
 *         required: true
 *         type: string
 *       - name: address
 *         description: Network address
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       default:
 *         description: Remove alias and address from db. Http code 200
 *       200:
 *         description: empty body
 *       403:
 *         description: Access denied
 *         schema:
 *           $ref: '#/definitions/AccessDeniedError'
 *       500:
 *         description: Internal error
 *         schema:
 *           $ref: '#/definitions/InternalError'
 */
function remove(req, res){
  const network = req.swagger.params.network.value;
  const address = req.swagger.params.address.value;
  const alias = req.swagger.params.alias.value;
  
  const naddr = toHex(`${network}#${address}`);
  const nalias = toHex(`${network}#${alias}`);

  Promise.all([
    db.del(naddr),
    db.del(nalias)
  ])
  .then(
    () =>
      res
        .status(200)
        .end()
  )
  .catch(
    err =>
      (
        err instanceof NotFoundError ||
        err instanceof InternalError
      )
        ? res.status(err.code).json(err)
        : res.status(500).json(new InternalError())
  );
}



module.exports = { read, create, update, remove };