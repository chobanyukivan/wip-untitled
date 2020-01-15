global.WebSocket = require('ws')

const { WebSocketSubject } = require('rxjs/webSocket');
const { Subject, BehaviorSubject, interval} = require("rxjs");
const { takeWhile, take } = require("rxjs/operators");

class RxWebSocketClientSubject extends Subject {
    socket$;

    connection$;

    constructor(name, url, port) {
        super();

        this.name = name || Date.now();

        this.connection$ = new BehaviorSubject({ isConnected: false })

        this.webSocketSubjectConfig = {
            url: `${url}:${port}`,
            openObserver: {
                next: () => {
                    this.connection$.next({ isConnected: true})
                }
            },
            closeObserver: {
                next: () => {
                    this.socket$ = null;
                    this.connection$.next({ isConnected: false})
                }
            }
        }

    }

    connect = () => {
        if (!this.socket$) {
            this.socket$ = new WebSocketSubject(this.webSocketSubjectConfig);

            this.socket$.pipe(take(5)).subscribe(
                ({msg}) => {
                    console.log('message received: ' + msg)
                },
                err => {
                    console.log(err.message)
                },
                () => console.log('complete')
            );

            this.socket$.next({
                msg: `I'm client ${this.name }`,
                clientId: this.name,
            });

            this.connection$.pipe(take(1)).subscribe(({ isConnected }) => {
                // console.log('connection$', isConnected)
                if (!isConnected) {
                    this.reconnect()
                }
            })

        }

        // return this
    }

    reconnect = () => {
        this.reconnection$ = interval(5000)
            .pipe(takeWhile(() => { return !this.socket$ }))
        this.reconnection$.subscribe( ()=> {
            this.connect()
        })
    }

    // close = () => {
    //     // this.complete();
    //     // this.connection$.next({ isConnected: true})
    //     // this.connection$.complete();
    // }
}

module.exports = RxWebSocketClientSubject;
