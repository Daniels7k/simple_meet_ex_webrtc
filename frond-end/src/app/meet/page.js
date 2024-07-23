"use client"

import { useEffect, useState } from "react";

const PeerPage = () => {
    const [wsConnection, setWsConnection] = useState(null);



    useEffect(() => {
        const wsConnection = startWsConnection();

        return () => {
            wsConnection.close();
        }
    }, []);

    const sendPingToWs = () => {
        if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
            wsConnection.send(JSON.stringify({ message: 'Ping from client!' }));
        } else {
            console.error("WebSocket is not open.");
        }
    }

    const sendAnOffer = () => {
        if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
            wsConnection.send(JSON.stringify({ message: 'Offer from client!' }));
        } else {
            console.error("WebSocket is not open.");
        }
    }

    return (
        <div>
            <p>Hello World!</p>

            <button onClick={sendPingToWs}>Send Ping to WS</button>
            <button onClick={sendAnOffer}>Send Offer to WS</button>

        </div>
    );
};

const startWsConnection = () => {
    const wsConnection = new WebSocket("ws://localhost:4000/ws");

    wsConnection.addEventListener("open", () => {
        console.log("WebSocket is open now.");
    });

    wsConnection.addEventListener("message", (event) => {
        console.log("Message from server: ", event.data);
    });

    wsConnection.addEventListener("close", () => {
        console.log("WebSocket is closed now.");
    });

    return wsConnection;
}

export default PeerPage;