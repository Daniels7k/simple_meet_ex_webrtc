import './style.css';


// Global State
const offer_player_id = 1;
const answer_player_id = 2;

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

// WEBSOCKET  
const wsConnection = new WebSocket("ws://localhost:4001/socket/websocket");

wsConnection.addEventListener("message", (_event) => {


});

wsConnection.addEventListener("open", () => {
  console.log("WebSocket is open now.");

  wsConnection.send(JSON.stringify({
    topic: "room:lobby",
    event: "phx_join",
    payload: {
    },
    ref: ""
  }))
});

wsConnection.addEventListener("close", () => {
  console.log("WebSocket is closed now.");
});


// ws heartbeat
setInterval(() => {
  wsConnection.send(JSON.stringify({
    topic: "room:lobby",
    event: "ping",
    payload: {},
    ref: ""
  }));
}, 30000);
// HTML elements
const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('webcamVideo');
const callButton = document.getElementById('callButton');
const callInput = document.getElementById('callInput');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');

// 1. Setup media sources

webcamButton.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  remoteStream = new MediaStream();

  // Push tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Pull tracks from remote stream, add to video stream
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  webcamVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;

  callButton.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = true;
};

// 2. Create an offer
callButton.onclick = async () => {

  // Get candidates for caller, save to db
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("Offer sending ice candidate to answer.");
      wsConnection.send(JSON.stringify({
        topic: "room:lobby",
        event: "shout",
        payload: {
          type: "ice_candidate",
          player_id: offer_player_id,
          candidate: event.candidate.toJSON()
        },
        ref: ""
      }));
    }
  };

  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type
  }

  // SEND OFFER TO WEBSOCKET
  wsConnection.send(JSON.stringify({
    topic: "room:lobby",
    event: "shout",
    payload: {
      ...offer
    },
    ref: ""
  }));


  // listen for remote answer
  wsConnection.addEventListener("message", (event) => {
    const rawData = JSON.parse(event.data);

    const data = rawData.payload;

    if (data.type === "answer") {
      console.log("Received answer from remote peer.");
      const remoteAnswer = data;
      const remoteAnswerDescription = new RTCSessionDescription(remoteAnswer);
      pc.setRemoteDescription(remoteAnswerDescription);
    }
  });


  // when answered, add candidate to peer connection

  wsConnection.addEventListener("message", async (event) => {
    const rawData = JSON.parse(event.data);

    const data = rawData.payload;

    if (data.type === "ice_candidate" && data.player_id !== offer_player_id) {
      console.log("Received ice candidate from offer.");

      const candidate = new RTCIceCandidate(data.candidate);
      pc.addIceCandidate(candidate);
    }
  });

};

// 3. Answer the call with the unique ID
answerButton.onclick = async () => {

  pc.onicecandidate = (event) => {

    if (event.candidate) {
      console.log("Answer sending ice candidate to offer.");
      wsConnection.send(JSON.stringify({
        topic: "room:lobby",
        event: "shout",
        payload: {
          type: "ice_candidate",
          player_id: answer_player_id,
          candidate: event.candidate.toJSON()
        },
        ref: ""
      }));
    }
  };

  // GET OFFER FROM WEBSOCKET STATE
  wsConnection.send(JSON.stringify({
    topic: "room:lobby",
    event: "shout",
    payload: {
      type: "request_current_offer"
    },
    ref: ""
  }));

  wsConnection.addEventListener("message", async (event) => {
    const rawData = JSON.parse(event.data);

    const data = rawData.payload;

    if (data.type === "ice_candidate" && data.player_id !== answer_player_id) {
      console.log("Received ice candidate from offer.");

      const candidate = new RTCIceCandidate(data.candidate);
      pc.addIceCandidate(candidate);
    }

    if (data.type === "offer") {
      console.log("answer receiving offers");

      const remoteOffer = data;

      await pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));

      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      const answer = {
        sdp: answerDescription.sdp,
        type: answerDescription.type
      }

      wsConnection.send(JSON.stringify({
        topic: "room:lobby",
        event: "shout",
        payload: {
          ...answer
        },
        ref: ""
      }));
    }
  });
};
