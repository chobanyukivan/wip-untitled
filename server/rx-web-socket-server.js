const express = require('express')
const http = require('http')
const wss = require('ws').Server
const { Subject, from, BehaviorSubject, interval, concat, merge, fromEvent} = require("rxjs");
const { takeWhile, take, map, filter } = require("rxjs/operators");

const app = express()

process.title = 'myServer';

class rxWebSocketServer {
    wsServer;
    server;
    PORT;

    wsServerConnections$;
    wsMessage$;

    constructor() {
        this.server = http.createServer(app);
        this.PORT = process.env.PORT || 3000;
    }

    start = () => {
        this.wsServer = new wss({server: this.server})

        this.wsServerConnections$ = fromEvent(this.wsServer, 'connection')

        this.wsServerConnections$.pipe(
            map(([connect]) => {
                connect.send(JSON.stringify({msg: "[server]: Connected to server"}))

                this.wsMessage$ = merge(
                    fromEvent(connect, 'message'),
                    fromEvent(connect, 'close')
                )

                this.wsMessage$.pipe(
                    filter(e => e.type === 'message')
                ).subscribe((e) => {
                    const {message, clientId} = JSON.parse(e.data);

                    console.log(`${clientId} is connected. Count of connections ${this.wsServer.clients.size}`)
                })

                this.wsMessage$.pipe(
                    filter(e => e.type === 'close')
                ).subscribe((e) => {
                    console.log(`Client close connection(${e.code}). Count of connections ${this.wsServer.clients.size}`)
                })

                this.broadcasting(connect);
            }),
        ).subscribe()

        this.listen();
    }

    broadcasting = (connection) => {
        let counter = 0

        const broadcast = () => {
            connection.send(JSON.stringify({msg: `[server]: message ${counter++}`}))
        }

        this.interval = setInterval(broadcast, 1000)
    }

    stopBroadcasting = () => {
        console.log('stopBroadcasting')
        clearInterval(this.interval)
    }

    listen = () => {
        this.server.listen(this.PORT, () => {
            console.log(`Server started on port ${this.server.address().port} ¯\\_(ツ)_/¯`);
        });
    }
}

module.exports = rxWebSocketServer
