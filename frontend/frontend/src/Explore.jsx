import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Explore.css";

const demoContent = [
  {
    id: 1,
    type: "image",
    src: "https://picsum.photos/id/1011/700/700",
    username: "travel_world",
  },
  {
    id: 2,
    type: "image",
    src: "https://picsum.photos/id/1015/700/700",
    username: "nature_daily",
  },
  {
    id: 3,
    type: "video",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    username: "reels_creator",
  },
  {
    id: 4,
    type: "image",
    src: "https://picsum.photos/id/1025/700/700",
    username: "pet_lovers",
  },
  {
    id: 5,
    type: "image",
    src: "https://picsum.photos/id/1035/700/700",
    username: "explore_daily",
  },
  {
    id: 6,
    type: "video",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    username: "video_zone",
  },
  {
    id: 7,
    type: "image",
    src: "https://picsum.photos/id/1043/700/700",
    username: "street_view",
  },
  {
    id: 8,
    type: "image",
    src: "https://picsum.photos/id/1050/700/700",
    username: "adventure",
  },
  {
    id: 9,
    type: "video",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    username: "reels_daily",
  },
  {
    id: 10,
    type: "image",
    src: "https://picsum.photos/id/1067/700/700",
    username: "creative_world",
  },
  {
    id: 11,
    type: "image",
    src: "https://picsum.photos/id/1074/700/700",
    username: "daily_life",
  },
  {
    id: 12,
    type: "video",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    username: "connectly_user",
  },
];

function Explore() {
  const [searchText, setSearchText] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("connectlyUser") || "null"
  );

  const allUsers = JSON.parse(
    localStorage.getItem("connectlyUsers") || "[]"
  );

  const filteredUsers = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) {
      return [];
    }

    return allUsers
      .filter((user) => {
        if (
          currentUser &&
          user.username === currentUser.username
        ) {
          return false;
        }

        return (
          String(user.username || "")
            .toLowerCase()
            .includes(search) ||
          String(user.name || "")
            .toLowerCase()
            .includes(search)
        );
      })
      .slice(0, 5);
  }, [searchText, allUsers, currentUser]);

  const filteredContent = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) {
      return demoContent;
    }

    return demoContent.filter((item) =>
      item.username.toLowerCase().includes(search)
    );
  }, [searchText]);

  return (
    <div className="explore-page">

      {/* HEADER */}
      <header className="explore-header">

        <Link to="/" className="explore-logo">
          <span>C✦</span>
          <strong>Connectly</strong>
        </Link>

        <div className="explore-search">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
          />

          {searchText && (
            <button
              type="button"
              onClick={() => setSearchText("")}
            >
              ×
            </button>
          )}
        </div>

        <Link to="/" className="explore-home">
          Home
        </Link>

      </header>

      {/* SEARCH RESULTS */}
      {searchText.trim() && (
        <section className="explore-search-results">

          {filteredUsers.length > 0 && (
            <div className="people-section">

              <h3>People</h3>

              {filteredUsers.map((user) => (
                <div
                  className="explore-user"
                  key={user.id || user.username}
                >
                  <div className="explore-user-avatar">
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : user.username
                          .charAt(0)
                          .toUpperCase()}
                  </div>

                  <div className="explore-user-info">
                    <strong>{user.username}</strong>
                    <span>{user.name}</span>
                  </div>
                </div>
              ))}

            </div>
          )}

          <div className="content-result-title">
            <h3>Posts & Reels</h3>
          </div>

        </section>
      )}

      {/* EXPLORE GRID */}
      <main className="explore-content">

        {filteredContent.length === 0 ? (
          <div className="explore-empty">
            <div>🔍</div>
            <h2>No results found</h2>
            <p>
              Try searching for another username or content.
            </p>
          </div>
        ) : (
          <div className="explore-grid">

            {filteredContent.map((item, index) => (
              <div
                className={`explore-item ${
                  index === 2 || index === 7
                    ? "explore-large"
                    : ""
                }`}
                key={item.id}
              >

                {item.type === "video" ? (
                  <video
                    src={item.src}
                    muted
                    loop
                    playsInline
                    onMouseEnter={(event) =>
                      event.currentTarget.play()
                    }
                    onMouseLeave={(event) => {
                      event.currentTarget.pause();
                      event.currentTarget.currentTime = 0;
                    }}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.username}
                  />
                )}

                <div className="explore-overlay">

                  <span>
                    ❤️  {Math.floor(Math.random() * 900 + 100)}
                  </span>

                  <span>
                    💬  {Math.floor(Math.random() * 100 + 5)}
                  </span>

                </div>

                {item.type === "video" && (
                  <div className="video-badge">
                    ▶
                  </div>
                )}

              </div>
            ))}

          </div>
        )}

      </main>

    </div>
  );
}

export default Explore;