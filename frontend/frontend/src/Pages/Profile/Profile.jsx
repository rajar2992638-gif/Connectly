import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const profileInputRef = useRef(null);

  const getCurrentUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("connectlyUser") || "null"
      );
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(getCurrentUser());

  const [activeTab, setActiveTab] = useState("posts");

  const [showEdit, setShowEdit] = useState(false);

  const [editData, setEditData] = useState({
    username: "",
    name: "",
    bio: "",
    profileImage: "",
  });

  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);

  /* =================================
     LOAD USER
  ================================= */

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);

    setEditData({
      username: currentUser.username || "",
      name: currentUser.name || "",
      bio:
        currentUser.bio ||
        "Full Stack Developer 🚀",
      profileImage:
        currentUser.profileImage || "",
    });

    loadUserContent(currentUser);
  }, [navigate]);


  /* =================================
     LOAD POSTS + REELS
  ================================= */

  const loadUserContent = (currentUser) => {
    try {
      const allPosts = JSON.parse(
        localStorage.getItem("connectlyPosts") || "[]"
      );

      const allReels = JSON.parse(
        localStorage.getItem("connectlyReels") || "[]"
      );

      const userPosts = allPosts.filter(
        (post) =>
          post.username === currentUser.username ||
          post.userId === currentUser.id
      );

      const userReels = allReels.filter(
        (reel) =>
          reel.username === currentUser.username ||
          reel.userId === currentUser.id
      );

      setPosts(userPosts);
      setReels(userReels);
    } catch (error) {
      console.log(error);
    }
  };


  /* =================================
     OPEN EDIT
  ================================= */

  const openEditProfile = () => {
    setEditData({
      username: user?.username || "",
      name: user?.name || "",
      bio:
        user?.bio ||
        "Full Stack Developer 🚀",
      profileImage:
        user?.profileImage || "",
    });

    setShowEdit(true);
  };


  /* =================================
     CHANGE DP
  ================================= */

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Profile photo must be below 5MB");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setEditData((prev) => ({
        ...prev,
        profileImage: reader.result,
      }));
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };


  /* =================================
     SAVE PROFILE
  ================================= */

  const saveProfile = () => {
    if (!editData.username.trim()) {
      alert("Username is required");
      return;
    }

    const oldUser = getCurrentUser();

    if (!oldUser) {
      navigate("/login");
      return;
    }

    const updatedUser = {
      ...oldUser,

      username: editData.username.trim(),

      name:
        editData.name.trim() ||
        editData.username.trim(),

      bio:
        editData.bio.trim() ||
        "Full Stack Developer 🚀",

      profileImage:
        editData.profileImage || "",
    };


    /* Save current user */

    localStorage.setItem(
      "connectlyUser",
      JSON.stringify(updatedUser)
    );


    /* Update registered users */

    try {
      const users = JSON.parse(
        localStorage.getItem("connectlyUsers") || "[]"
      );

      const updatedUsers = users.map(
        (existingUser) => {
          const sameUser =
            existingUser.id &&
            oldUser.id
              ? existingUser.id === oldUser.id
              : existingUser.username ===
                oldUser.username;

          if (sameUser) {
            return {
              ...existingUser,
              ...updatedUser,
            };
          }

          return existingUser;
        }
      );

      localStorage.setItem(
        "connectlyUsers",
        JSON.stringify(updatedUsers)
      );
    } catch (error) {
      console.log(error);
    }


    setUser(updatedUser);

    setShowEdit(false);

    alert("Profile updated successfully!");
  };


  /* =================================
     REMOVE DP
  ================================= */

  const removeProfilePhoto = () => {
    setEditData((prev) => ({
      ...prev,
      profileImage: "",
    }));
  };


  if (!user) {
    return null;
  }


  return (
    <div className="profile-page">

      {/* =================================
          HEADER
      ================================= */}

      <header className="profile-header">

        <button
          className="profile-back"
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        <h2>
          {user.username}
        </h2>

        <button
          className="profile-menu"
          onClick={() =>
            alert("Settings coming soon")
          }
        >
          ⋯
        </button>

      </header>


      {/* =================================
          PROFILE
      ================================= */}

      <section className="profile-info">

        <div className="profile-top">

          {/* DP */}

          <div className="profile-avatar-wrapper">

            <img
              src={
                user.profileImage ||
                "https://i.pravatar.cc/300?img=12"
              }
              alt={user.username}
              className="profile-avatar"
            />

          </div>


          {/* DETAILS */}

          <div className="profile-details">

            <div className="profile-actions">

              <h1>
                {user.username}
              </h1>

              <button
                className="edit-profile-btn"
                onClick={openEditProfile}
              >
                Edit Profile
              </button>

            </div>


            {/* STATS */}

            <div className="profile-stats">

              <div className="stat-item">
                <strong>
                  {posts.length}
                </strong>
                <span>Posts</span>
              </div>

              <div className="stat-item">
                <strong>
                  {user.followersCount || 0}
                </strong>
                <span>Followers</span>
              </div>

              <div className="stat-item">
                <strong>
                  {user.followingCount || 0}
                </strong>
                <span>Following</span>
              </div>

            </div>


            {/* BIO */}

            <div className="profile-bio">

              <strong>
                {user.name || user.username}
              </strong>

              <p>
                {user.bio ||
                  "Full Stack Developer 🚀"}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =================================
          TABS
      ================================= */}

      <div className="profile-tabs">

        <button
          className={
            activeTab === "posts"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("posts")
          }
        >
          <span className="tab-icon">
            ▦
          </span>

          <span>
            Posts
          </span>
        </button>


        <button
          className={
            activeTab === "reels"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("reels")
          }
        >
          <span className="tab-icon">
            ▶
          </span>

          <span>
            Reels
          </span>
        </button>

      </div>


      {/* =================================
          POSTS
      ================================= */}

      {activeTab === "posts" && (

        <div className="profile-grid">

          {posts.length === 0 ? (

            <div className="profile-empty">

              <div className="empty-icon">
                📷
              </div>

              <h3>
                No Posts Yet
              </h3>

              <p>
                Posts you create will
                appear here.
              </p>

            </div>

          ) : (

            posts.map((post) => (

              <div
                className="profile-grid-item"
                key={
                  post.id ||
                  post._id
                }
              >

                <img
                  src={
                    post.imageUrl ||
                    post.image
                  }
                  alt="Post"
                />

              </div>

            ))

          )}

        </div>

      )}


      {/* =================================
          REELS
      ================================= */}

      {activeTab === "reels" && (

        <div className="profile-grid">

          {reels.length === 0 ? (

            <div className="profile-empty">

              <div className="empty-icon">
                ▶
              </div>

              <h3>
                No Reels Yet
              </h3>

              <p>
                Reels you create will
                appear here.
              </p>

            </div>

          ) : (

            reels.map((reel) => (

              <div
                className="profile-grid-item reel-item"
                key={
                  reel.id ||
                  reel._id
                }
              >

                <video
                  src={
                    reel.videoUrl ||
                    reel.video
                  }
                  muted
                  loop
                  playsInline
                  controls
                />

              </div>

            ))

          )}

        </div>

      )}


      {/* =================================
          EDIT PROFILE MODAL
      ================================= */}

      {showEdit && (

        <div
          className="profile-modal-bg"
          onClick={() =>
            setShowEdit(false)
          }
        >

          <div
            className="profile-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="modal-header">

              <h2>
                Edit Profile
              </h2>

              <button
                onClick={() =>
                  setShowEdit(false)
                }
              >
                ×
              </button>

            </div>


            {/* =================================
                DP CHANGE SECTION
            ================================= */}

            <div className="dp-edit-section">

              <div
                className="dp-preview-wrapper"
                onClick={() =>
                  profileInputRef.current?.click()
                }
              >

                <img
                  src={
                    editData.profileImage ||
                    "https://i.pravatar.cc/300?img=12"
                  }
                  alt="Profile Preview"
                  className="dp-preview"
                />

                <div className="dp-camera">
                  📷
                </div>

              </div>


              <button
                className="change-photo-btn"
                onClick={() =>
                  profileInputRef.current?.click()
                }
              >
                Change profile photo
              </button>


              {editData.profileImage && (

                <button
                  className="remove-photo-btn"
                  onClick={removeProfilePhoto}
                >
                  Remove current photo
                </button>

              )}

            </div>


            {/* HIDDEN FILE INPUT */}

            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              onChange={
                handleProfileImageChange
              }
              style={{
                display: "none",
              }}
            />


            {/* NAME */}

            <label>
              Name
            </label>

            <input
              type="text"
              value={editData.name}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  name: e.target.value,
                })
              }
            />


            {/* USERNAME */}

            <label>
              Username
            </label>

            <input
              type="text"
              value={
                editData.username
              }
              onChange={(e) =>
                setEditData({
                  ...editData,
                  username:
                    e.target.value,
                })
              }
            />


            {/* BIO */}

            <label>
              Bio
            </label>

            <textarea
              value={editData.bio}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  bio: e.target.value,
                })
              }
              placeholder="Write something about yourself..."
            />


            {/* SAVE */}

            <button
              className="save-profile-btn"
              onClick={saveProfile}
            >
              Save Changes
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Profile;