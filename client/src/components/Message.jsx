import React, { useEffect, useState, memo } from "react";
import { createPortal } from "react-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import Markdown from "react-markdown";
import Prism from "prismjs";
import toast from "react-hot-toast";

// Lightweight relative time formatter - replaces moment.js
const timeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

const Message = memo(({ message, chatId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [published, setPublished] = useState(message.isPublished || false);
  const [toggling, setToggling] = useState(false);
  const { axios, token } = useAppContext();

  const togglePublish = async (e) => {
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    try {
      const { data } = await axios.post('/api/message/toggle-publish',
        { chatId, messageId: message._id },
        { headers: { Authorization: token } }
      );
      if (data.success) {
        setPublished(data.isPublished);
        toast.success(data.isPublished ? 'Added to community' : 'Removed from community');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Failed to update');
    } finally {
      setToggling(false);
    }
  };

  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  return (
    <div>
      {message.role === "user" ? (
        //USER MESSAGE
        <div className="flex items-start justify-end my-4 gap-2">
          <div
            className="flex flex-col gap-2 p-2 px-3 sm:px-4 glass rounded-md max-w-[85%] sm:max-w-2xl"
          >
            <p className="text-sm text-primary">{message.content}</p>
            <span className="text-xs text-text-muted">
              {timeAgo(message.timestamp)}
            </span>
          </div>
          <img src={assets.user_icon} alt="" className="w-8 rounded-full" />
        </div>
      ) : (
        //ASSISTANT MESSAGE
        <div
          className="inline-flex flex-col gap-2 p-2 px-3 sm:px-4 max-w-[85%] sm:max-w-2xl glass
          rounded-md my-4 border-gradient-from/20"
        >
          {message.isImage ? (
            <>
              <img
                src={message.content}
                alt="AI generated"
                className="w-full max-w-md mt-2 rounded-md cursor-pointer hover:opacity-90 transition"
                onClick={() => setIsModalOpen(true)}
              />

              <button
                onClick={togglePublish}
                disabled={toggling}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors w-fit ${
                  published
                    ? 'bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400'
                    : 'bg-bg-surface/50 text-text-muted hover:bg-green-500/15 hover:text-green-400'
                }`}
              >
                {published ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    In Community
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Share to Community
                  </>
                )}
              </button>

              {/* Full-Screen Modal - rendered via portal to escape overflow clipping */}
              {isModalOpen && createPortal(
                <div
                  className="fixed inset-0 bg-black/95 flex justify-center items-center z-50"
                  onClick={() => setIsModalOpen(false)}
                >
                  <img
                    src={message.content}
                    alt="AI generated large"
                    className="w-screen h-screen object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xl transition-colors"
                  >
                    ✕
                  </button>
                </div>,
                document.body
              )}
            </>
          ) : (
            <div className="text-sm text-primary reset-tw overflow-x-auto">
              <Markdown>{message.content}</Markdown>
            </div>
          )}

          <span className="text-xs text-text-muted">
            {timeAgo(message.timestamp)}
          </span>
        </div>
      )}
    </div>
  );
});

Message.displayName = "Message";

export default Message;
