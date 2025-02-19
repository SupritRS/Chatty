import { Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState, useEffect } from "react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [meeting, setMeeting] = useState(null);
  const [localParticipant, setLocalParticipant] = useState(null);
  const [remoteParticipantId, setRemoteParticipantId] = useState("");

  useEffect(() => {
    if (isVideoCallActive && !meeting) {
      startVideoCall();
    }
  }, [isVideoCallActive]);

  const startVideoCall = () => {
    if (!selectedUser || !onlineUsers.includes(selectedUser._id)) return;

    window.VideoSDK.config("YOUR_VIDEOSDK_API_KEY");
    const newMeeting = window.VideoSDK.initMeeting({
      meetingId: "unique-meeting-id", // Generate dynamically if needed
      name: "Chat App", 
      micEnabled: true,
      webcamEnabled: true,
    });

    newMeeting.join();
    setMeeting(newMeeting);

    // Handle local participant
    const localVideo = createVideoElement(newMeeting.localParticipant.id);
    setLocalParticipant(localVideo);
    document.getElementById("videoContainer").appendChild(localVideo);

    newMeeting.localParticipant.on("stream-enabled", (stream) => {
      setTrack(stream, newMeeting.localParticipant, true);
    });

    // Handle remote participants
    newMeeting.on("participant-joined", (participant) => {
      const remoteVideo = createVideoElement(participant.id);
      setRemoteParticipantId(participant.id);
      document.getElementById("videoContainer").appendChild(remoteVideo);
      participant.on("stream-enabled", (stream) => {
        setTrack(stream, participant, false);
      });
    });

    // Handle participant leaving
    newMeeting.on("participant-left", (participant) => {
      removeParticipant(participant.id);
    });
  };

  const endVideoCall = () => {
    if (meeting) {
      meeting.leave();
      setMeeting(null);
      setIsVideoCallActive(false);
      removeParticipant(remoteParticipantId);
      removeParticipant(meeting.localParticipant.id);
    }
  };

  const createVideoElement = (participantId) => {
    let videoElement = document.createElement("video");
    videoElement.classList.add("video-frame");
    videoElement.setAttribute("id", `v-${participantId}`);
    videoElement.setAttribute("playsinline", "true");
    videoElement.setAttribute("width", "300");
    return videoElement;
  };

  const setTrack = (stream, participant, isLocal) => {
    if (stream.kind === "video") {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(stream.track);
      let videoElm = document.getElementById(`v-${participant.id}`);
      videoElm.srcObject = mediaStream;
      videoElm.play().catch((err) => console.error("Video play failed", err));
    }
  };

  const removeParticipant = (participantId) => {
    let videoElement = document.getElementById(`v-${participantId}`);
    if (videoElement) videoElement.remove();
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVideoCallActive(true)}
            className="btn btn-ghost btn-circle"
            disabled={!onlineUsers.includes(selectedUser._id)}
          >
            <Video className="size-5" />
          </button>
          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-ghost btn-circle"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
      {isVideoCallActive && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-base-100 rounded-lg p-4 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Video Call with {selectedUser.fullName}</h3>
              <button onClick={endVideoCall} className="btn btn-ghost btn-circle">
                <X className="size-5" />
              </button>
            </div>
            <div id="videoContainer" className="grid grid-cols-2 gap-4 h-[400px]"></div>
            <div className="flex justify-center gap-4 mt-4">
              <button className="btn btn-error" onClick={endVideoCall}>End Call</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
