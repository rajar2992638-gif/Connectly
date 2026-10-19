import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreatePost.css";

function CreatePost() {
  const navigate = useNavigate();

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // =========================
  // SELECT IMAGE
  // =========================

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setImage(file);

    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);
  };

  // =========================
  // CREATE POST
  // =========================

  const handleCreatePost = (event) => {
    event.preventDefault();

    if (!caption.trim() && !image) {
      alert("Please add an image or caption");
      return;
    }

    alert("Post created successfully! 🎉");

    setCaption("");
    setImage(null);
    setPreview(null);

    navigate("/");
  };

  return (
    <div className="create-page">

      {/* ================= HEADER ================= */}

      <header className="create-header">

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          ←
        </button>

        <h2>Create new post</h2>

        <button
          className="share-button"
          onClick={handleCreatePost}
        >
          Share
        </button>

      </header>


      {/* ================= CONTENT ================= */}

      <main className="create-container">

        <div className="create-card">

          <div className="create-title">

            <div className="create-avatar">
              R
            </div>

            <div>
              <strong>
                raja_official
              </strong>

              <span>
                Create a new post
              </span>
            </div>

          </div>


          {/* ================= IMAGE PREVIEW ================= */}

          <div className="upload-area">

            {preview ? (

              <div className="preview-wrapper">

                <img
                  src={preview}
                  alt="Post preview"
                  className="image-preview"
                />

                <button
                  className="remove-image"
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreview(null);
                  }}
                >
                  ×
                </button>

              </div>

            ) : (

              <div className="upload-placeholder">

                <div className="upload-icon">
                  ＋
                </div>

                <h3>
                  Add a photo
                </h3>

                <p>
                  Share your moments with Connectly
                </p>

                <label
                  htmlFor="post-image"
                  className="select-image-button"
                >
                  Select from computer
                </label>

                <input
                  id="post-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />

              </div>

            )}

          </div>


          {/* ================= CAPTION ================= */}

          <div className="caption-section">

            <label>
              Caption
            </label>

            <textarea
              value={caption}
              onChange={(event) =>
                setCaption(event.target.value)
              }
              placeholder="Write a caption..."
              maxLength={500}
            />

            <div className="character-count">
              {caption.length}/500
            </div>

          </div>


          {/* ================= OPTIONS ================= */}

          <div className="post-options">

            <div>
              <span>📍</span>
              <span>Add location</span>
            </div>

            <button
              type="button"
              onClick={() =>
                alert("Location feature coming soon")
              }
            >
              →
            </button>

          </div>

          <div className="post-options">

            <div>
              <span>😊</span>
              <span>Add feeling</span>
            </div>

            <button
              type="button"
              onClick={() =>
                alert("Feeling feature coming soon")
              }
            >
              →
            </button>

          </div>


          {/* ================= POST BUTTON ================= */}

          <button
            className="create-post-button"
            onClick={handleCreatePost}
          >
            Create Post
          </button>

        </div>

      </main>

    </div>
  );
}

export default CreatePost;