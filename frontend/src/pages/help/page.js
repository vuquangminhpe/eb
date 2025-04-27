"use client"

import { useState, useEffect, useRef } from "react"
import {
  FiSearch,
  FiShoppingCart,
  FiMessageSquare,
  FiPhone,
  FiMail,
  FiChevronDown,
  FiArrowRight,
  FiHelpCircle,
  FiClock,
  FiCheckCircle,
  FiShield,
  FiPackage,
  FiCreditCard,
  FiDollarSign,
  FiSettings,
  FiUsers,
  FiSend,
  FiThumbsUp,
  FiThumbsDown,
  FiExternalLink,
  FiFileText,
} from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"
import TopMenu from "../../components/TopMenu"
import MainHeader from "../../components/MainHeader"
import SubMenu from "../../components/SubMenu"
import Footer from "../../components/Footer"

// Giả định các component này đã được tạo trong dự án của bạn


// Dữ liệu mẫu cho các chủ đề trợ giúp phổ biến
const POPULAR_TOPICS = [
  {
    id: 1,
    title: "Trả lại hàng & hoàn tiền",
    icon: <FiPackage className="h-6 w-6" />,
    color: "#0053A0",
    description: "Cách trả lại hàng và nhận hoàn tiền",
    articles: 24,
  },
  {
    id: 2,
    title: "Thanh toán & Hóa đơn",
    icon: <FiCreditCard className="h-6 w-6" />,
    color: "#e43147",
    description: "Quản lý thanh toán và xem hóa đơn",
    articles: 18,
  },
  {
    id: 3,
    title: "Tài khoản & Bảo mật",
    icon: <FiShield className="h-6 w-6" />,
    color: "#00668A",
    description: "Bảo vệ tài khoản và thông tin cá nhân",
    articles: 15,
  },
  {
    id: 4,
    title: "Mua hàng & Đặt hàng",
    icon: <FiShoppingCart className="h-6 w-6" />,
    color: "#00A86B",
    description: "Hướng dẫn mua hàng và theo dõi đơn hàng",
    articles: 22,
  },
  {
    id: 5,
    title: "Bán hàng & Đăng tin",
    icon: <FiDollarSign className="h-6 w-6" />,
    color: "#FF8C00",
    description: "Hướng dẫn bán hàng và quản lý tin đăng",
    articles: 30,
  },
  {
    id: 6,
    title: "Cài đặt tài khoản",
    icon: <FiSettings className="h-6 w-6" />,
    color: "#8A2BE2",
    description: "Thay đổi cài đặt và tùy chọn tài khoản",
    articles: 12,
  },
]

// Dữ liệu mẫu cho các câu hỏi thường gặp
const FAQS = [
  {
    id: 1,
    question: "Làm thế nào để theo dõi đơn hàng của tôi?",
    answer:
      "Bạn có thể theo dõi đơn hàng bằng cách đăng nhập vào tài khoản eBay của mình, đi đến mục 'Đơn hàng của tôi', và nhấp vào 'Theo dõi' bên cạnh đơn hàng bạn muốn kiểm tra. Bạn cũng có thể nhận thông báo cập nhật về trạng thái đơn hàng qua email hoặc ứng dụng eBay.",
    category: "Mua hàng & Đặt hàng",
  },
  {
    id: 2,
    question: "Làm thế nào để trả lại một món hàng?",
    answer:
      "Để trả lại một món hàng, hãy đăng nhập vào tài khoản eBay của bạn, đi đến 'Đơn hàng của tôi', tìm đơn hàng bạn muốn trả lại, và nhấp vào 'Trả lại hàng'. Làm theo hướng dẫn để hoàn tất quy trình trả hàng. Lưu ý rằng chính sách trả hàng có thể khác nhau tùy thuộc vào người bán.",
    category: "Trả lại hàng & hoàn tiền",
  },
  {
    id: 3,
    question: "Tôi quên mật khẩu eBay của mình. Làm thế nào để đặt lại?",
    answer:
      "Nếu bạn quên mật khẩu, hãy nhấp vào liên kết 'Đăng nhập' ở góc trên cùng của trang eBay, sau đó nhấp vào 'Quên mật khẩu của bạn?'. Nhập địa chỉ email hoặc tên người dùng của bạn và làm theo hướng dẫn để đặt lại mật khẩu. Bạn sẽ nhận được email với hướng dẫn để tạo mật khẩu mới.",
    category: "Tài khoản & Bảo mật",
  },
  {
    id: 4,
    question: "Làm thế nào để liên hệ với người bán?",
    answer:
      "Để liên hệ với người bán, hãy đi đến trang sản phẩm hoặc trang cửa hàng của họ, cuộn xuống và tìm nút 'Liên hệ với người bán' hoặc 'Đặt câu hỏi cho người bán'. Bạn cũng có thể tìm thấy tùy chọn này trong mục 'Đơn hàng của tôi' nếu bạn đã mua hàng từ người bán đó.",
    category: "Mua hàng & Đặt hàng",
  },
  {
    id: 5,
    question: "Làm thế nào để thêm hoặc thay đổi phương thức thanh toán?",
    answer:
      "Để thêm hoặc thay đổi phương thức thanh toán, hãy đăng nhập vào tài khoản eBay của bạn, đi đến 'Tài khoản', sau đó chọn 'Phương thức thanh toán'. Từ đây, bạn có thể thêm thẻ tín dụng mới, tài khoản PayPal, hoặc phương thức thanh toán khác, cũng như chỉnh sửa hoặc xóa các phương thức hiện có.",
    category: "Thanh toán & Hóa đơn",
  },
  {
    id: 6,
    question: "Làm thế nào để bắt đầu bán hàng trên eBay?",
    answer:
      "Để bắt đầu bán hàng trên eBay, hãy đăng nhập vào tài khoản của bạn và nhấp vào 'Bán' ở góc trên cùng của trang. Làm theo hướng dẫn để tạo danh sách sản phẩm của bạn. Bạn sẽ cần cung cấp thông tin về sản phẩm, hình ảnh, giá cả, và tùy chọn vận chuyển. eBay cũng cung cấp các công cụ và tài nguyên để giúp bạn tối ưu hóa danh sách và tăng doanh số bán hàng.",
    category: "Bán hàng & Đăng tin",
  },
  {
    id: 7,
    question: "Làm thế nào để thay đổi địa chỉ giao hàng của tôi?",
    answer:
      "Để thay đổi địa chỉ giao hàng, hãy đăng nhập vào tài khoản eBay của bạn, đi đến 'Tài khoản', sau đó chọn 'Địa chỉ'. Từ đây, bạn có thể thêm địa chỉ mới, chỉnh sửa địa chỉ hiện có, hoặc đặt địa chỉ mặc định cho các giao dịch mua trong tương lai.",
    category: "Cài đặt tài khoản",
  },
  {
    id: 8,
    question: "Tôi không nhận được món hàng đã đặt. Tôi nên làm gì?",
    answer:
      "Nếu bạn không nhận được món hàng đã đặt, trước tiên hãy kiểm tra trạng thái theo dõi để xem liệu nó có đang trên đường đến hay không. Nếu đã quá ngày giao hàng dự kiến, hãy liên hệ với người bán để hỏi về tình trạng. Nếu bạn không thể giải quyết vấn đề với người bán, bạn có thể mở một yêu cầu 'Món hàng không nhận được' thông qua Trung tâm Giải quyết của eBay.",
    category: "Mua hàng & Đặt hàng",
  },
]

// Dữ liệu mẫu cho các bài viết trợ giúp
const HELP_ARTICLES = [
  {
    id: 1,
    title: "Hướng dẫn đầy đủ về việc trả lại hàng trên eBay",
    category: "Trả lại hàng & hoàn tiền",
    views: 45678,
    helpful: 92,
    date: "2023-05-15",
  },
  {
    id: 2,
    title: "Cách bảo vệ tài khoản eBay của bạn khỏi lừa đảo",
    category: "Tài khoản & Bảo mật",
    views: 34567,
    helpful: 95,
    date: "2023-06-22",
  },
  {
    id: 3,
    title: "Hướng dẫn từng bước để bán món đồ đầu tiên của bạn",
    category: "Bán hàng & Đăng tin",
    views: 56789,
    helpful: 88,
    date: "2023-04-10",
  },
  {
    id: 4,
    title: "Hiểu về các tùy chọn vận chuyển và giao hàng",
    category: "Mua hàng & Đặt hàng",
    views: 23456,
    helpful: 90,
    date: "2023-07-05",
  },
]

// Dữ liệu mẫu cho các phương thức liên hệ
const CONTACT_METHODS = [
  {
    id: 1,
    title: "Chat trực tuyến",
    icon: <FiMessageSquare className="h-6 w-6" />,
    description: "Trò chuyện với đại diện hỗ trợ",
    availability: "24/7",
    waitTime: "< 2 phút",
    action: "Bắt đầu chat",
  },
  {
    id: 2,
    title: "Gọi điện thoại",
    icon: <FiPhone className="h-6 w-6" />,
    description: "Nói chuyện với đại diện hỗ trợ",
    availability: "8:00 - 22:00",
    waitTime: "5-10 phút",
    action: "Xem số điện thoại",
  },
  {
    id: 3,
    title: "Email",
    icon: <FiMail className="h-6 w-6" />,
    description: "Gửi email cho đội hỗ trợ",
    availability: "Phản hồi trong 24 giờ",
    waitTime: "12-24 giờ",
    action: "Gửi email",
  },
]

// Component chính
const HelpContact = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [filteredFaqs, setFilteredFaqs] = useState(FAQS)
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi là trợ lý ảo của eBay. Tôi có thể giúp gì cho bạn hôm nay?" },
  ])
  const [messageInput, setMessageInput] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const chatContainerRef = useRef(null)
  const searchInputRef = useRef(null)

  // Xử lý tìm kiếm
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()

    // Tìm kiếm trong FAQs
    const faqResults = FAQS.filter(
      (faq) => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query),
    ).map((faq) => ({
      ...faq,
      type: "faq",
      title: faq.question,
    }))

    // Tìm kiếm trong bài viết trợ giúp
    const articleResults = HELP_ARTICLES.filter(
      (article) => article.title.toLowerCase().includes(query) || article.category.toLowerCase().includes(query),
    ).map((article) => ({
      ...article,
      type: "article",
    }))

    // Tìm kiếm trong chủ đề phổ biến
    const topicResults = POPULAR_TOPICS.filter(
      (topic) => topic.title.toLowerCase().includes(query) || topic.description.toLowerCase().includes(query),
    ).map((topic) => ({
      ...topic,
      type: "topic",
    }))

    // Kết hợp kết quả
    setSearchResults([...faqResults, ...articleResults, ...topicResults])
  }, [searchQuery])

  // Lọc FAQs theo danh mục
  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredFaqs(FAQS)
    } else {
      setFilteredFaqs(FAQS.filter((faq) => faq.category === activeCategory))
    }
  }, [activeCategory])

  // Cuộn xuống khi có tin nhắn mới trong chatbot
  useEffect(() => {
    if (chatContainerRef.current && showChatbot) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages, showChatbot])

  // Xử lý gửi tin nhắn trong chatbot
  const handleSendMessage = () => {
    if (messageInput.trim() === "") return

    // Thêm tin nhắn của người dùng
    setChatMessages([...chatMessages, { sender: "user", text: messageInput }])

    // Giả lập phản hồi từ bot
    setTimeout(() => {
      let botResponse = "Cảm ơn câu hỏi của bạn. Đội ngũ hỗ trợ của chúng tôi sẽ xem xét và phản hồi sớm nhất có thể."

      // Phản hồi đơn giản dựa trên từ khóa
      if (messageInput.toLowerCase().includes("trả lại") || messageInput.toLowerCase().includes("hoàn tiền")) {
        botResponse =
          "Để trả lại hàng, vui lòng đăng nhập vào tài khoản eBay của bạn, đi đến 'Đơn hàng của tôi', tìm đơn hàng bạn muốn trả lại, và nhấp vào 'Trả lại hàng'. Bạn có cần hỗ trợ thêm không?"
      } else if (
        messageInput.toLowerCase().includes("thanh toán") ||
        messageInput.toLowerCase().includes("thẻ tín dụng")
      ) {
        botResponse =
          "Bạn có thể quản lý các phương thức thanh toán trong phần 'Tài khoản' > 'Phương thức thanh toán'. Tại đây bạn có thể thêm, chỉnh sửa hoặc xóa thẻ tín dụng và các phương thức thanh toán khác."
      } else if (messageInput.toLowerCase().includes("mật khẩu")) {
        botResponse =
          "Nếu bạn cần đặt lại mật khẩu, vui lòng nhấp vào 'Quên mật khẩu' trên trang đăng nhập. Chúng tôi sẽ gửi hướng dẫn đến email của bạn để tạo mật khẩu mới."
      }

      setChatMessages((prev) => [...prev, { sender: "bot", text: botResponse }])
    }, 1000)

    // Xóa input
    setMessageInput("")
  }

  // Xử lý nhấn Enter trong input chat
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  // Xử lý nhấn vào FAQ
  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  // Xử lý gửi phản hồi
  const handleFeedback = (isHelpful) => {
    setFeedbackSubmitted(true)
    // Ở đây bạn có thể thêm logic để gửi phản hồi đến server
    setTimeout(() => {
      setFeedbackSubmitted(false)
    }, 5000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopMenu />
      <MainHeader />
      <SubMenu />

      {/* Chatbot */}
      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-4 z-50 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <div className="bg-[#0053A0] text-white p-4 flex justify-between items-center">
              <div className="flex items-center">
                <FiMessageSquare className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Trợ giúp trực tuyến</h3>
              </div>
              <button onClick={() => setShowChatbot(false)} className="text-white hover:text-gray-200">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div ref={chatContainerRef} className="h-80 overflow-y-auto p-4 bg-gray-50">
              {chatMessages.map((message, index) => (
                <div key={index} className={`mb-3 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-[#0053A0] text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-200 flex">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0053A0] focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#0053A0] hover:bg-[#00438A] text-white px-4 py-2 rounded-r-md"
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nút mở chatbot */}
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-6 right-6 z-40 bg-[#0053A0] hover:bg-[#00438A] text-white p-4 rounded-full shadow-lg flex items-center justify-center"
      >
        {showChatbot ? (
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <FiMessageSquare className="h-6 w-6" />
        )}
      </button>

      <main className="max-w-[1300px] mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#0053A0] to-[#00438A] rounded-lg p-6 mb-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Trung tâm trợ giúp eBay</h1>
            <p className="text-white/80 mb-6">
              Tìm câu trả lời cho câu hỏi của bạn hoặc liên hệ với chúng tôi để được hỗ trợ
            </p>

            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Tìm kiếm câu hỏi, chủ đề hoặc từ khóa..."
                className="w-full px-4 py-3 pl-12 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-500" />
              </div>

              {/* Kết quả tìm kiếm */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
                  <div className="p-2 text-left text-gray-500 text-sm border-b border-gray-200">
                    {searchResults.length} kết quả cho "{searchQuery}"
                  </div>
                  {searchResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer text-left"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          {result.type === "faq" && <FiHelpCircle className="h-5 w-5 text-[#0053A0]" />}
                          {result.type === "article" && <FiFileText className="h-5 w-5 text-[#00A86B]" />}
                          {result.type === "topic" && result.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{result.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {result.type === "faq" && result.answer.substring(0, 100) + "..."}
                            {result.type === "article" && `Bài viết trong ${result.category}`}
                            {result.type === "topic" && result.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chủ đề phổ biến */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Chủ đề phổ biến</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_TOPICS.map((topic) => (
              <motion.div
                key={topic.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full"
              >
                <div className="p-6">
                  <div className="flex items-start">
                    <div
                      className="flex-shrink-0 p-3 rounded-full mr-4"
                      style={{ backgroundColor: `${topic.color}10` }}
                    >
                      <div style={{ color: topic.color }}>{topic.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg">{topic.title}</h3>
                      <p className="text-gray-500 mt-1">{topic.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">{topic.articles} bài viết</div>
                </div>

                <div className="mt-auto p-4 border-t border-gray-100">
                  <button className="w-full flex items-center justify-center text-[#0053A0] hover:text-[#00438A] font-medium">
                    Xem tất cả bài viết
                    <FiArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Phương thức liên hệ */}
        <div className="mb-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Liên hệ với chúng tôi</h2>
          <p className="text-gray-500 mb-6 text-center max-w-3xl mx-auto">
            Nếu bạn không tìm thấy câu trả lời cho câu hỏi của mình, đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ
            bạn qua các kênh liên hệ sau
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CONTACT_METHODS.map((method) => (
              <motion.div key={method.id} whileHover={{ y: -5 }} className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-4">
                  {method.icon}
                </div>
                <h3 className="font-medium text-gray-900 text-lg mb-2">{method.title}</h3>
                <p className="text-gray-500 mb-4">{method.description}</p>

                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <FiClock className="mr-1 h-4 w-4" />
                    {method.availability}
                  </div>
                  <div className="flex items-center">
                    <FiCheckCircle className="mr-1 h-4 w-4 text-green-500" />
                    {method.waitTime}
                  </div>
                </div>

                <button className="w-full bg-[#0053A0] hover:bg-[#00438A] text-white py-2 rounded-md font-medium">
                  {method.action}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Câu hỏi thường gặp */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Câu hỏi thường gặp</h2>

            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeCategory === "all" ? "bg-[#0053A0] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tất cả
              </button>

              {POPULAR_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setActiveCategory(topic.title)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    activeCategory === topic.title
                      ? "bg-[#0053A0] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {topic.title}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy câu hỏi nào</h3>
                <p className="text-gray-500">Hãy thử chọn một danh mục khác hoặc tìm kiếm với từ khóa khác.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="border-b border-gray-200 last:border-b-0">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <FiChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          expandedFaq === faq.id ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedFaq === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-6 pb-4"
                        >
                          <div className="prose prose-sm max-w-none text-gray-500">
                            <p>{faq.answer}</p>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Danh mục: <span className="text-[#0053A0]">{faq.category}</span>
                            </div>

                            {feedbackSubmitted ? (
                              <div className="text-sm text-green-600 flex items-center">
                                <FiCheckCircle className="mr-1 h-4 w-4" />
                                Cảm ơn phản hồi của bạn!
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Câu trả lời có hữu ích không?</span>
                                <button
                                  onClick={() => handleFeedback(true)}
                                  className="p-1 text-gray-500 hover:text-green-600"
                                >
                                  <FiThumbsUp className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleFeedback(false)}
                                  className="p-1 text-gray-500 hover:text-red-600"
                                >
                                  <FiThumbsDown className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bài viết trợ giúp phổ biến */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết trợ giúp phổ biến</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HELP_ARTICLES.map((article) => (
              <motion.div key={article.id} whileHover={{ y: -5 }} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-blue-50 rounded-full mr-4">
                    <FiFileText className="h-5 w-5 text-[#0053A0]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{article.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="text-[#0053A0]">{article.category}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    <span>{article.views.toLocaleString()} lượt xem</span>
                    <span className="mx-2">•</span>
                    <span>{article.helpful}% hữu ích</span>
                  </div>

                  <button className="text-[#0053A0] hover:text-[#00438A] font-medium flex items-center">
                    Đọc thêm
                    <FiArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cộng đồng hỗ trợ */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-[#00A86B] to-[#00C853] rounded-lg p-6 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-6 md:mb-0 md:mr-6 flex-shrink-0 text-center">
                <FiUsers className="h-16 w-16 mx-auto mb-2" />
                <h3 className="text-xl font-bold">Cộng đồng eBay</h3>
              </div>

              <div className="flex-grow">
                <p className="mb-4">
                  Tham gia cộng đồng eBay để kết nối với những người mua và người bán khác, chia sẻ kinh nghiệm, và nhận
                  lời khuyên từ cộng đồng.
                </p>

                <div className="flex flex-wrap gap-4">
                  <button className="bg-white text-[#00A86B] hover:bg-gray-100 px-4 py-2 rounded-md font-medium flex items-center">
                    Tham gia diễn đàn
                    <FiExternalLink className="ml-2 h-4 w-4" />
                  </button>

                  <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md font-medium flex items-center">
                    Xem câu hỏi phổ biến
                    <FiArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phản hồi */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Trang trợ giúp này có hữu ích không?</h2>
            <p className="text-gray-500 mb-6 text-center max-w-2xl mx-auto">
              Phản hồi của bạn giúp chúng tôi cải thiện trải nghiệm hỗ trợ. Hãy cho chúng tôi biết bạn nghĩ gì!
            </p>

            <div className="flex justify-center space-x-4">
              <button className="bg-[#0053A0] hover:bg-[#00438A] text-white px-6 py-3 rounded-md font-medium flex items-center">
                <FiThumbsUp className="mr-2 h-5 w-5" />
                Có, rất hữu ích
              </button>

              <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-md font-medium flex items-center">
                <FiThumbsDown className="mr-2 h-5 w-5" />
                Không, tôi cần thêm trợ giúp
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default HelpContact

