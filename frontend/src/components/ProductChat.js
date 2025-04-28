import React, { useState, useEffect, useRef } from "react";
import {
  FiSend,
  FiMessageSquare,
  FiX,
  FiMinimize2,
  FiMaximize2,
  FiExternalLink,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import socketService from "../utils/socketService";

const ProductChat = ({ product, sellerId, sellerName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isSellerTyping, setIsSellerTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Handle socket connection
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    // Connect socket if not already connected
    if (!socketService.isConnected()) {
      socketService.connect(currentUser.id);
    }

    // Handle connection status changes
    const removeConnectionListener = socketService.addConnectionListener(
      (isConnected, error) => {
        setIsSocketConnected(isConnected);
        if (!isConnected && error) {
          setError("Chat connection lost. Please refresh the page.");
        } else if (isConnected) {
          setError(null);
        }
      }
    );

    // Handle incoming messages
    const removeMessageListener = socketService.addMessageListener(
      (message) => {
        // Make sure this message is for this conversation and product
        if (
          (message.senderId === sellerId || message.receiverId === sellerId) &&
          (!message.productId || message.productId === product.id)
        ) {
          setMessages((prevMessages) => {
            // Check if message already exists to prevent duplicates
            const exists = prevMessages.some(
              (m) =>
                m._id === message._id ||
                (m.content === message.content &&
                  m.senderId === message.senderId &&
                  m.timestamp === message.timestamp)
            );
            if (exists) return prevMessages;
            return [...prevMessages, message];
          });

          // Mark message as read if it's to the current user
          if (message.receiverId === currentUser.id && message._id) {
            fetch(`http://localhost:9999/messages/${message._id}/read`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }).catch((err) =>
              console.error("Error marking message as read:", err)
            );
          }
        }
      }
    );

    // Handle typing indicators
    const removeTypingListener = socketService.addTypingListener(
      (data, isTyping) => {
        if (
          data.userId === sellerId &&
          (!data.productId || data.productId === product.id)
        ) {
          setIsSellerTyping(isTyping);
        }
      }
    );

    // Fetch seller info
    const fetchSellerInfo = async () => {
      try {
        const response = await fetch(`http://localhost:9999/users/${sellerId}`);
        if (response.ok) {
          const data = await response.json();
          setSellerInfo(data);
        }
      } catch (err) {
        console.error("Error fetching seller info:", err);
      }
    };

    fetchSellerInfo();

    // Fetch conversation history
    const fetchMessages = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await fetch(
          `http://localhost:9999/messages/conversation/${currentUser.id}/${sellerId}?productId=${product.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch messages");

        const data = await response.json();
        setMessages(data);

        // Mark unread messages as read
        const unreadMessages = data.filter(
          (msg) => !msg.read && msg.senderId === sellerId
        );

        if (unreadMessages.length > 0) {
          const markReadPromises = unreadMessages.map((msg) =>
            fetch(`http://localhost:9999/messages/${msg._id}/read`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
          );

          await Promise.all(markReadPromises);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load message history.");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchMessages();

    // Clean up listeners
    return () => {
      removeConnectionListener();
      removeMessageListener();
      removeTypingListener();
    };
  }, [isOpen, currentUser, sellerId, product.id]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Monitor scroll position to show "scroll to bottom" button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollDown(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Focus input when opening chat
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !currentUser || !isSocketConnected) return;

    // Send message via socket
    const sent = socketService.sendMessage(
      currentUser.id,
      sellerId,
      message.trim(),
      product.id
    );

    if (sent) {
      setMessage("");
      // Signal that user stopped typing
      socketService.sendStopTyping(currentUser.id, sellerId, product.id);
    } else {
      setError("Failed to send message. Please check your connection.");
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!isSocketConnected) return;

    // Clear existing timeout
    if (typingTimeout) clearTimeout(typingTimeout);

    // Send typing indicator
    socketService.sendTyping(currentUser.id, sellerId, product.id);

    // Set timeout to stop typing indicator after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      socketService.sendStopTyping(currentUser.id, sellerId, product.id);
    }, 2000);

    setTypingTimeout(timeout);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Same day - show only time
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    // Yesterday - show "Yesterday"
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Within 7 days - show day name
    const diffDays = Math.round((today - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: "long" });
    }

    // Older - show date
    return date.toLocaleDateString();
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;
    let currentMessages = [];

    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt || msg.timestamp);
      const dateString = msgDate.toDateString();

      if (dateString !== currentDate) {
        if (currentMessages.length > 0) {
          groups.push({
            date: currentDate,
            messages: currentMessages,
          });
        }
        currentDate = dateString;
        currentMessages = [msg];
      } else {
        currentMessages.push(msg);
      }
    });

    if (currentMessages.length > 0) {
      groups.push({
        date: currentDate,
        messages: currentMessages,
      });
    }

    return groups;
  };

  if (!currentUser) {
    return (
      <button
        onClick={() => alert("Please log in to chat with the seller")}
        className="fixed bottom-4 right-4 bg-[#0053A0] hover:bg-[#00438A] text-white p-3 rounded-full shadow-lg z-50"
      >
        <FiMessageSquare size={24} />
      </button>
    );
  }

  // Don't show chat button if viewing own product
  if (currentUser.id === sellerId) {
    return null;
  }

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <button
          id="productChatButton"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 bg-[#0053A0] hover:bg-[#00438A] text-white p-3 rounded-full shadow-lg z-50 flex items-center justify-center"
          aria-label="Chat with seller"
        >
          <FiMessageSquare size={24} />
        </button>
      )}

      {/* Chat modal */}
      {isOpen && (
        <div
          className={`fixed ${
            isMinimized
              ? "bottom-4 right-4 w-60 h-12"
              : "bottom-4 right-4 w-96 h-[500px]"
          } 
                     bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-300 transition-all duration-300`}
        >
          {/* Header */}
          <div className="bg-[#0053A0] text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <FiMessageSquare className="mr-2" />
              {!isMinimized && (
                <div>
                  <h3 className="font-medium text-sm">
                    {sellerInfo?.fullname || sellerName || "Seller"}
                  </h3>
                  <p className="text-xs text-white/70 truncate max-w-[180px]">
                    About: {product.title}
                  </p>
                </div>
              )}
              {isMinimized && (
                <h3 className="font-medium text-sm truncate">
                  Chat with {sellerInfo?.fullname || sellerName || "Seller"}
                </h3>
              )}
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:text-white/80 mr-2"
                aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
              >
                {isMinimized ? (
                  <FiMaximize2 size={16} />
                ) : (
                  <FiMinimize2 size={16} />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-white/80"
                aria-label="Close chat"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Product info */}
              <div className="p-3 border-b border-gray-200 flex items-center">
                <img
                  src={`${product.image}/100`}
                  alt={product.title}
                  className="w-12 h-12 object-cover rounded mr-3"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-1">
                    {product.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    £{(product.price / 100).toFixed(2)}
                  </p>
                </div>
                <a
                  href={`/product/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 p-1 hover:bg-blue-50 rounded"
                >
                  <FiExternalLink size={16} />
                </a>
              </div>

              {/* Messages area */}
              <div
                ref={messagesContainerRef}
                className="flex-grow overflow-y-auto p-4 bg-gray-50"
              >
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0053A0]"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center p-2 bg-red-50 rounded">
                    {error}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-4">
                    <p>No messages yet.</p>
                    <p className="text-sm">
                      Start the conversation with{" "}
                      {sellerInfo?.fullname || sellerName || "the seller"}!
                    </p>
                  </div>
                ) : (
                  <>
                    {groupMessagesByDate(messages).map((group, groupIndex) => (
                      <div key={groupIndex} className="mb-4">
                        <div className="text-center mb-3">
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">
                            {formatDate(group.date)}
                          </span>
                        </div>

                        {group.messages.map((msg, index) => {
                          const isFromCurrentUser =
                            msg.senderId === currentUser.id;
                          const showReadStatus =
                            isFromCurrentUser &&
                            index === group.messages.length - 1 &&
                            groupIndex ===
                              groupMessagesByDate(messages).length - 1;

                          return (
                            <div
                              key={msg._id || index}
                              className={`mb-3 flex ${
                                isFromCurrentUser
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  isFromCurrentUser
                                    ? "bg-[#0053A0] text-white rounded-br-none"
                                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                                }`}
                              >
                                <p className="text-sm">{msg.content}</p>
                                <div className="flex items-center justify-end text-xs mt-1">
                                  <span
                                    className={`${
                                      isFromCurrentUser
                                        ? "text-blue-100"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {formatTime(msg.createdAt || msg.timestamp)}
                                  </span>

                                  {showReadStatus && (
                                    <span className="ml-1">
                                      {msg.read ? (
                                        <span className="flex items-center text-blue-100">
                                          <FiCheckCircle
                                            size={12}
                                            className="ml-1"
                                          />
                                        </span>
                                      ) : (
                                        <span className="flex items-center text-blue-100">
                                          <FiClock size={12} className="ml-1" />
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    {isSellerTyping && (
                      <div className="flex justify-start mb-2">
                        <div className="bg-gray-100 text-gray-500 p-2 rounded-lg text-sm">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}

                {/* Scroll to bottom button */}
                {showScrollDown && (
                  <button
                    className="absolute bottom-20 right-4 bg-gray-200 hover:bg-gray-300 rounded-full p-2 shadow-md"
                    onClick={() => scrollToBottom("auto")}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Connection status indicator */}
              {!isSocketConnected && (
                <div className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs border-t border-yellow-100">
                  Connecting to chat...
                </div>
              )}

              {/* Input area */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-gray-200 flex"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  placeholder="Type your message here..."
                  className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#0053A0]"
                  disabled={!isSocketConnected}
                />
                <button
                  type="submit"
                  className={`p-2 rounded-r-md ${
                    isSocketConnected && message.trim()
                      ? "bg-[#0053A0] text-white hover:bg-[#00438A]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!isSocketConnected || !message.trim()}
                >
                  <FiSend size={20} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* CSS for typing indicator */}
      <style jsx="true">{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }

        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 1px;
          background-color: #999;
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.5s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) {
          animation-delay: -0.3s;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: -0.15s;
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </>
  );
};

export default ProductChat;
