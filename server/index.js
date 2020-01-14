const express = require('express')
const http = require('http')
const WebSocket = require('ws')

const app = express()
const PORT = process.env.PORT || 3000;

console.log(process.env.PORT)
process.title = 'myServer';

let server = http.createServer(app);

// let wsServer = null;

const start = () => {
    const wsServer = new WebSocket.Server({server})

    wsServer.on('connection', (ws) => {
        let counter = 0

        let clientName = '';

        ws.send(JSON.stringify({msg: "[server]: Connected to server"}))

        console.log(`Count of connections ${wsServer.clients.size}`)

        ws.on('message', (message) => {
            const {msg, clientId} = JSON.parse(message);
            clientName = clientId;

            console.log(`${clientName} is connected`)
        })


        ws.on('close', (e)=> {
            console.warn(`Client ${clientName} close connection(${e}). Count of connections ${wsServer.clients.size}`)
        })

        setInterval(()=>{
            ws.send(JSON.stringify({msg: `[server]: message ${counter}`}))

            counter += 1
        },1000)
    })

    server.listen(PORT, (e) => {
        console.log(`Server started on port ${server.address().port} ¯\\_(ツ)_/¯`);
    });

}

start()
