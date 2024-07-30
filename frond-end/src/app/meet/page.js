"use client"

import { useEffect, useState, useRef } from "react";

const PeerPage = () => {
    const myVideoRef = useRef(null);
    const [wsConnection, setWsConnection] = useState(null);


    useEffect(() => {
        const wsConnection = startWsConnection();
        setWsConnection(wsConnection);
        setupUserMedia(myVideoRef);
        startPeerConnection(myVideoRef);


        return () => {
            wsConnection.close();
        }
    }, []);

    const startPeerConnection = async () => {
        const config = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' },] };

        const peerConnection = new RTCPeerConnection(config);

        const localStream = myVideoRef.current?.srcObject;

        let videoTrack = null;

        if (localStream) {
            videoTrack = localStream.getVideoTracks()[0];

            peerConnection.addTransceiver(videoTrack, { direction: 'sendrecv', streams: [localStream] });

            const offer = await npeerConnection.createOffer();

            await peerConnection.setLocalDescription(offer);
            console.log("Sent SDP offer:", offer)


            wsConnection.send(JSON.stringify({ type: "offer", data: offer }));
        }

        console.log("Local video track: ", videoTrack);




    }

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

            <button onClick={startPeerConnection}>Start Peer Connection</button>

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