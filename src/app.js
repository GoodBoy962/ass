'use strict';

const Express = require('express');
const SwaggerJSDoc = require('swagger-jsdoc');
const SwaggerTools = require('swagger-tools').initializeMiddleware;

const pkg = require('../package.json');
const config = require('./config');
const auth = require('./routes/auth');

const swaggerJsDoc = SwaggerJSDoc({
  swaggerDefinition: {
    info: {
      title: pkg.name,
      version: pkg.version,
      description: pkg.description,
    },
    host: config.hostUri,
    basePath: '/',
  },
  apis: [
    'src/routes/**/*.js',
    'src/models/**/*.js', 
  ]
});

const app = Express();

SwaggerTools(swaggerJsDoc, middleware => {
  app.use(middleware.swaggerMetadata());
  app.use(middleware.swaggerSecurity(auth));
  app.use(middleware.swaggerValidator());
  app.use(middleware.swaggerRouter({
    controllers: 'src/routes',
  }));
  app.use(middleware.swaggerUi());
});

app.use(function(err, req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.status(500);
  if(config.env==='development'){
    res.json(err);
  }else{
    res.end();
  }
});

module.exports = app;