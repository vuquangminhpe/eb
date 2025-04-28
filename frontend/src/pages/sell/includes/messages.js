import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiMessageSquare,
  FiSend,
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiFilter,
  FiRefreshCw,
} from "react-icons/fi";
import socketService from "../../../utils/socketService";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [userTyping, setUserTyping] = useState({});
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [filter, setFilter] = useState("all"); // all, products, unread
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs để tránh re-render không cần thiết
  const currentUserRef = useRef(
    JSON.parse(localStorage.getItem("currentUser"))
  );
  const messagesRef = useRef(messages);
  const conversationsRef = useRef(conversations);
  const activeConversationRef = useRef(activeConversation);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fetchTimeoutRef = useRef(null);
  const refreshTimerRef = useRef(null);

  // Cập nhật refs khi state thay đổi
  useEffect(() => {
    messagesRef.current = messages;
    conversationsRef.current = conversations;
    activeConversationRef.current = activeConversation;
  }, [messages, conversations, activeConversation]);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Memoized function để fetch conversations
  const fetchConversations = useCallback(
    async (forceRefresh = false) => {
      if (!currentUserRef.current) return;

      // Tránh refreshing liên tục
      if (isRefreshing && !forceRefresh) return;

      // Nếu là lần đầu fetch, set loading
      if (conversations.length === 0 && !isRefreshing) {
        setLoading(true);
      }

      if (forceRefresh) {
        setIsRefreshing(true);
      }

      try {
        // Tránh fetch nhiều lần trong thời gian ngắn
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }

        fetchTimeoutRef.current = setTimeout(async () => {
          const response = await fetch(
            `http://localhost:9999/messages/conversations/${currentUserRef.current.id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch conversations");

          const data = await response.json();

          // So sánh dữ liệu mới với hiện tại
          if (
            JSON.stringify(data) !== JSON.stringify(conversationsRef.current)
          ) {
            // Sắp xếp theo thời gian tin nhắn mới nhất
            const sortedData = [...data].sort((a, b) => {
              const dateA = new Date(
                a.latestMessage?.createdAt || a.latestMessage?.timestamp || 0
              );
              const dateB = new Date(
                b.latestMessage?.createdAt || b.latestMessage?.timestamp || 0
              );
              return dateB - dateA;
            });

            setConversations(sortedData);

            // Nếu có active conversation, kiểm tra nó có còn trong danh sách không
            if (activeConversationRef.current) {
              const stillExists = sortedData.some(
                (conv) =>
                  conv.otherUser._id ===
                    activeConversationRef.current.otherUser._id &&
                  (!conv.product ||
                    !activeConversationRef.current.product ||
                    conv.product._id ===
                      activeConversationRef.current.product._id)
              );

              if (!stillExists) {
                setActiveConversation(null);
                setMessages([]);
              }
            }
          }

          setError(null);
          setInitialDataLoaded(true);
        }, 300);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError("Failed to load conversations. Please try again.");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [conversations.length, isRefreshing]
  );

  // Memoized function để fetch messages
  const fetchMessages = useCallback(async () => {
    if (!activeConversationRef.current || !currentUserRef.current) return;

    setLoading(true);
    try {
      const endpoint = `http://localhost:9999/messages/conversation/${currentUserRef.current.id}/${activeConversationRef.current.otherUser._id}`;
      const url = activeConversationRef.current.product
        ? `${endpoint}?productId=${activeConversationRef.current.product._id}`
        : endpoint;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();

      // So sánh dữ liệu mới với hiện tại
      if (JSON.stringify(data) !== JSON.stringify(messagesRef.current)) {
        setMessages(data);
      }

      // Mark messages as read
      const unreadMessages = data.filter(
        (m) => !m.read && m.receiverId === currentUserRef.current.id
      );

      if (unreadMessages.length > 0) {
        // Gộp các request đánh dấu đã đọc
        await Promise.all(
          unreadMessages.map((msg) =>
            fetch(`http://localhost:9999/messages/${msg._id}/read`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
          )
        );

        // Cập nhật conversation list để giảm unreadCount
        setConversations((prev) =>
          prev.map((conv) => {
            if (
              conv.otherUser._id ===
                activeConversationRef.current.otherUser._id &&
              (!conv.product ||
                !activeConversationRef.current.product ||
                conv.product._id === activeConversationRef.current.product._id)
            ) {
              return { ...conv, unreadCount: 0 };
            }
            return conv;
          })
        );
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetching
  useEffect(() => {
    if (!currentUserRef.current) return;

    // Fetch conversations only once on initial load
    if (!initialDataLoaded) {
      fetchConversations();
    }

    // Clean up timers on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [fetchConversations, initialDataLoaded]);

  // Set up refresh timer after initial data is loaded
  useEffect(() => {
    if (initialDataLoaded && currentUserRef.current) {
      // Reset existing timer if any
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }

      // Set up a new refresh interval - 60 seconds instead of 30
      refreshTimerRef.current = setInterval(() => {
        fetchConversations(true);
      }, 60000);

      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [fetchConversations, initialDataLoaded]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages();

      // Focus on input field
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [activeConversation, fetchMessages]);

  // Socket connection and event handling
  useEffect(() => {
    if (!currentUserRef.current) return;

    let isMounted = true;
    let removeConnectionListener = () => {};
    let removeMessageListener = () => {};
    let removeTypingListener = () => {};

    const setupSocket = async () => {
      // Connect socket if not already connected
      await socketService.connect(currentUserRef.current.id);

      if (!isMounted) return;

      // Handle connection status changes
      removeConnectionListener = socketService.addConnectionListener(
        (isConnected, error) => {
          if (!isMounted) return;

          setIsSocketConnected(isConnected);
          if (!isConnected && error) {
            setError("Chat connection lost. Please refresh the page.");
          } else if (isConnected) {
            setError(null);
          }
        }
      );

      // Handle incoming messages
      removeMessageListener = socketService.addMessageListener((message) => {
        if (!isMounted) return;

        // Update messages if conversation is active
        if (
          activeConversationRef.current &&
          (message.senderId === activeConversationRef.current.otherUser._id ||
            message.receiverId ===
              activeConversationRef.current.otherUser._id) &&
          (!activeConversationRef.current.product ||
            !message.productId ||
            message.productId === activeConversationRef.current.product._id)
        ) {
          setMessages((prevMessages) => {
            // Check if message already exists to prevent duplicates
            const exists = prevMessages.some(
              (m) =>
                m._id === message._id ||
                (m.content === message.content &&
                  m.senderId === message.senderId &&
                  Math.abs(
                    new Date(m.timestamp || m.createdAt) -
                      new Date(message.timestamp || message.createdAt)
                  ) < 1000)
            );
            if (exists) return prevMessages;
            return [...prevMessages, message];
          });

          // Mark message as read if it's to the current user
          if (message.receiverId === currentUserRef.current.id && message._id) {
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

        // Update conversation list efficiently
        setConversations((prevConversations) => {
          const otherUserId =
            message.senderId === currentUserRef.current.id
              ? message.receiverId
              : message.senderId;

          const updatedConversations = [...prevConversations];
          let needsUpdate = false;

          // Find if conversation exists
          const conversationIndex = updatedConversations.findIndex(
            (conv) =>
              conv.otherUser._id === otherUserId &&
              (!conv.product ||
                !message.productId ||
                conv.product._id === message.productId)
          );

          if (conversationIndex >= 0) {
            // Only update if the message is newer
            const currentLatestDate = new Date(
              updatedConversations[conversationIndex].latestMessage
                ?.createdAt ||
                updatedConversations[conversationIndex].latestMessage
                  ?.timestamp ||
                0
            );
            const newMessageDate = new Date(
              message.createdAt || message.timestamp
            );

            if (newMessageDate > currentLatestDate) {
              // Update existing conversation
              updatedConversations[conversationIndex] = {
                ...updatedConversations[conversationIndex],
                latestMessage: message,
                unreadCount:
                  message.senderId === currentUserRef.current.id
                    ? 0
                    : // Only increment unread count if not in active conversation
                      activeConversationRef.current &&
                      activeConversationRef.current.otherUser._id ===
                        otherUserId &&
                      (!activeConversationRef.current.product ||
                        !message.productId ||
                        activeConversationRef.current.product._id ===
                          message.productId)
                    ? 0
                    : (updatedConversations[conversationIndex].unreadCount ||
                        0) + 1,
              };
              needsUpdate = true;
            }
          } else {
            // Create new conversation entry
            updatedConversations.push({
              otherUser: { _id: otherUserId, username: "User" }, // Basic info, will be updated on next refresh
              product: message.productId ? { _id: message.productId } : null,
              latestMessage: message,
              unreadCount:
                message.senderId === currentUserRef.current.id ? 0 : 1,
            });
            needsUpdate = true;
          }

          // Only sort and return updated array if changes were made
          if (needsUpdate) {
            // Sort by latest message
            return updatedConversations.sort((a, b) => {
              const dateA = new Date(
                a.latestMessage?.createdAt || a.latestMessage?.timestamp || 0
              );
              const dateB = new Date(
                b.latestMessage?.createdAt || b.latestMessage?.timestamp || 0
              );
              return dateB - dateA;
            });
          }

          return prevConversations;
        });
      });

      // Handle typing indicators
      removeTypingListener = socketService.addTypingListener(
        (data, isTyping) => {
          if (!isMounted) return;

          setUserTyping((prev) => {
            // Nếu không thay đổi trạng thái, không cập nhật state
            if (prev[data.userId]?.isTyping === isTyping) {
              return prev;
            }

            return {
              ...prev,
              [data.userId]: isTyping
                ? { isTyping, productId: data.productId, timestamp: Date.now() }
                : undefined,
            };
          });
        }
      );
    };

    setupSocket();

    // Clean up listeners on unmount
    return () => {
      isMounted = false;
      removeConnectionListener();
      removeMessageListener();
      removeTypingListener();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (
      !message.trim() ||
      !currentUserRef.current ||
      !activeConversationRef.current ||
      !isSocketConnected
    )
      return;

    const productId = activeConversationRef.current.product?._id;

    // Send message via socket
    const sent = socketService.sendMessage(
      currentUserRef.current.id,
      activeConversationRef.current.otherUser._id,
      message.trim(),
      productId
    );

    if (sent) {
      setMessage("");
      // Clear typing indicator
      socketService.sendStopTyping(
        currentUserRef.current.id,
        activeConversationRef.current.otherUser._id,
        productId
      );
    } else {
      setError("Failed to send message. Please check your connection.");
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!isSocketConnected || !activeConversationRef.current) return;

    // Clear existing timeout
    if (typingTimeout) clearTimeout(typingTimeout);

    // Send typing indicator
    socketService.sendTyping(
      currentUserRef.current.id,
      activeConversationRef.current.otherUser._id,
      activeConversationRef.current.product?._id
    );

    // Set timeout to stop typing indicator after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      socketService.sendStopTyping(
        currentUserRef.current.id,
        activeConversationRef.current.otherUser._id,
        activeConversationRef.current.product?._id
      );
    }, 2000);

    setTypingTimeout(timeout);
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      // Today, show time
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      // Within a week, show day of week
      return (
        date.toLocaleDateString([], { weekday: "short" }) +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else {
      // Older, show date
      return date.toLocaleDateString();
    }
  };

  // Filter conversations based on search and filters
  const filteredConversations = conversations.filter((conv) => {
    // Apply search term
    const matchesSearch =
      (conv.otherUser?.username || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (conv.otherUser?.fullname || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (conv.product?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (conv.latestMessage?.content || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Apply filter
    const matchesFilter =
      filter === "all" ||
      (filter === "products" && conv.product) ||
      (filter === "unread" && conv.unreadCount > 0);

    return matchesSearch && matchesFilter;
  });

  // Check if a user is typing in the active conversation
  const isOtherUserTyping =
    activeConversation &&
    userTyping[activeConversation.otherUser._id]?.isTyping &&
    (!activeConversation.product ||
      !userTyping[activeConversation.otherUser._id]?.productId ||
      userTyping[activeConversation.otherUser._id]?.productId ===
        activeConversation.product._id);

  // Handle manual refresh
  const handleManualRefresh = () => {
    fetchConversations(true);
    if (activeConversation) {
      fetchMessages();
    }
  };

  if (!currentUserRef.current) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center p-8">
          <FiMessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Sign in to view messages
          </h3>
          <p className="text-gray-500">
            You need to be logged in to access your messages.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-220px)] min-h-[600px]">
      <div className="flex h-full">
        {/* Conversation List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-lg">Messages</h2>
              <button
                onClick={handleManualRefresh}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                disabled={isRefreshing}
                title="Refresh messages"
              >
                <FiRefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            {/* Search and filters */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center text-sm">
                <div className="flex items-center mr-4">
                  <FiFilter className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-gray-600 mr-2">Filter:</span>
                </div>

                <button
                  onClick={() => setFilter("all")}
                  className={`mr-3 px-2 py-1 rounded-full ${
                    filter === "all"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("products")}
                  className={`mr-3 px-2 py-1 rounded-full ${
                    filter === "products"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`mr-3 px-2 py-1 rounded-full ${
                    filter === "unread"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Unread
                </button>
              </div>
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-grow overflow-y-auto">
            {loading && conversations.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                {searchTerm || filter !== "all"
                  ? "No messages match your search or filter."
                  : "No messages found."}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const convKey = `${conv.otherUser?._id}-${
                  conv.product?._id || "noproduct"
                }`;

                return (
                  <div
                    key={convKey}
                    onClick={() => setActiveConversation(conv)}
                    className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      activeConversation?.otherUser?._id ===
                        conv.otherUser?._id &&
                      (!activeConversation?.product ||
                        !conv.product ||
                        activeConversation?.product?._id === conv.product?._id)
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 relative">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                          {(conv.otherUser?.username ||
                            conv.otherUser?.fullname ||
                            "?")[0].toUpperCase()}
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conv.otherUser?.fullname ||
                              conv.otherUser?.username ||
                              "User"}
                          </h3>
                          <span className="text-xs text-gray-500 ml-1 whitespace-nowrap">
                            {formatMessageTime(
                              conv.latestMessage?.createdAt ||
                                conv.latestMessage?.timestamp
                            )}
                          </span>
                        </div>

                        {/* Product info if present */}
                        {conv.product && (
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <FiPackage className="mr-1 h-3 w-3" />
                            <span className="truncate">
                              Re: {conv.product.title || "Product"}
                            </span>
                          </div>
                        )}

                        {/* Latest message */}
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conv.latestMessage?.senderId ===
                          currentUserRef.current.id
                            ? "You: "
                            : ""}
                          {conv.latestMessage?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Connection status indicator */}
          <div
            className={`p-2 text-xs border-t ${
              isSocketConnected
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {isSocketConnected ? (
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span>Connected</span>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                <span>Connecting...</span>
              </div>
            )}
          </div>
        </div>

        {/* Conversation Detail */}
        <div className="w-2/3 flex flex-col">
          {activeConversation ? (
            <>
              {/* Conversation header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <button
                  onClick={() => setActiveConversation(null)}
                  className="md:hidden mr-2 text-gray-500 hover:text-gray-700"
                >
                  <FiArrowLeft className="h-5 w-5" />
                </button>
                <div className="mr-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {(activeConversation.otherUser?.username ||
                      activeConversation.otherUser?.fullname ||
                      "?")[0].toUpperCase()}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {activeConversation.otherUser?.fullname ||
                      activeConversation.otherUser?.username ||
                      "User"}
                  </h3>
                  {activeConversation.product && (
                    <div className="flex items-center text-xs text-gray-600">
                      <span>Regarding: </span>
                      <Link
                        to={`/product/${activeConversation.product._id}`}
                        className="text-blue-600 hover:underline ml-1 truncate"
                      >
                        {activeConversation.product.title || "Product"}
                      </Link>
                    </div>
                  )}
                </div>
                <div className="ml-auto flex items-center">
                  <button
                    onClick={() =>
                      window.open(
                        `/product/${activeConversation.product?._id}`,
                        "_blank"
                      )
                    }
                    className="text-gray-500 hover:text-gray-700 text-sm flex items-center"
                    disabled={!activeConversation.product}
                  >
                    <FiPackage className="mr-1" />
                    <span>View Product</span>
                  </button>
                </div>
              </div>

              {/* Product context (if available) */}
              {activeConversation.product && (
                <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center">
                  <img
                    src={`${
                      activeConversation.product.image || "/placeholder.jpg"
                    }/100`}
                    alt={activeConversation.product.title}
                    className="w-12 h-12 object-cover rounded mr-3"
                  />
                  <div>
                    <p className="text-sm font-medium line-clamp-1">
                      {activeConversation.product.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      £
                      {((activeConversation.product.price || 0) / 100).toFixed(
                        2
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200 text-center">
                    {error}
                    <button
                      onClick={() =>
                        setActiveConversation({ ...activeConversation })
                      } // Force refresh
                      className="ml-2 text-red-700 underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No messages yet.</p>
                    <p className="text-sm mt-1">
                      Start the conversation with{" "}
                      {activeConversation.otherUser?.fullname ||
                        activeConversation.otherUser?.username ||
                        "this user"}
                      !
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, index) => {
                      const isFromCurrentUser =
                        msg.senderId === currentUserRef.current.id;
                      return (
                        <div
                          key={msg._id || `temp-${index}`}
                          className={`flex ${
                            isFromCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              isFromCurrentUser
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <div
                              className={`text-xs mt-1 flex justify-between items-center ${
                                isFromCurrentUser
                                  ? "text-blue-200"
                                  : "text-gray-500"
                              }`}
                            >
                              <span>
                                {formatMessageTime(
                                  msg.createdAt || msg.timestamp
                                )}
                              </span>
                              {isFromCurrentUser && (
                                <span className="ml-2">
                                  {msg.read ? "Read" : "Sent"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isOtherUserTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-gray-200 flex items-center"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  placeholder="Type your message here..."
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={!isSocketConnected}
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-r-md ${
                    isSocketConnected && message.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!isSocketConnected || !message.trim()}
                >
                  <FiSend className="h-5 w-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center flex-grow bg-gray-50">
              <div className="text-center p-8">
                <FiMessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Your Messages
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Select a conversation from the left to view messages. You can
                  respond to product inquiries and manage all your
                  communications here.
                </p>
                <button
                  onClick={() => setFilter("unread")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center mx-auto"
                >
                  <FiFilter className="mr-2" />
                  Show Unread Messages
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default Messages;
