import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Messages.css";

function Messages() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");

  const messagesEndRef = useRef(null);

  // Load logged-in user and all registered users
  useEffect(() => {
    try {
      const loggedUser = JSON.parse(
        localStorage.getItem("connectlyUser")
      );

      const savedUsers = JSON.parse(
        localStorage.getItem("connectlyUsers") || "[]"
      );

      const savedMessages = JSON.parse(
        localStorage.getItem("connectlyMessages") || "{}"
      );

      if (!loggedUser) return;

      setCurrentUser(loggedUser);

      // Don't show current logged-in user in message list
      const otherUsers = savedUsers.filter(
        (user) => user.username !== loggedUser.username
      );

      setUsers(otherUsers);
      setMessages(savedMessages);
    } catch (error) {
      console.error("Messages loading failed:", error);
    }
  }, []);

  // Save messages whenever messages change
  useEffect(() => {
    localStorage.setItem(
      "connectlyMessages",
      JSON.stringify(messages)
    );
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [selectedUser, messages]);

  // Create unique chat ID
  const getChatId = (user1, user2) => {
    return [user1, user2]
      .sort()
      .join("__");
  };

  // Select user
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchText("");
  };

  // Send message
  const handleSendMessage = () => {
    const text = messageText.trim();

    if (!text || !selectedUser || !currentUser) {
      return;
    }

    const chatId = getChatId(
      currentUser.username,
      selectedUser.username
    );

    const newMessage = {
      id: Date.now(),
      sender: currentUser.username,
      receiver: selectedUser.username,
      text: text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((previous) => ({
      ...previous,

      [chatId]: [
        ...(previous[chatId] || []),
        newMessage,
      ],
    }));

    setMessageText("");
  };

  // Delete complete chat
  const handleDeleteChat = () => {
    if (!selectedUser || !currentUser) return;

    const chatId = getChatId(
      currentUser.username,
      selectedUser.username
    );

    setMessages((previous) => {
      const updated = { ...previous };

      delete updated[chatId];

      return updated;
    });

    setSelectedUser(null);
  };

  // Search users
  const filteredUsers = users.filter((user) => {
    const search = searchText.toLowerCase();

    return (
      user.username.toLowerCase().includes(search) ||
      String(user.name || "")
        .toLowerCase()
        .includes(search)
    );
  });

  // Get current chat messages
  const currentMessages =
    selectedUser && currentUser
      ? messages[
          getChatId(
            currentUser.username,
            selectedUser.username
          )
        ] || []
      : [];

  return (
    <div className="messages-page">

      {/* HEADER */}
      <header className="messages-header">
        <Link to="/" className="messages-logo">
          <span>C✦</span>
          <strong>Connectly</strong>
        </Link>

        <h2>Messages</h2>

        <Link to="/" className="back-home">
          Home
        </Link>
      </header>

      <main className="messages-container">

        {/* LEFT SIDE */}
        <aside className="chat-list">

          <div className="chat-list-top">
            <h2>Messages</h2>
          </div>

          {/* SEARCH */}
          <div className="chat-search">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search people..."
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
            />
          </div>

          {/* USER LIST */}
          <div className="chat-users">

            {filteredUsers.length === 0 ? (
              <div className="no-users">
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const chatId = getChatId(
                  currentUser?.username,
                  user.username
                );

                const userMessages =
                  messages[chatId] || [];

                const lastMessage =
                  userMessages[userMessages.length - 1];

                return (
                  <button
                    type="button"
                    key={user.id || user.username}
                    className={`chat-user ${
                      selectedUser?.username ===
                      user.username
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelectUser(user)
                    }
                  >

                    <div className="chat-avatar-wrapper">
                      <div className="chat-avatar">
                        {user.name
                          ? user.name.charAt(0).toUpperCase()
                          : user.username
                              .charAt(0)
                              .toUpperCase()}
                      </div>

                      <span className="online-dot"></span>
                    </div>

                    <div className="chat-user-info">
                      <strong>
                        {user.username}
                      </strong>

                      <span>
                        {lastMessage
                          ? lastMessage.text
                          : user.name}
                      </span>
                    </div>

                    {lastMessage && (
                      <div className="chat-time">
                        {lastMessage.time}
                      </div>
                    )}
                  </button>
                );
              })
            )}

          </div>
        </aside>

        {/* RIGHT SIDE */}
        <section className="chat-window">

          {!selectedUser ? (

            /* NO CHAT SELECTED */
            <div className="no-chat-selected">

              <div className="no-chat-icon">
                💬
              </div>

              <h2>Your Messages</h2>

              <p>
                Search for someone and start a
                conversation.
              </p>

            </div>

          ) : (

            <>
              {/* CHAT HEADER */}
              <div className="chat-header">

                <div className="chat-avatar-wrapper">
                  <div className="chat-avatar">
                    {selectedUser.name
                      ? selectedUser.name
                          .charAt(0)
                          .toUpperCase()
                      : selectedUser.username
                          .charAt(0)
                          .toUpperCase()}
                  </div>

                  <span className="online-dot"></span>
                </div>

                <div className="chat-header-info">
                  <strong>
                    {selectedUser.username}
                  </strong>

                  <span>
                    Active now
                  </span>
                </div>

                {/* DELETE CHAT */}
                <button
                  type="button"
                  className="delete-chat-button"
                  title="Delete chat"
                  onClick={handleDeleteChat}
                >
                  🗑️
                </button>

              </div>

              {/* MESSAGES */}
              <div className="chat-messages">

                {currentMessages.length === 0 ? (

                  <div className="new-chat-intro">

                    <div className="large-chat-avatar">
                      {selectedUser.name
                        ? selectedUser.name
                            .charAt(0)
                            .toUpperCase()
                        : selectedUser.username
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <strong>
                      {selectedUser.username}
                    </strong>

                    <span>
                      {selectedUser.name}
                    </span>

                    <small>
                      Start a conversation with{" "}
                      {selectedUser.username}
                    </small>

                  </div>

                ) : (

                  currentMessages.map((message) => (

                    <div
                      key={message.id}
                      className={`message-row ${
                        message.sender ===
                        currentUser.username
                          ? "message-row-me"
                          : "message-row-them"
                      }`}
                    >

                      <div
                        className={`message ${
                          message.sender ===
                          currentUser.username
                            ? "my-message"
                            : "their-message"
                        }`}
                      >
                        {message.text}

                        <small>
                          {message.time}
                        </small>
                      </div>

                    </div>

                  ))

                )}

                <div ref={messagesEndRef}></div>

              </div>

              {/* INPUT */}
              <div className="message-input">

                <button
                  type="button"
                  className="emoji-button"
                  onClick={() =>
                    setMessageText(
                      (previous) =>
                        previous + " 😊"
                    )
                  }
                >
                  😊
                </button>

                <input
                  type="text"
                  placeholder={`Message ${selectedUser.username}...`}
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                <button
                  type="button"
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  ➤
                </button>

              </div>
            </>
          )}

        </section>
      </main>
    </div>
  );
}

export default Messages;