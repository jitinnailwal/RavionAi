import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import moment from "moment";
import Markdown from "react-markdown";
import Prism from "prismjs";

const Message = ({ message }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              {moment(message.timestamp).fromNow()}
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

              {/* Full-Screen Modal */}
              {isModalOpen && (
                <div
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50"
                  onClick={() => setIsModalOpen(false)}
                >
                  <img
                    src={message.content}
                    alt="AI generated large"
                    className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()} // prevent closing when clicking on image
                  />
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-5 right-5 text-white text-3xl font-bold hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-primary reset-tw overflow-x-auto">
              <Markdown>{message.content}</Markdown>
            </div>
          )}

          <span className="text-xs text-text-muted">
            {moment(message.timestamp).fromNow()}
          </span>
        </div>
      )}
    </div>
  );
};

export default Message;
