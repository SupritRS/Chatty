import { Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  const handleVideoCall = () => {
    if (onlineUsers.includes(selectedUser._id)) {
      setIsVideoCallActive(true);
      // TODO: Implement your video call logic here
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleVideoCall}
            className="btn btn-ghost btn-circle"
            disabled={!onlineUsers.includes(selectedUser._id)}
            title={onlineUsers.includes(selectedUser._id) ? "Start video call" : "User is offline"}
            aria-label="Start video call"
          >
            <Video className="size-5" />
          </button>
          
          <button 
            onClick={() => setSelectedUser(null)} 
            className="btn btn-ghost btn-circle"
            aria-label="Close chat"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Video Call Modal */}
      {isVideoCallActive && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-base-100 rounded-lg p-4 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Video Call with {selectedUser.fullName}
              </h3>
              <button 
                onClick={() => setIsVideoCallActive(false)}
                className="btn btn-ghost btn-circle"
                aria-label="End call"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 h-[400px]">
              {/* Local video placeholder */}
              <div className="bg-base-300 rounded-lg flex items-center justify-center">
                <p>Your Video</p>
              </div>

              {/* Remote video placeholder */}
              <div className="bg-base-300 rounded-lg flex items-center justify-center">
                <p>{selectedUser.fullName}'s Video</p>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-4">
              <button 
                className="btn btn-error"
                onClick={() => setIsVideoCallActive(false)}
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;