'use client';

import { ReactNode, useEffect, useState } from 'react';
import { env } from 'next-runtime-env';
import { eventEmitter } from '@lib/event-emitter';
import { useGetIdentity } from '@refinedev/core';
import { IEventLog, IWsDeviceConnection, IWsNotification, IWsProcessData, TSaveAuthUser } from '@types';
import pako from 'pako';
import { createContext as createContextSelector } from 'use-context-selector';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

import '@lib/debug-logger';

declare global {
  interface Window {
    ws?: W3CWebSocket;
  }
}

interface WebSocketProps {
  ws: W3CWebSocket | null;
  sendMessage: (msg: { type: string; data?: unknown }, handleAck?: boolean) => void;
}

const compressMsg = (msgData: { type: string; data?: unknown }) => {
  try {
    // Convert message object to JSON string
    const jsonString = JSON.stringify(msgData);

    const encoder = new TextEncoder();
    const uint8 = encoder.encode(jsonString);
    const buffer = uint8.buffer;

    return buffer;

    // // Compress the JSON string using pako
    // const compressed = pako.deflate(jsonString);

    // // Return as ArrayBuffer for WebSocket transmission
    // return compressed.buffer.slice(compressed.byteOffset, compressed.byteOffset + compressed.byteLength);
  } catch (error) {
    console.error('Error compressing message:', error);
    // Fallback to uncompressed JSON string
    return JSON.stringify(msgData);
  }
};

const decompressMsg = (msg: MessageEvent) => {
  try {
    const isBuffer = msg.data instanceof ArrayBuffer;

    if (!isBuffer) {
      return JSON.parse(msg.data);
    }

    const compressed = new Uint8Array(msg.data);
    const decompressed = pako.inflate(compressed, { to: 'string' });
    const parsed = JSON.parse(decompressed);

    return parsed;
  } catch (err) {
    console.error(`Error decompressing message: ${err}`);
  }
};

export const WebSocketContext = createContextSelector<WebSocketProps>({
  ws: null,
  sendMessage: () => {},
});

interface WebSocketProviderProps {
  children: ReactNode;
}

interface MessageEventPayload {
  type: string;
  data: any;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [ws, setWs] = useState<W3CWebSocket | null>(null);
  const [waitingToReConnect, setWaitingToReConnect] = useState(false);

  /**
   *  send message to websocket server and handle ack
   * @param msg
   * @param handleAck
   * @returns
   */
  const sendMessage = (msg: { type: string; data?: unknown }) => {
    if (!ws) return;

    console.debug('🚀 ~ [Ws Send Message]:', msg);

    ws.send(JSON.stringify(msg));
  };

  const { data: identity } = useGetIdentity<TSaveAuthUser>();

  useEffect(() => {
    if (waitingToReConnect || !window || !identity) return;

    const wsUrl = `${env('NEXT_PUBLIC_WS_ENDPOINT')}?token=${identity.authToken}`;

    const wsClient = new W3CWebSocket(wsUrl);

    wsClient.onopen = () => {
      console.log('🚀 ~ [Ws Open]');
      window.ws = wsClient;
      eventEmitter.emit('ws:open');

      setWs(wsClient);
    };

    wsClient.onclose = (event) => {
      console.log('🚀 ~ [Ws Close] - [Event]:', event);

      eventEmitter.emit('ws:close');

      if (waitingToReConnect) return;

      setWaitingToReConnect(true);

      setTimeout(() => {
        setWaitingToReConnect(false);
      }, 5000);
    };

    return () => {
      if (wsClient.readyState === W3CWebSocket.CONNECTING || wsClient.readyState === W3CWebSocket.OPEN) {
        console.log('🚀 ~ return ~ wsClient: ---------> Close');

        wsClient.close();
      }

      setWs(null);
    };
  }, [waitingToReConnect, identity?.authToken]);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (msg: MessageEvent) => {
      try {
        const data: MessageEventPayload = JSON.parse(msg.data);
        console.log('🚀 ~ [Ws Message]:', data);

        switch (data?.type) {
          case 'DEVICE_CONNECTION':
            eventEmitter.emit('ws:device-connection', data.data as IWsDeviceConnection);
            break;
          case 'EVENT_LOG':
            eventEmitter.emit('ws:event-log', data.data as IEventLog);
            break;
          case 'PROCESS_DATA':
            eventEmitter.emit('ws:process-data', data.data as IWsProcessData);
            break;
          case 'NOTIFICATION':
            eventEmitter.emit('ws:notification', data.data as IWsNotification);
            break;
          default:
            break;
        }
      } catch (error) {
        console.log('~ [Ws Error]:', error);
      }
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    ws.onmessage = handleMessage;

    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      ws.onmessage = null;
    };
  }, [ws]);

  return <WebSocketContext.Provider value={{ ws, sendMessage }}>{children}</WebSocketContext.Provider>;
};
