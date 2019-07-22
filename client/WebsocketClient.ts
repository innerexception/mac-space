import { ApiUrl } from '../enum'
import { onConnected, onConnectionError, onWSMessage } from './components/uiManager/Thunks'

export default class WebsocketClient {

    websocket: any

    constructor(){
      this.launch(ApiUrl)
    }

    launch = (url:string) => {
        this.websocket = ReconnectingWebSocket(url)
        console.log('ws: connecting');
        this.websocket.onopen = onConnected
        this.websocket.onerror = onConnectionError
        this.websocket.onmessage = (e:any) => {
            if(e){
              var data = JSON.parse(e.data);
              onWSMessage(data);
            }
        }
        this.websocket.connect();
    }

    disconnect = () => {
        this.websocket.disconnect()
    }

    publishMessage= (msg:any) => {
      var message = JSON.stringify(msg)
      if(message) {
          this.websocket.send(message);
      }
    }
};

const ReconnectingWebSocket = (url:string) => {

  // These can be altered by calling code.
  this.debug = false;
  this.reconnectInterval = 2000;
  this.timeoutInterval = 5000;

  var ws:any;
  var forcedClose = false;
  var timedOut = false;

  this.url = url;
  this.protocols = [];
  this.readyState = WebSocket.CONNECTING;

  this.onopen = (event:any) => {

  };

  this.onclose = (event:any) => {

  };

  this.onconnecting = (event:any) => {

  };

  this.onmessage = (event:any) => {

  };

  this.onerror = (event:any) => {

  };

  this.connect = (reconnectAttempt:any) => {

    ws = new WebSocket(url, []);

    this.onconnecting();

    var localWs = ws;

    var timeout = setTimeout(function () {

      timedOut = true;

      localWs.close();

      timedOut = false;

    }, this.timeoutInterval);



    ws.onopen = (event:any) => {

      clearTimeout(timeout);

      this.readyState = WebSocket.OPEN;

      reconnectAttempt = false;

      this.onopen(event);

    };



    ws.onclose = (event:any) => {

      clearTimeout(timeout);

      ws = null;

      if (forcedClose) {

        this.readyState = WebSocket.CLOSED;

        this.onclose(event);

      } else {

        this.readyState = WebSocket.CONNECTING;

        this.onconnecting();

        if (!reconnectAttempt && !timedOut) {

          this.onclose(event);

        }

        setTimeout(function () {

          this.connect(true);

        }, this.reconnectInterval);

      }

    };



    ws.onmessage = (event:any) => {

      this.onmessage(event);

    };



    ws.onerror = (event:any) => {

      this.onerror(event);

    };

  }

  this.send = (data:any) => {

    if (ws) {

      return ws.send(data);

    } else {

      throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';

    }

  };

  this.close = () => {

    forcedClose = true;

    if (ws) {

      ws.close();

    }

  };

  /**

   * Additional public API method to refresh the connection if still open (close, re-open).

   * For example, if the app suspects bad data / missed heart beats, it can try to refresh.

   */

  this.refresh = () => {

    if (ws) {

      ws.close();

    }

  };

  return this

}

