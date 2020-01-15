const RxWebSocketClientSubject = require('./rx-web-socket-client')

const client = new RxWebSocketClientSubject('clientName', "ws://localhost", 3000)

client.connect()
