const {serverPort} = require('./config');
const expressGraphQL = require('express-graphql');
const schema = require('./graphql/schema');
const log = require('./common/log');
const {InternalServerError} = require('./graphql/constants/errors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const express = require('express');
const {graphqlUploadExpress} = require('graphql-upload');
const expressJwt = require('express-jwt');
const Jwt401Error = expressJwt.UnauthorizedError;
const localtunnel = require('localtunnel');
const jwtMiddleware = require('./jwtMiddleware');
const userMiddleware = require('./userMiddleware');

class AppServer {
  constructor(port) {
    this._port = port || serverPort;
  }


  async start() {
    if (this._app) {
      return;
    }
    const app = express();
    this._app = app;
    const graphqlMiddleware = expressGraphQL((req, res) => ({
      schema,
      graphiql: true,
      rootValue: {request: req, response: res},
      pretty: true,
      customFormatErrorFn: (error) => {
        log.error(error);
        let {originalError} = error;
        if (!originalError) {
          originalError = error;
        } else if (!originalError.messageId) {
          originalError = new InternalServerError(error);
        }
        return {
          code: originalError.code,
          messageId: originalError.messageId,
          message: originalError.message,
          data: originalError.data,
          path: error.path,
          locations: error.locations
        };
      }
    }));

    app.use(cookieParser());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(jwtMiddleware());
    app.use((err, req, res, next) => {
      // eslint-disable-line no-unused-vars
      if (err instanceof Jwt401Error) {
        console.error('[express-jwt-error]', req.cookies.id_token);
        // `clearCookie`, otherwise user can't use web-app until cookie expires
        res.clearCookie('id_token');
      }
      next(err);
    });

    app.use(userMiddleware());

    app.options('/*', function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(200);
    });

    app.get('/healthcheck', (req, res) => {
      res.sendStatus(200).end();
    });


    app.use('/graphql', graphqlUploadExpress({maxFileSize: 10000000, maxFiles: 10}), graphqlMiddleware);

    const server = app.listen(this._port, async () => {
      console.info(`The server is running at http://localhost:${this._port}/`);
      const useLocalTunnel = !!process.env.LT;

      if (useLocalTunnel) {
        this._localTunnel = localtunnel(this._port, {subdomain: 'yoursubdomainhere'}, (err, tunnel) => {
          if (err) {
            return console.error(err);
          }
          console.info(`Tunnel is running at ${tunnel.url}`);
        });
      }
    });
    this._server = server;
  }

  async stop() {
    if (!this._app) {
      return;
    }
    await this._server.close();
    console.log('Server stopped');
    if (this._localTunnel) {
      await this._localTunnel.close();
      console.log('Tunnel stopped');
    }
    this._app = null;
  }
}

module.exports = AppServer;
