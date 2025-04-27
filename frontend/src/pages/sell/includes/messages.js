import React, { useEffect, useState } from "react";
import axios from "axios";

const Messages = () => {
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [activePartnerId, setActivePartnerId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && (user._id || user.id)) {
          setUserId(user._id || user.id);
        }
      } catch (e) {
        console.error("Lỗi parse user từ localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchMessages = async () => {
      try {
        const inboxRes = await axios.get(`http://localhost:5000/api/messages/inbox/${userId}`);
        const sentRes = await axios.get(`http://localhost:5000/api/messages/sent/${userId}`);
        setMessages([...inboxRes.data, ...sentRes.data]);
      } catch (err) {
        console.error("Lỗi khi lấy tin nhắn:", err);
      }
    };

    fetchMessages();
  }, [userId]);

  const handleReply = async (messageId, receiverId) => {
    if (replyContent.trim() === "") return alert("Vui lòng nhập nội dung phản hồi!");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/messages/reply",
        { content: replyContent, messageId, receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, response.data]);
      setReplyContent("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Lỗi khi gửi phản hồi:", err);
      alert("Không thể gửi phản hồi. Vui lòng kiểm tra đăng nhập và thử lại.");
    }
  };

  const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / (1000 * 60));
    if (diff < 60) return `${diff} phút trước`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  const groupMessagesByPartner = () => {
    const grouped = {};
    messages.forEach((msg) => {
      const isSender = msg.senderId?._id === userId || msg.senderId === userId;
      const partner = isSender ? msg.receiverId : msg.senderId;
      const partnerId = typeof partner === "object" ? partner._id : partner;

      if (!grouped[partnerId]) {
        grouped[partnerId] = {
          partner,
          messages: [],
        };
      }
      grouped[partnerId].messages.push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByPartner();
  const currentMessages = activePartnerId ? groupedMessages[activePartnerId]?.messages || [] : [];

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="p-6 text-gray-600 bg-white shadow-sm rounded-lg">
          Vui lòng đăng nhập để xem tin nhắn
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[80vh] bg-gray-100 rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <h3 className="text-lg font-semibold p-4 border-b">Danh sách trò chuyện</h3>
        {Object.entries(groupedMessages)
          .sort(([, a], [, b]) => {
            const aLast = a.messages[a.messages.length - 1]?.createdAt || 0;
            const bLast = b.messages[b.messages.length - 1]?.createdAt || 0;
            return new Date(bLast) - new Date(aLast);
          })
          .map(([partnerId, { partner, messages }]) => {
            const lastMessage = messages[messages.length - 1];
            return (
              <div
                key={partnerId}
                className={`p-4 cursor-pointer hover:bg-gray-100 ${
                  activePartnerId === partnerId ? "bg-blue-50" : ""
                }`}
                onClick={() => setActivePartnerId(partnerId)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {(partner?.username || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="font-medium truncate">{partner?.username || "Người dùng"}</p>
                    <p className="text-sm text-gray-500 truncate">{lastMessage?.content}</p>
                    <p className="text-xs text-gray-400">{timeAgo(lastMessage?.createdAt)}</p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Main content */}
      <div className="w-2/3 p-6 overflow-y-auto">
        {activePartnerId ? (
          <div className="flex flex-col h-full">
            <div className="mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Đối thoại với {groupedMessages[activePartnerId]?.partner?.username || "Người dùng"}
              </h2>
            </div>
            <ul className="space-y-3 flex-1 overflow-y-auto">
              {currentMessages
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((msg) => {
                  const isSender = msg.senderId?._id === userId || msg.senderId === userId;
                  return (
                    <li key={msg._id} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-2/3 p-3 rounded-lg ${
                          isSender
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <div className="text-sm">{msg.content}</div>
                        <div
                          className={`text-xs mt-1 ${
                            isSender ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {timeAgo(msg.createdAt)}
                        </div>
                        {!isSender && (
                          <button
                            onClick={() =>
                              setReplyingTo({ messageId: msg._id, receiverId: activePartnerId })
                            }
                            className="mt-1 text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-600"
                          >
                            Trả lời
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>

            {replyingTo && replyingTo.receiverId === activePartnerId && (
              <div className="mt-4 border-t pt-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Nhập phản hồi..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows="3"
                />
                <div className="flex justify-end mt-2">
                  <button
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300"
                    onClick={() => setReplyingTo(null)}
                  >
                    Hủy
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    onClick={() =>
                      handleReply(replyingTo.messageId, replyingTo.receiverId)
                    }
                  >
                    Gửi phản hồi
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-lg">
              Hãy chọn một đoạn hội thoại để bắt đầu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
