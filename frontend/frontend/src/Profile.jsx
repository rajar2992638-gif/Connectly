import React, { useState } from "react";
import "./Profile.css";

function Profile() {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("raja_dev");
  const [bio, setBio] = useState(
    "B.Sc Computer Science Student 💻 | Full Stack Developer 🚀"
  );

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-photo">👤</div>

        <div className="profile-info">
          <div className="profile-top">
            <h2>{username}</h2>
            <button onClick={() => setEditing(!editing)}>
              {editing ? "Save Profile" : "Edit Profile"}
            </button>
          </div>

          <div className="profile-stats">
            <span>
              <b>12</b> Posts
            </span>
            <span>
              <b>245</b> Followers
            </span>
            <span>
              <b>180</b> Following
            </span>
          </div>

          {editing ? (
            <div className="edit-box">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
              />
            </div>
          ) : (
            <p className="bio">{bio}</p>
          )}
        </div>
      </div>

      <hr />

      <h3 className="posts-title">My Posts</h3>

      <div className="post-grid">
        <div>📸</div>
        <div>🌄</div>
        <div>💻</div>
        <div>🚀</div>
        <div>🎓</div>
        <div>🔥</div>
      </div>
    </div>
  );
}

export default Profile;
