import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Home.css";

/* =========================
   INDEXED DB - STORIES
========================= */

const DB_NAME = "ConnectlyStoriesDB";
const STORE_NAME = "stories";

const openStoryDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveStoryToDB = async (story) => {
  const db = await openStoryDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.put(story);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

const getStoriesFromDB = async () => {
  const db = await openStoryDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      db.close();
      resolve(request.result || []);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

const deleteStoryFromDB = async (storyId) => {
  const db = await openStoryDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.delete(storyId);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};


/* =========================
   INDEXED DB - REELS
========================= */

const REELS_DB_NAME = "ConnectlyReelsDB";
const REELS_STORE_NAME = "reels";

const openReelsDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(REELS_DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(REELS_STORE_NAME)) {
        db.createObjectStore(REELS_STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

const saveReelToDB = async (reel) => {
  const db = await openReelsDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      REELS_STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(
      REELS_STORE_NAME
    );

    store.put(reel);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};


/* =========================
   GET LOGGED-IN USER
========================= */

const getLoggedInUser = () => {
  try {
    const savedUser = localStorage.getItem(
      "connectlyUser"
    );

    if (!savedUser) {
      return {
        id: "guest",
        username: "User",
        name: "Connectly User",
        avatar: "U",
      };
    }

    const user = JSON.parse(savedUser);

    const username =
      user.username ||
      user.userName ||
      user.email?.split("@")[0] ||
      "User";

    const name =
      user.name ||
      user.fullName ||
      username;

    const id =
      user.id ||
      user._id ||
      user.userId ||
      username;

    return {
      id,
      username,
      name,
      avatar: name.charAt(0).toUpperCase(),
    };
  } catch (error) {
    console.error(
      "User loading failed:",
      error
    );

    return {
      id: "guest",
      username: "User",
      name: "Connectly User",
      avatar: "U",
    };
  }
};


/* =========================
   HOME
========================= */

function Home() {
  const navigate = useNavigate();

  /* =========================
     STORY REF
  ========================= */

  const storyInputRef = useRef(null);

  /* =========================
     CREATE POST REF
  ========================= */

  // IMPORTANT:
  // This input stays outside the modal.
  // So Create → Post can directly open Gallery.
  const postImageInputRef = useRef(null);

  const postMusicInputRef = useRef(null);

  /* =========================
     CREATE REEL REF
  ========================= */

  const reelInputRef = useRef(null);


  /* =========================
     LOGGED-IN USER
  ========================= */

  const [currentUser] = useState(() =>
    getLoggedInUser()
  );


  /* =========================
     POSTS
  ========================= */

  const [posts, setPosts] = useState([]);

  const [likedPosts, setLikedPosts] =
    useState({});

  const [savedPosts, setSavedPosts] =
    useState({});

  const [commentText, setCommentText] =
    useState({});


  /* =========================
     CREATE MENU
  ========================= */

  const [showCreateMenu, setShowCreateMenu] =
    useState(false);


  /* =========================
     CREATE POST
  ========================= */

  const [showCreatePost, setShowCreatePost] =
    useState(false);

  const [postImage, setPostImage] =
    useState(null);

  const [postImageUrl, setPostImageUrl] =
    useState("");

  const [postMusic, setPostMusic] =
    useState(null);

  const [postMusicUrl, setPostMusicUrl] =
    useState("");

  const [postCaption, setPostCaption] =
    useState("");


  /* =========================
     SEARCH
  ========================= */

  const [searchText, setSearchText] =
    useState("");

  const [showSearch, setShowSearch] =
    useState(false);


  /* =========================
     STORIES
  ========================= */

  const [myStories, setMyStories] =
    useState([]);

  const [storyLoading, setStoryLoading] =
    useState(true);

  const [selectedStory, setSelectedStory] =
    useState(null);


  /* =========================
     INITIAL POST
  ========================= */

  useEffect(() => {
    const userPost = {
      id: `post-${currentUser.id}`,
      username: currentUser.username,
      location: "Connectly",
      avatar: currentUser.avatar,
      likes: 0,
      comments: [],
      caption: "Welcome to Connectly 🚀",
    };

    setPosts([userPost]);
  }, [currentUser]);


  /* =========================
     LOAD STORIES
  ========================= */

  useEffect(() => {
    const loadStories = async () => {
      try {
        const savedStories =
          await getStoriesFromDB();

        const userStories =
          savedStories.filter(
            (story) =>
              String(story.userId) ===
              String(currentUser.id)
          );

        const storiesWithUrls =
          userStories.map((story) => ({
            ...story,

            videoUrl:
              story.type === "video" &&
              story.file
                ? URL.createObjectURL(
                    story.file
                  )
                : "",

            imageUrl:
              story.type === "image" &&
              story.file
                ? URL.createObjectURL(
                    story.file
                  )
                : "",
          }));

        setMyStories(
          storiesWithUrls
        );
      } catch (error) {
        console.error(
          "Story loading failed:",
          error
        );
      } finally {
        setStoryLoading(false);
      }
    };

    loadStories();
  }, [currentUser.id]);


  /* =========================
     CLEAN STORY URLS
  ========================= */

  useEffect(() => {
    return () => {
      myStories.forEach((story) => {
        if (story.imageUrl) {
          URL.revokeObjectURL(
            story.imageUrl
          );
        }

        if (story.videoUrl) {
          URL.revokeObjectURL(
            story.videoUrl
          );
        }
      });
    };
  }, [myStories]);


  /* =========================
     SEARCH USERS
  ========================= */

  const filteredUsers =
    searchText.trim() === ""
      ? []
      : currentUser.username
          .toLowerCase()
          .includes(
            searchText.toLowerCase()
          )
        ? [currentUser.username]
        : [];

  const handleSearchSelect = (
    username
  ) => {
    alert(
      `Opening ${username} profile 👤`
    );

    setSearchText("");
    setShowSearch(false);
  };


  /* =========================
     LIKE
  ========================= */

  const handleLike = (postId) => {
    const alreadyLiked =
      likedPosts[postId];

    setLikedPosts((previous) => ({
      ...previous,
      [postId]:
        !previous[postId],
    }));

    setPosts((previousPosts) =>
      previousPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          likes: alreadyLiked
            ? Math.max(
                0,
                post.likes - 1
              )
            : post.likes + 1,
        };
      })
    );
  };


  /* =========================
     SAVE
  ========================= */

  const handleSave = (postId) => {
    setSavedPosts((previous) => ({
      ...previous,
      [postId]:
        !previous[postId],
    }));
  };


  /* =========================
     COMMENT
  ========================= */

  const handleCommentChange = (
    postId,
    value
  ) => {
    setCommentText((previous) => ({
      ...previous,
      [postId]: value,
    }));
  };

  const handleCommentSubmit = (
    postId
  ) => {
    const text =
      commentText[postId]?.trim();

    if (!text) return;

    setPosts((previousPosts) =>
      previousPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,

          comments: [
            ...post.comments,
            {
              username:
                currentUser.username,
              text,
            },
          ],
        };
      })
    );

    setCommentText((previous) => ({
      ...previous,
      [postId]: "",
    }));
  };


  /* =========================
     SHARE
  ========================= */

  const handleShare = (
    username
  ) => {
    alert(
      `Post by ${username} selected for sharing 🚀`
    );
  };


  /* =========================
     STORY UPLOAD
  ========================= */

  const handleStoryUpload =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      const isImage =
        file.type.startsWith(
          "image/"
        );

      const isVideo =
        file.type.startsWith(
          "video/"
        );

      if (!isImage && !isVideo) {
        alert(
          "Please select an image or video."
        );

        event.target.value = "";
        return;
      }

      const story = {
        id: `story-${currentUser.id}-${Date.now()}`,

        userId:
          currentUser.id,

        username:
          currentUser.username,

        name: "Your story",

        letter:
          currentUser.avatar,

        type: isImage
          ? "image"
          : "video",

        file,

        createdAt:
          Date.now(),
      };

      try {
        await saveStoryToDB(story);

        const newStory = {
          ...story,

          imageUrl:
            isImage
              ? URL.createObjectURL(
                  file
                )
              : "",

          videoUrl:
            isVideo
              ? URL.createObjectURL(
                  file
                )
              : "",
        };

        setMyStories(
          (previous) => [
            newStory,
            ...previous,
          ]
        );

        alert(
          "Story uploaded successfully! 📸"
        );
      } catch (error) {
        console.error(
          "Story upload failed:",
          error
        );

        alert(
          "Story upload failed."
        );
      }

      event.target.value = "";
    };


  /* =========================
     STORY CLICK
  ========================= */

  const handleStoryClick = () => {
    if (myStories.length === 0) {
      storyInputRef.current?.click();
      return;
    }

    setSelectedStory(
      myStories[0]
    );
  };


  /* =========================
     DELETE STORY
  ========================= */

  const handleDeleteStory =
    async () => {
      if (!selectedStory?.id) {
        return;
      }

      const confirmDelete =
        window.confirm(
          "Delete this story?"
        );

      if (!confirmDelete) {
        return;
      }

      try {
        await deleteStoryFromDB(
          selectedStory.id
        );

        setMyStories((previous) =>
          previous.filter(
            (story) =>
              story.id !==
              selectedStory.id
          )
        );

        setSelectedStory(null);
      } catch (error) {
        console.error(
          "Story delete failed:",
          error
        );
      }
    };


  /* =========================
     CREATE MENU
     HOVER ONLY
  ========================= */

  const handleCreateMouseEnter =
    () => {
      setShowCreateMenu(true);
    };

  const handleCreateMouseLeave =
    () => {
      setShowCreateMenu(false);
    };


  /* =========================
     OPEN CREATE POST
     INSTAGRAM STYLE
  ========================= */

  const openCreatePost = () => {
    // Close Create menu
    setShowCreateMenu(false);

    // IMPORTANT:
    // Do NOT open Create Post modal here.
    // First open Gallery.
    setTimeout(() => {
      postImageInputRef.current?.click();
    }, 50);
  };


  /* =========================
     SELECT POST IMAGE
     PHOTO SELECTED → OPEN EDITOR
  ========================= */

  const handlePostImageSelect =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        alert(
          "Please select an image."
        );

        event.target.value = "";
        return;
      }

      if (postImageUrl) {
        URL.revokeObjectURL(
          postImageUrl
        );
      }

      const imageUrl =
        URL.createObjectURL(
          file
        );

      setPostImage(file);
      setPostImageUrl(
        imageUrl
      );

      // IMPORTANT:
      // Gallery selection complete.
      // Now open Create Post editor.
      setShowCreatePost(true);

      // Reset input so same image can be selected again.
      event.target.value = "";
    };


  /* =========================
     CLOSE CREATE POST
  ========================= */

  const closeCreatePost = () => {
    if (postImageUrl) {
      URL.revokeObjectURL(
        postImageUrl
      );
    }

    if (postMusicUrl) {
      URL.revokeObjectURL(
        postMusicUrl
      );
    }

    setShowCreatePost(false);

    setPostImage(null);
    setPostImageUrl("");

    setPostMusic(null);
    setPostMusicUrl("");

    setPostCaption("");
  };


  /* =========================
     SELECT MUSIC
  ========================= */

  const handlePostMusicSelect =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      if (
        !file.type.startsWith(
          "audio/"
        )
      ) {
        alert(
          "Please select an audio file."
        );

        event.target.value = "";
        return;
      }

      if (postMusicUrl) {
        URL.revokeObjectURL(
          postMusicUrl
        );
      }

      const musicUrl =
        URL.createObjectURL(
          file
        );

      setPostMusic(file);
      setPostMusicUrl(
        musicUrl
      );

      event.target.value = "";
    };


  /* =========================
     CREATE POST
  ========================= */

  const handleCreatePostSubmit =
    () => {
      if (!postImage) {
        alert(
          "Please choose a photo first."
        );

        return;
      }

      const newPost = {
        id: `post-${currentUser.id}-${Date.now()}`,

        username:
          currentUser.username,

        location:
          "Connectly",

        avatar:
          currentUser.avatar,

        likes: 0,

        comments: [],

        caption:
          postCaption.trim() ||
          "My new Connectly post ✨",

        imageUrl:
          postImageUrl,

        imageFile:
          postImage,

        musicUrl:
          postMusicUrl,

        musicFile:
          postMusic,

        musicName:
          postMusic?.name || "",

        createdAt:
          Date.now(),
      };

      setPosts((previous) => [
        newPost,
        ...previous,
      ]);

      setShowCreatePost(false);

      setPostImage(null);
      setPostMusic(null);
      setPostCaption("");

      alert(
        "Post created successfully! 🎉"
      );
    };


  /* =========================
     CREATE REEL
  ========================= */

  const handleCreateReel =
    () => {
      setShowCreateMenu(false);

      setTimeout(() => {
        reelInputRef.current?.click();
      }, 50);
    };


  /* =========================
     REEL UPLOAD
  ========================= */

  const handleReelUpload =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "video/"
        )
      ) {
        alert(
          "Please select a video file."
        );

        event.target.value = "";
        return;
      }

      const category =
        window.prompt(
          "Enter reel category:\n\nExample:\ncoding\ntravel\ngaming\neducation\nmusic\ncomedy"
        );

      if (
        !category ||
        !category.trim()
      ) {
        event.target.value = "";
        return;
      }

      try {
        const reel = {
          id: `reel-${currentUser.id}-${Date.now()}`,

          userId:
            currentUser.id,

          username:
            currentUser.username,

          name:
            currentUser.name,

          avatar:
            currentUser.avatar,

          category:
            category
              .trim()
              .toLowerCase(),

          file,

          createdAt:
            Date.now(),

          likes: 0,
        };

        await saveReelToDB(
          reel
        );

        event.target.value = "";

        alert(
          "Reel uploaded successfully! 🎬"
        );

        navigate("/reels");
      } catch (error) {
        console.error(
          "Reel upload failed:",
          error
        );

        alert(
          "Reel upload failed. Please try again."
        );

        event.target.value = "";
      }
    };


  /* =========================
     CREATE STORY
  ========================= */

  const handleCreateStory =
    () => {
      setShowCreateMenu(false);

      setTimeout(() => {
        storyInputRef.current?.click();
      }, 50);
    };


  /* =========================
     OTHER ACTIONS
  ========================= */

  const handleNotifications =
    () =>
      alert(
        "Notifications coming soon 🔔"
      );

  const handleMore = () =>
    alert(
      "More options"
    );

  const handleSwitch = () =>
    alert(
      "Account switching coming soon"
    );

  const handleSeeAll = () =>
    alert(
      "Showing all suggestions"
    );


  /* =========================
     USER DATA
  ========================= */

  const username =
    currentUser.username;

  const userName =
    currentUser.name;

  const avatar =
    currentUser.avatar;


  /* =========================
     RETURN
  ========================= */

  return (
    <div className="home-page">

      {/* ================= HEADER ================= */}

      <header className="connectly-header">

        <Link
          to="/"
          className="connectly-logo"
        >
          <span className="logo-symbol">
            C✦
          </span>

          <span className="logo-text">
            Connectly
          </span>
        </Link>


        <div className="header-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onFocus={() =>
              setShowSearch(true)
            }
            onChange={(event) => {
              setSearchText(
                event.target.value
              );

              setShowSearch(true);
            }}
            onKeyDown={(event) => {
              if (
                event.key ===
                  "Enter" &&
                filteredUsers.length >
                  0
              ) {
                handleSearchSelect(
                  filteredUsers[0]
                );
              }
            }}
          />


          {showSearch &&
            searchText.trim() !==
              "" && (
              <div className="search-results">

                {filteredUsers.length >
                0 ? (
                  filteredUsers.map(
                    (
                      searchUser
                    ) => (
                      <button
                        type="button"
                        key={
                          searchUser
                        }
                        onClick={() =>
                          handleSearchSelect(
                            searchUser
                          )
                        }
                      >

                        <div className="search-avatar">
                          {searchUser
                            .charAt(
                              0
                            )
                            .toUpperCase()}
                        </div>

                        <div className="search-user-info">

                          <strong>
                            {
                              searchUser
                            }
                          </strong>

                          <span>
                            Connectly user
                          </span>

                        </div>

                      </button>
                    )
                  )
                ) : (
                  <p className="no-search-result">
                    No users found
                  </p>
                )}

              </div>
            )}

        </div>


        <div className="header-actions">

          <button
            type="button"
            title="Notifications"
            onClick={
              handleNotifications
            }
          >
            ♡
          </button>

          <Link
            to="/messages"
            className="message-header-button"
            title="Messages"
          >
            ✉
          </Link>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="home-layout">


        {/* ================= LEFT SIDEBAR ================= */}

        <aside className="left-sidebar">

          <Link
            to="/"
            className="side-item active"
          >
            <span>⌂</span>

            <strong>
              Home
            </strong>
          </Link>


          <button
            type="button"
            className="side-item"
            onClick={() =>
              document
                .querySelector(
                  ".header-search input"
                )
                ?.focus()
            }
          >
            <span>⌕</span>

            <span>
              Search
            </span>
          </button>


          <Link
            to="/explore"
            className="side-item"
          >
            <span>◈</span>

            <span>
              Explore
            </span>
          </Link>


          <Link
            to="/reels"
            className="side-item"
          >
            <span>▶</span>

            <span>
              Reels
            </span>
          </Link>


          <Link
            to="/messages"
            className="side-item"
          >
            <span>✉</span>

            <span>
              Messages
            </span>
          </Link>


          <button
            type="button"
            className="side-item"
            onClick={
              handleNotifications
            }
          >
            <span>♡</span>

            <span>
              Notifications
            </span>
          </button>


          {/* ================= CREATE HOVER ================= */}

          <div
            className="create-menu-wrapper"
            onMouseEnter={
              handleCreateMouseEnter
            }
            onMouseLeave={
              handleCreateMouseLeave
            }
          >

            <button
              type="button"
              className="side-item create-button"
            >
              <span>＋</span>

              <span>
                Create
              </span>
            </button>


            {showCreateMenu && (
              <div
                className="create-hover-menu"
                onMouseEnter={() =>
                  setShowCreateMenu(
                    true
                  )
                }
                onMouseLeave={() =>
                  setShowCreateMenu(
                    false
                  )
                }
              >

                {/* POST */}

                <button
                  type="button"
                  className="create-hover-option"
                  onClick={
                    openCreatePost
                  }
                >

                  <span className="create-option-icon">
                    📷
                  </span>

                  <span className="create-option-text">

                    <strong>
                      Post
                    </strong>

                    <small>
                      Share a photo
                    </small>

                  </span>

                </button>


                {/* REELS */}

                <button
                  type="button"
                  className="create-hover-option"
                  onClick={
                    handleCreateReel
                  }
                >

                  <span className="create-option-icon">
                    🎬
                  </span>

                  <span className="create-option-text">

                    <strong>
                      Reels
                    </strong>

                    <small>
                      Share a video
                    </small>

                  </span>

                </button>


                {/* STORY */}

                <button
                  type="button"
                  className="create-hover-option"
                  onClick={
                    handleCreateStory
                  }
                >

                  <span className="create-option-icon">
                    📖
                  </span>

                  <span className="create-option-text">

                    <strong>
                      Story
                    </strong>

                    <small>
                      Share a story
                    </small>

                  </span>

                </button>

              </div>
            )}

          </div>


          <Link
            to="/profile"
            className="side-item"
          >

            <div className="small-avatar">
              {avatar}
            </div>

            <span>
              Profile
            </span>

          </Link>


          <div className="sidebar-bottom">

            <button
              type="button"
              className="side-item"
              onClick={
                handleMore
              }
            >

              <span>☰</span>

              <span>
                More
              </span>

            </button>

          </div>

        </aside>


        {/* ================= CENTER ================= */}

        <section className="center-content">


          {/* ================= STORIES ================= */}

          <section className="stories">

            {/* STORY INPUT */}

            <input
              ref={storyInputRef}
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={
                handleStoryUpload
              }
            />


            {/* REEL INPUT */}

            <input
              ref={reelInputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={
                handleReelUpload
              }
            />


            {/* =================================================
                POST GALLERY INPUT

                IMPORTANT:
                This input is ALWAYS mounted.

                So Create → Post can open Gallery
                even when Create Post modal is closed.
            ================================================= */}

            <input
              ref={postImageInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={
                handlePostImageSelect
              }
            />


            <div
              className="story your-story-item"
              onClick={
                handleStoryClick
              }
            >

              <div
                className={`story-ring my-story ${
                  myStories.length >
                  0
                    ? "story-has-content"
                    : ""
                }`}
              >

                {myStories.length >
                0 ? (
                  myStories[0]
                    .imageUrl ? (
                    <img
                      src={
                        myStories[0]
                          .imageUrl
                      }
                      alt="Your story"
                      className="story-media-avatar"
                    />
                  ) : (
                    <div className="story-avatar">
                      {avatar}
                    </div>
                  )
                ) : (
                  <div className="story-avatar">
                    {avatar}
                  </div>
                )}


                {myStories.length ===
                  0 && (
                  <span className="story-add-button">
                    +
                  </span>
                )}

              </div>


              <span>
                Your story
              </span>

            </div>

          </section>


          {/* ================= FEED ================= */}

          <section className="feed">

            {posts.map(
              (post) => {

                const isLiked =
                  likedPosts[
                    post.id
                  ];

                const isSaved =
                  savedPosts[
                    post.id
                  ];


                return (
                  <article
                    className="post"
                    key={post.id}
                  >

                    {/* POST HEADER */}

                    <div className="post-header">

                      <div className="post-avatar">
                        {
                          post.avatar
                        }
                      </div>

                      <div className="post-user">

                        <strong>
                          {
                            post.username
                          }
                        </strong>

                        <span>
                          {
                            post.location
                          }
                        </span>

                      </div>

                      <button
                        className="more-button"
                        type="button"
                        onClick={() =>
                          alert(
                            "More post options"
                          )
                        }
                      >
                        •••
                      </button>

                    </div>


                    {/* POST IMAGE */}

                    <div className="post-image">

                      {post.imageUrl ? (
                        <img
                          src={
                            post.imageUrl
                          }
                          alt="Post"
                          className="created-post-image"
                        />
                      ) : (
                        <div className="post-image-content">

                          <span>
                            CONNECTLY
                          </span>

                          <h1>
                            Dream.
                            <br />
                            Believe.
                            <br />
                            Achieve.
                          </h1>

                        </div>
                      )}

                    </div>


                    {/* POST MUSIC */}

                    {post.musicUrl && (
                      <div className="post-music-player">

                        <div className="post-music-icon">
                          🎵
                        </div>

                        <div className="post-music-info">

                          <strong>
                            {
                              post.musicName
                            }
                          </strong>

                          <span>
                            Connectly Music
                          </span>

                        </div>

                        <audio
                          src={
                            post.musicUrl
                          }
                          controls
                          preload="metadata"
                        />

                      </div>
                    )}


                    {/* POST ACTIONS */}

                    <div className="post-actions">

                      <div className="action-left">

                        <button
                          type="button"
                          title="Like"
                          className={
                            isLiked
                              ? "liked"
                              : ""
                          }
                          onClick={() =>
                            handleLike(
                              post.id
                            )
                          }
                        >
                          {isLiked
                            ? "♥"
                            : "♡"}
                        </button>


                        <button
                          type="button"
                          title="Comment"
                          onClick={() =>
                            document
                              .getElementById(
                                `comment-${post.id}`
                              )
                              ?.focus()
                          }
                        >
                          ○
                        </button>


                        <button
                          type="button"
                          title="Share"
                          onClick={() =>
                            handleShare(
                              post.username
                            )
                          }
                        >
                          ➤
                        </button>

                      </div>


                      <button
                        type="button"
                        title="Save"
                        className={
                          isSaved
                            ? "saved"
                            : ""
                            
                        }
                        onClick={() =>
                          handleSave(
                            post.id
                          )
                        }
                      >
                        {isSaved
                          ? "🔖"
                          : "♡"}
                      </button>

                    </div>


                    {/* POST CONTENT */}

                    <div className="post-content">

                      <strong className="likes">
                        {post.likes.toLocaleString()}{" "}
                        likes
                      </strong>


                      <p>

                        <strong>
                          {
                            post.username
                          }
                        </strong>{" "}

                        {
                          post.caption
                        }

                      </p>


                      {post.comments.length >
                        0 && (
                        <div className="comment-list">

                          {post.comments.map(
                            (
                              comment,
                              index
                            ) => (
                              <p
                                key={
                                  index
                                }
                                className="comment"
                              >

                                <strong>
                                  {
                                    comment.username
                                  }
                                </strong>{" "}

                                {
                                  comment.text
                                }

                              </p>
                            )
                          )}

                        </div>
                      )}


                      <button
                        className="comments"
                        type="button"
                        onClick={() =>
                          document
                            .getElementById(
                              `comment-${post.id}`
                            )
                            ?.focus()
                        }
                      >
                        View all{" "}
                        {
                          post.comments
                            .length +
                          86
                        }{" "}
                        comments
                      </button>


                      <div className="comment-input">

                        <input
                          id={`comment-${post.id}`}
                          type="text"
                          value={
                            commentText[
                              post.id
                            ] || ""
                          }
                          onChange={(
                            event
                          ) =>
                            handleCommentChange(
                              post.id,
                              event
                                .target
                                .value
                            )
                          }
                          onKeyDown={(
                            event
                          ) => {
                            if (
                              event.key ===
                              "Enter"
                            ) {
                              handleCommentSubmit(
                                post.id
                              );
                            }
                          }}
                          placeholder="Add a comment..."
                        />


                        <button
                          type="button"
                          onClick={() =>
                            handleCommentSubmit(
                              post.id
                            )
                          }
                        >
                          Post
                        </button>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </section>

        </section>


        {/* ================= RIGHT SIDEBAR ================= */}

        <aside className="right-sidebar">

          <div className="my-profile">

            <div className="profile-avatar">
              {avatar}
            </div>


            <div className="my-profile-info">

              <strong>
                {username}
              </strong>

              <span>
                {userName}
              </span>

            </div>


            <button
              type="button"
              onClick={
                handleSwitch
              }
            >
              Switch
            </button>

          </div>


          <div className="suggestion-heading">

            <strong>
              Suggested for you
            </strong>

            <button
              type="button"
              onClick={
                handleSeeAll
              }
            >
              See All
            </button>

          </div>


          <div className="footer">

            About · Help · Privacy · Terms

            <br />

            © 2026 Connectly

          </div>

        </aside>

      </main>


      {/* =================================================
          CREATE POST MODAL

          IMPORTANT:
          This opens ONLY after a photo is selected.
      ================================================= */}

      {showCreatePost && (
        <div
          className="create-post-overlay"
          onClick={
            closeCreatePost
          }
        >

          <div
            className="create-post-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="create-post-header">

              <button
                type="button"
                onClick={
                  closeCreatePost
                }
              >
                ✕
              </button>


              <h2>
                Create Post
              </h2>


              <button
                type="button"
                className="create-share-button"
                onClick={
                  handleCreatePostSubmit
                }
              >
                Share
              </button>

            </div>


            {/* BODY */}

            <div className="create-post-body">


              {/* PHOTO */}

              <div className="post-photo-section">

                {postImageUrl ? (
                  <div className="selected-photo">

                    <img
                      src={
                        postImageUrl
                      }
                      alt="Selected"
                    />


                    <button
                      type="button"
                      onClick={() => {
                        if (
                          postImageUrl
                        ) {
                          URL.revokeObjectURL(
                            postImageUrl
                          );
                        }

                        setPostImage(
                          null
                        );

                        setPostImageUrl(
                          ""
                        );

                        // If user removes selected photo,
                        // allow selecting another photo.
                        setTimeout(() => {
                          postImageInputRef.current?.click();
                        }, 50);
                      }}
                    >
                      ✕
                    </button>

                  </div>
                ) : (
                  <button
                    type="button"
                    className="choose-photo-button"
                    onClick={() =>
                      postImageInputRef.current?.click()
                    }
                  >

                    <span>
                      📷
                    </span>

                    <strong>
                      Choose Photo
                    </strong>

                    <small>
                      Select an image from your device
                    </small>

                  </button>
                )}

              </div>


              {/* DETAILS */}

              <div className="post-details">

                <div className="create-user-row">

                  <div className="create-user-avatar">
                    {avatar}
                  </div>

                  <strong>
                    {username}
                  </strong>

                </div>


                {/* CAPTION */}

                <textarea
                  value={
                    postCaption
                  }
                  onChange={(event) =>
                    setPostCaption(
                      event.target.value
                    )
                  }
                  placeholder="Write a caption..."
                  maxLength={500}
                />


                {/* MUSIC */}

                <div className="add-music-box">

                  <div className="music-title">

                    <span>
                      🎵
                    </span>

                    <div>

                      <strong>
                        Add Music
                      </strong>

                      <small>
                        Add audio to your photo
                      </small>

                    </div>

                  </div>


                  {postMusic ? (
                    <div className="selected-music">

                      <div>

                        <span>
                          🎵
                        </span>

                        <strong>
                          {
                            postMusic.name
                          }
                        </strong>

                      </div>


                      <button
                        type="button"
                        onClick={() => {
                          if (
                            postMusicUrl
                          ) {
                            URL.revokeObjectURL(
                              postMusicUrl
                            );
                          }

                          setPostMusic(
                            null
                          );

                          setPostMusicUrl(
                            ""
                          );
                        }}
                      >
                        ✕
                      </button>

                    </div>
                  ) : (
                    <button
                      type="button"
                      className="add-music-button"
                      onClick={() =>
                        postMusicInputRef.current?.click()
                      }
                    >
                      + Add Music
                    </button>
                  )}


                  <input
                    ref={
                      postMusicInputRef
                    }
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={
                      handlePostMusicSelect
                    }
                  />

                </div>

              </div>

            </div>

          </div>

        </div>
      )}


      {/* =========================
          STORY VIEWER
      ========================= */}

      {selectedStory && (
        <div
          className="story-viewer-overlay"
          onClick={() =>
            setSelectedStory(
              null
            )
          }
        >

          <div
            className="story-viewer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="story-close-button"
              type="button"
              onClick={() =>
                setSelectedStory(
                  null
                )
              }
            >
              ✕
            </button>


            <div className="story-viewer-header">

              <div className="story-viewer-avatar">

                {
                  selectedStory.letter ||
                  avatar
                }

              </div>

              <strong>
                {
                  selectedStory.name
                }
              </strong>

            </div>


            {selectedStory.imageUrl && (
              <img
                src={
                  selectedStory.imageUrl
                }
                alt="Story"
                className="story-viewer-media"
              />
            )}


            {selectedStory.videoUrl && (
              <video
                src={
                  selectedStory.videoUrl
                }
                className="story-viewer-media"
                autoPlay
                controls
                playsInline
              />
            )}


            <button
              type="button"
              className="story-delete-button"
              onClick={
                handleDeleteStory
              }
            >
              🗑 Delete Story
            </button>

          </div>

        </div>
      )}


      {/* =========================
          STORY LOADING
      ========================= */}

      {storyLoading && (
        <div className="story-loading-indicator">
          Loading stories...
        </div>
      )}

    </div>
  );
}


/* =========================
   SUGGESTION
========================= */

function Suggestion({
  user,
}) {
  const [following, setFollowing] =
    useState(false);

  return (
    <div className="suggestion">

      <div className="suggestion-avatar">
        {user.avatar}
      </div>

      <div className="suggestion-info">

        <strong>
          {user.username}
        </strong>

        <span>
          {user.name}
        </span>

      </div>

      <button
        type="button"
        className="follow-button"
        onClick={() =>
          setFollowing(
            !following
          )
        }
      >
        {following
          ? "Following"
          : "Follow"}
      </button>

    </div>
  );
}


export default Home;