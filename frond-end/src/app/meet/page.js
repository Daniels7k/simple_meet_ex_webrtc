"use client"

import { useEffect, useState } from "react";

const PeerPage = () => {
    const [wsConnection, setWsConnection] = useState(null);

    useEffect(() => {
        const wsConnection = new WebSocket("ws://localhost:4000/ws");

        setWsConnection(wsConnection);

        wsConnection.addEventListener("open", () => {
            console.log("WebSocket is open now.");
        });

        wsConnection.addEventListener("message", (event) => {
            console.log("Message from server: ", event.data);
        });

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

    return (
        <div>
            <p>Hello World!</p>

            <button onClick={sendPingToWs}>Send Ping to WS</button>
        </div>
    );
};

export default PeerPage;