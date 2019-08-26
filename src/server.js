const {serverPort} = require('./config');
const AppServer = require('./appServer');


const server = new AppServer(serverPort);

server.start().then(() => {
  // do something when app is closing
  process.on('exit', exitHandler.bind(null, {cleanup: true}));
  // catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, {exit: true}));
  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, {exit: true}));
  process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));
});

async function exitHandler() {
  await server.stop();
  process.exit(0);
}

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  process.exit(1);
});


