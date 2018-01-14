import server from './server';

const hostname = 'localhost';
const port = 8081;

server.listen(port, () => {
  console.log('server running at ' + hostname + ':' + port);
});