import { useEffect, useRef, useState } from "react";
import {
  connectSocket,
  getSocket,
} from "../../../services/socket";

function makeCallId() {
  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function getOtherParticipant(
  conversation,
  currentUserId
) {
  return conversation?.participants?.find(
    (participant) =>
      String(participant._id) !==
      String(currentUserId)
  );
}

function CallManager({
  conversation,
  currentUserId,
  requestCall,
  onRequestHandled,
}) {
  const [call, setCall] = useState(null);
  const [error, setError] = useState("");

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const callRef = useRef(null);
  const pendingIceRef = useRef([]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // --------------------------------------------------
  // CLEANUP MEDIA
  // --------------------------------------------------

  const cleanupMedia = () => {
    peerRef.current?.close();
    peerRef.current = null;

    localStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    localStreamRef.current = null;

    remoteStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    remoteStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    pendingIceRef.current = [];
  };

  // --------------------------------------------------
  // END CALL
  // --------------------------------------------------

  const finishCall = ({ notifyPeer = true } = {}) => {
    const activeCall = callRef.current;

    const socket =
      getSocket() || connectSocket();

    if (
      notifyPeer &&
      activeCall?.receiverId &&
      activeCall?.callId &&
      socket
    ) {
      socket.emit("callEnded", {
        receiverId: activeCall.receiverId,
        callId: activeCall.callId,
      });
    }

    cleanupMedia();

    callRef.current = null;
    setCall(null);
    setError("");
  };

  // --------------------------------------------------
  // PENDING ICE CANDIDATES
  // --------------------------------------------------

  const addPendingIceCandidates = async (
    peer
  ) => {
    const pending =
      pendingIceRef.current.splice(0);

    for (const candidate of pending) {
      try {
        await peer.addIceCandidate(
          candidate
        );
      } catch (error) {
        console.error(
          "Pending ICE candidate error:",
          error
        );
      }
    }
  };

  // --------------------------------------------------
  // CREATE WEBRTC PEER
  // --------------------------------------------------

  const createPeer = async ({
    callType,
    receiverId,
    callId,
  }) => {
    const peer =
      new RTCPeerConnection({
        iceServers: [
          {
            urls:
              "stun:stun.l.google.com:19302",
          },
          {
            urls:
              "stun:stun1.l.google.com:19302",
          },
        ],
      });

    // ICE candidate
    peer.onicecandidate = (event) => {
      if (!event.candidate) return;

      const socket =
        getSocket() || connectSocket();

      socket?.emit("iceCandidate", {
        receiverId,
        callId,
        candidate: event.candidate,
      });
    };

    // Remote stream
    peer.ontrack = (event) => {
      const [stream] = event.streams;

      if (!stream) return;

      remoteStreamRef.current = stream;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject =
          stream;
      }

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject =
          stream;
      }
    };

    peer.onconnectionstatechange = () => {
      if (
        [
          "failed",
          "disconnected",
          "closed",
        ].includes(peer.connectionState)
      ) {
        finishCall({
          notifyPeer:
            peer.connectionState !==
            "closed",
        });
      }
    };

    // Browser microphone/camera permission
    const media =
      await navigator.mediaDevices.getUserMedia(
        {
          audio: true,
          video: callType === "video",
        }
      );

    localStreamRef.current = media;

    media
      .getTracks()
      .forEach((track) => {
        peer.addTrack(track, media);
      });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject =
        media;
    }

    peerRef.current = peer;

    return peer;
  };

  // --------------------------------------------------
  // START OUTGOING CALL
  // --------------------------------------------------

  const startCall = async (callType) => {
    if (!conversation) return;

    // Backend calling implementation is
    // currently direct-user calling.
    if (conversation.isGroup) {
      setError(
        "Voice and video calls are available for direct chats only."
      );
      return;
    }

    const other =
      getOtherParticipant(
        conversation,
        currentUserId
      );

    if (!other?._id) {
      setError(
        "Unable to find the other participant."
      );
      return;
    }

    if (callRef.current) return;

    const socket =
      getSocket() || connectSocket();

    if (!socket) {
      setError(
        "Call connection is not available."
      );
      return;
    }

    const callId = makeCallId();

    const receiverId =
      String(other._id);

    setError("");

    try {
      const peer = await createPeer({
        callType,
        receiverId,
        callId,
      });

      const offer =
        await peer.createOffer();

      await peer.setLocalDescription(
        offer
      );

      const activeCall = {
        callId,
        callerId:
          String(currentUserId),
        receiverId,
        callType,
        role: "caller",
      };

      callRef.current = activeCall;

      setCall({
        ...activeCall,
        status: "calling",
        name: other.name,
      });

      // Backend:
      // socket.on("callUser", ...)
      socket.emit("callUser", {
        receiverId,
        callId,
        callType,
        offer,
      });
    } catch (error) {
      console.error(
        "Start call error:",
        error
      );

      cleanupMedia();

      callRef.current = null;

      setError(
        "Could not access your microphone/camera. Please check browser permissions."
      );
    }
  };

  // --------------------------------------------------
  // ACCEPT INCOMING CALL
  // --------------------------------------------------

  const acceptCall = async () => {
    const incoming =
      callRef.current;

    if (!incoming?.offer) return;

    const socket =
      getSocket() || connectSocket();

    if (!socket) return;

    try {
      const peer = await createPeer({
        callType:
          incoming.callType,
        receiverId:
          incoming.callerId,
        callId:
          incoming.callId,
      });

      // Apply caller's offer
      await peer.setRemoteDescription(
        incoming.offer
      );

      await addPendingIceCandidates(
        peer
      );

      const answer =
        await peer.createAnswer();

      await peer.setLocalDescription(
        answer
      );

      // Backend:
      // socket.on("callAccepted", ...)
      socket.emit("callAccepted", {
        callerId:
          incoming.callerId,
        callId:
          incoming.callId,
        answer,
      });

      const nextCall = {
        ...incoming,
        role: "receiver",
        status: "connected",
      };

      callRef.current = nextCall;

      setCall(nextCall);
    } catch (error) {
      console.error(
        "Accept call error:",
        error
      );

      socket.emit("callRejected", {
        callerId:
          incoming.callerId,
        callId:
          incoming.callId,
      });

      finishCall({
        notifyPeer: false,
      });

      setError(
        "Could not access your microphone/camera."
      );
    }
  };

  // --------------------------------------------------
  // REJECT CALL
  // --------------------------------------------------

  const rejectCall = () => {
    const incoming =
      callRef.current;

    const socket =
      getSocket() || connectSocket();

    if (
      incoming?.callerId &&
      incoming?.callId
    ) {
      socket?.emit("callRejected", {
        callerId:
          incoming.callerId,
        callId:
          incoming.callId,
      });
    }

    finishCall({
      notifyPeer: false,
    });
  };

  // --------------------------------------------------
  // CALL BUTTON TRIGGER
  // --------------------------------------------------

  useEffect(() => {
    if (!requestCall) return;

    startCall(requestCall);

    onRequestHandled?.();

    // requestCall is deliberately used
    // as the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestCall]);

  // --------------------------------------------------
  // SOCKET EVENTS
  // --------------------------------------------------

  useEffect(() => {
    const socket =
      getSocket() || connectSocket();

    if (!socket) return undefined;

    // Incoming call
    const handleIncomingCall = (
      data
    ) => {
      if (callRef.current) {
        socket.emit("callBusy", {
          callerId:
            data.callerId,
          callId:
            data.callId,
        });

        return;
      }

      const incoming = {
        callId:
          data.callId,

        callerId:
          String(data.callerId),

        receiverId:
          String(data.receiverId),

        callType:
          data.callType,

        offer:
          data.offer,

        role: "receiver",

        status: "incoming",

        name: "Incoming call",
      };

      callRef.current = incoming;

      setCall(incoming);
    };

    // Caller receives answer
    const handleAccepted = async (
      data
    ) => {
      const active =
        callRef.current;

      const peer =
        peerRef.current;

      if (
        !active ||
        active.callId !==
          data.callId ||
        !peer
      ) {
        return;
      }

      try {
        await peer.setRemoteDescription(
          data.answer
        );

        await addPendingIceCandidates(
          peer
        );

        setCall((prev) =>
          prev
            ? {
                ...prev,
                status:
                  "connected",
              }
            : prev
        );
      } catch (error) {
        console.error(
          "Call answer error:",
          error
        );

        finishCall();
      }
    };

    // ICE candidate
    const handleIceCandidate =
      async (data) => {
        const active =
          callRef.current;

        const peer =
          peerRef.current;

        if (
          !active ||
          active.callId !==
            data.callId ||
          !data.candidate
        ) {
          return;
        }

        if (peer?.remoteDescription) {
          try {
            await peer.addIceCandidate(
              data.candidate
            );
          } catch (error) {
            console.error(
              "ICE candidate error:",
              error
            );
          }
        } else {
          pendingIceRef.current.push(
            data.candidate
          );
        }
      };

    // Rejected
    const handleRejected = ({
      callId,
      message,
    }) => {
      if (
        callRef.current?.callId !==
        callId
      ) {
        return;
      }

      setError(
        message || "Call rejected"
      );

      finishCall({
        notifyPeer: false,
      });
    };

    // Offline
    const handleUnavailable = ({
      callId,
      message,
    }) => {
      if (
        callRef.current?.callId !==
        callId
      ) {
        return;
      }

      setError(
        message ||
          "User is offline"
      );

      finishCall({
        notifyPeer: false,
      });
    };

    // Busy
    const handleBusy = ({
      callId,
      message,
    }) => {
      if (
        callRef.current?.callId !==
        callId
      ) {
        return;
      }

      setError(
        message ||
          "User is busy"
      );

      finishCall({
        notifyPeer: false,
      });
    };

    // Other user ended call
    const handleEnded = ({
      callId,
    }) => {
      if (
        callRef.current?.callId !==
        callId
      ) {
        return;
      }

      finishCall({
        notifyPeer: false,
      });
    };

    // Optional WebRTC renegotiation
    const handleOffer = async (
      data
    ) => {
      const active =
        callRef.current;

      const peer =
        peerRef.current;

      if (
        !active ||
        active.callId !==
          data.callId ||
        !peer ||
        active.status !==
          "connected"
      ) {
        return;
      }

      try {
        await peer.setRemoteDescription(
          data.offer
        );

        const answer =
          await peer.createAnswer();

        await peer.setLocalDescription(
          answer
        );

        socket.emit("webrtcAnswer", {
          receiverId:
            data.senderId,
          callId:
            data.callId,
          answer,
        });
      } catch (error) {
        console.error(
          "WebRTC offer error:",
          error
        );
      }
    };

    // Optional WebRTC renegotiation
    const handleAnswer = async (
      data
    ) => {
      const active =
        callRef.current;

      const peer =
        peerRef.current;

      if (
        !active ||
        active.callId !==
          data.callId ||
        !peer ||
        !data.answer
      ) {
        return;
      }

      try {
        await peer.setRemoteDescription(
          data.answer
        );

        await addPendingIceCandidates(
          peer
        );
      } catch (error) {
        console.error(
          "WebRTC answer error:",
          error
        );
      }
    };

    socket.on(
      "incomingCall",
      handleIncomingCall
    );

    socket.on(
      "callAccepted",
      handleAccepted
    );

    socket.on(
      "callRejected",
      handleRejected
    );

    socket.on(
      "callUnavailable",
      handleUnavailable
    );

    socket.on(
      "callBusy",
      handleBusy
    );

    socket.on(
      "callEnded",
      handleEnded
    );

    socket.on(
      "iceCandidate",
      handleIceCandidate
    );

    socket.on(
      "webrtcOffer",
      handleOffer
    );

    socket.on(
      "webrtcAnswer",
      handleAnswer
    );

    return () => {
      socket.off(
        "incomingCall",
        handleIncomingCall
      );

      socket.off(
        "callAccepted",
        handleAccepted
      );

      socket.off(
        "callRejected",
        handleRejected
      );

      socket.off(
        "callUnavailable",
        handleUnavailable
      );

      socket.off(
        "callBusy",
        handleBusy
      );

      socket.off(
        "callEnded",
        handleEnded
      );

      socket.off(
        "iceCandidate",
        handleIceCandidate
      );

      socket.off(
        "webrtcOffer",
        handleOffer
      );

      socket.off(
        "webrtcAnswer",
        handleAnswer
      );
    };
  }, []);

  // Cleanup when Chat page closes
  useEffect(() => {
    return () => {
      cleanupMedia();
      callRef.current = null;
    };
  }, []);

  // Attach streams after UI appears
  useEffect(() => {
    if (!call) return;

    if (
      localVideoRef.current &&
      localStreamRef.current
    ) {
      localVideoRef.current.srcObject =
        localStreamRef.current;
    }

    if (
      remoteVideoRef.current &&
      remoteStreamRef.current
    ) {
      remoteVideoRef.current.srcObject =
        remoteStreamRef.current;
    }

    if (
      remoteAudioRef.current &&
      remoteStreamRef.current
    ) {
      remoteAudioRef.current.srcObject =
        remoteStreamRef.current;
    }
  }, [call]);

  if (!call && !error) {
    return null;
  }

  return (
    <>
      {/* CALL WINDOW */}
      {call && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-gray-900 text-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <h3 className="font-semibold">
                  {call.status ===
                  "incoming"
                    ? `${
                        call.callType ===
                        "video"
                          ? "📹"
                          : "📞"
                      } Incoming ${
                        call.callType
                      } call`
                    : `${
                        call.callType ===
                        "video"
                          ? "📹"
                          : "📞"
                      } ${
                        call.status ===
                        "calling"
                          ? "Calling"
                          : "Call"
                      }`}
                </h3>

                <p className="text-sm text-gray-300">
                  {call.name ||
                    "ChatSphere user"}
                </p>
              </div>

              {call.status !==
                "incoming" && (
                <span className="text-xs text-gray-400">
                  {call.status ===
                  "connected"
                    ? "Connected"
                    : "Ringing…"}
                </span>
              )}
            </div>

            {/* Incoming call */}
            {call.status ===
            "incoming" ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-5">
                  {call.callType ===
                  "video"
                    ? "📹"
                    : "📞"}
                </div>

                <p className="text-lg mb-6">
                  Someone is calling
                  you.
                </p>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={rejectCall}
                    className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700"
                  >
                    Reject
                  </button>

                  <button
                    onClick={acceptCall}
                    className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative aspect-video bg-black">

                {/* VIDEO CALL */}
                {call.callType ===
                "video" ? (
                  <>
                    <video
                      ref={
                        remoteVideoRef
                      }
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    <video
                      ref={
                        localVideoRef
                      }
                      autoPlay
                      muted
                      playsInline
                      className="absolute right-4 bottom-4 w-32 h-24 rounded-xl object-cover border border-white/30 bg-black"
                    />
                  </>
                ) : (
                  /* VOICE CALL */
                  <div className="h-full flex flex-col items-center justify-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-4xl">
                      📞
                    </div>

                    <audio
                      ref={
                        remoteAudioRef
                      }
                      autoPlay
                    />
                  </div>
                )}

                {/* END CALL */}
                <button
                  onClick={() =>
                    finishCall()
                  }
                  className="absolute left-1/2 -translate-x-1/2 bottom-6 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-xl"
                  title="End call"
                >
                  ☎
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && !call && (
        <div className="fixed bottom-5 right-5 z-[110] max-w-sm rounded-xl bg-red-600 text-white px-4 py-3 shadow-xl flex items-center gap-3">
          <span className="flex-1 text-sm">
            {error}
          </span>

          <button
            onClick={() =>
              setError("")
            }
            className="font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

export default CallManager;