"use client"

import { useEffect, useState, useRef } from "react";

const PeerPage = () => {
    const myVideoRef = useRef(null);
    const [wsConnection, setWsConnection] = useState(null);


    useEffect(() => {
        const wsConnection = startWsConnection();
        setWsConnection(wsConnection);

        setupUserMedia(myVideoRef);

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
            <video className='w-72' playsInline ref={myVideoRef} autoPlay />
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

const setupUserMedia = (videoRef) => {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    }).then(stream => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }).catch(error => {
        console.error("Error getting user media:", error);
    });
}

export default PeerPage;