import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Reels.css";

const DB_NAME = "ConnectlyReelsDB";
const STORE_NAME = "reels";
const DB_VERSION = 1;

// ==========================================
// SAVE USER INTEREST
// ==========================================

const saveUserInterest = (category) => {
  if (!category) return;

  try {
    const normalizedCategory = String(category)
      .trim()
      .toLowerCase();

    if (!normalizedCategory) return;

    const savedInterests = JSON.parse(
      localStorage.getItem("connectlyInterests") || "{}"
    );

    savedInterests[normalizedCategory] =
      (savedInterests[normalizedCategory] || 0) + 1;

    localStorage.setItem(
      "connectlyInterests",
      JSON.stringify(savedInterests)
    );

    console.log(
      "Connectly interest:",
      normalizedCategory,
      savedInterests[normalizedCategory]
    );
  } catch (error) {
    console.error(
      "Failed to save user interest:",
      error
    );
  }
};

// ==========================================
// OPEN INDEXED DB
// ==========================================

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
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

// ==========================================
// GET REELS
// ==========================================

const getAllReelsFromDB = async () => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store =
      transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      const reels = request.result || [];

      db.close();

      // Newest first
      reels.sort((a, b) => b.id - a.id);

      resolve(reels);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

// ==========================================
// SAVE UPDATED REEL
// ==========================================

const saveReelToDB = async (reel) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store =
      transaction.objectStore(STORE_NAME);

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

// ==========================================
// DELETE REEL
// ==========================================

const deleteReelFromDB = async (reelId) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store =
      transaction.objectStore(STORE_NAME);

    store.delete(reelId);

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

// ==========================================
// REELS COMPONENT
// ==========================================

function Reels() {
  const reelCardRefs = useRef({});
  const reelVideoRefs = useRef({});
  const videoUrlsRef = useRef({});

  // Prevent counting same reel repeatedly
  // during the current page session
  const trackedReelsRef = useRef(new Set());

  const [reels, setReels] = useState([]);
  const [likedReels, setLikedReels] = useState({});
  const [activeReel, setActiveReel] = useState(null);

  // Autoplay starts muted
  const [isMuted, setIsMuted] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  // ========================================
  // LOAD REELS
  // ========================================

  useEffect(() => {
    let mounted = true;

    const loadReels = async () => {
      try {
        const savedReels =
          await getAllReelsFromDB();

        if (!mounted) return;

        const reelsWithUrls =
          savedReels.map((reel) => {
            const videoUrl =
              URL.createObjectURL(
                reel.videoBlob
              );

            videoUrlsRef.current[
              reel.id
            ] = videoUrl;

            return {
              ...reel,
              videoUrl,
            };
          });

        setReels(reelsWithUrls);

        if (reelsWithUrls.length > 0) {
          setActiveReel(
            reelsWithUrls[0].id
          );
        }
      } catch (error) {
        console.error(
          "Failed to load reels:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadReels();

    return () => {
      mounted = false;

      Object.values(
        videoUrlsRef.current
      ).forEach((url) => {
        URL.revokeObjectURL(url);
      });

      videoUrlsRef.current = {};
    };
  }, []);

  // ========================================
  // INTERSECTION OBSERVER
  // Detect current visible reel
  // ========================================

  useEffect(() => {
    if (reels.length === 0) return;

    const observer =
      new IntersectionObserver(
        (entries) => {
          let mostVisible = null;
          let highestRatio = 0;

          entries.forEach((entry) => {
            if (
              entry.isIntersecting &&
              entry.intersectionRatio >
                highestRatio
            ) {
              highestRatio =
                entry.intersectionRatio;

              mostVisible = Number(
                entry.target.dataset.reelId
              );
            }
          });

          if (mostVisible !== null) {
            setActiveReel(
              mostVisible
            );
          }
        },
        {
          threshold: [
            0.5,
            0.65,
            0.8,
            1,
          ],
        }
      );

    Object.values(
      reelCardRefs.current
    ).forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [reels]);

  // ========================================
  // TRACK USER INTEREST
  // ========================================

  useEffect(() => {
    if (
      activeReel === null ||
      reels.length === 0
    ) {
      return;
    }

    const activeReelData =
      reels.find(
        (reel) =>
          reel.id === activeReel
      );

    if (!activeReelData) return;

    const category =
      activeReelData.category;

    if (!category) {
      console.log(
        "This reel has no category:",
        activeReelData
      );

      return;
    }

    // Don't count same reel repeatedly
    if (
      trackedReelsRef.current.has(
        activeReel
      )
    ) {
      return;
    }

    trackedReelsRef.current.add(
      activeReel
    );

    saveUserInterest(category);
  }, [activeReel, reels]);

  // ========================================
  // PLAY ONLY ACTIVE REEL
  // ========================================

  useEffect(() => {
    Object.entries(
      reelVideoRefs.current
    ).forEach(([id, video]) => {
      if (!video) return;

      const reelId = Number(id);

      video.muted = isMuted;

      if (reelId === activeReel) {
        video
          .play()
          .catch(() => {});
      } else {
        video.pause();

        try {
          video.currentTime = 0;
        } catch {
          // Ignore
        }
      }
    });
  }, [
    activeReel,
    isMuted,
  ]);

  // ========================================
  // MUTE / UNMUTE
  // ========================================

  const toggleMute = () => {
    setIsMuted(
      (previous) => !previous
    );
  };

  // ========================================
  // LIKE
  // ========================================

  const handleLike = async (reelId) => {
    const alreadyLiked =
      likedReels[reelId] || false;

    const newLikedState = {
      ...likedReels,
      [reelId]: !alreadyLiked,
    };

    setLikedReels(
      newLikedState
    );

    const updatedReels =
      reels.map((reel) => {
        if (reel.id !== reelId) {
          return reel;
        }

        return {
          ...reel,

          likes: alreadyLiked
            ? Math.max(
                0,
                Number(
                  reel.likes || 0
                ) - 1
              )
            : Number(
                reel.likes || 0
              ) + 1,
        };
      });

    setReels(updatedReels);

    const updatedReel =
      updatedReels.find(
        (reel) =>
          reel.id === reelId
      );

    if (updatedReel) {
      await saveReelToDB(
        updatedReel
      );
    }
  };

  // ========================================
  // DELETE
  // ========================================

  const handleDelete = async (
    reelId
  ) => {
    const shouldDelete =
      window.confirm(
        "Delete this reel?"
      );

    if (!shouldDelete) return;

    const video =
      reelVideoRefs.current[
        reelId
      ];

    if (video) {
      video.pause();
      video.removeAttribute(
        "src"
      );
      video.load();
    }

    try {
      await deleteReelFromDB(
        reelId
      );

      const oldUrl =
        videoUrlsRef.current[
          reelId
        ];

      if (oldUrl) {
        URL.revokeObjectURL(
          oldUrl
        );

        delete videoUrlsRef.current[
          reelId
        ];
      }

      const remainingReels =
        reels.filter(
          (reel) =>
            reel.id !== reelId
        );

      setReels(
        remainingReels
      );

      setLikedReels(
        (previous) => {
          const updated = {
            ...previous,
          };

          delete updated[
            reelId
          ];

          return updated;
        }
      );

      // Remove tracking entry
      trackedReelsRef.current.delete(
        reelId
      );

      delete reelCardRefs.current[
        reelId
      ];

      delete reelVideoRefs.current[
        reelId
      ];

      // Set next active reel
      if (
        activeReel === reelId
      ) {
        if (
          remainingReels.length >
          0
        ) {
          setActiveReel(
            remainingReels[0].id
          );
        } else {
          setActiveReel(null);
        }
      }
    } catch (error) {
      console.error(
        "Failed to delete reel:",
        error
      );

      alert(
        "Could not delete reel."
      );
    }
  };

  // ========================================
  // VIDEO CLICK
  // ========================================

  const handleVideoClick = (
    event
  ) => {
    const video =
      event.currentTarget;

    if (video.paused) {
      video
        .play()
        .catch(() => {});
    } else {
      video.pause();
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="reels-page">
        <div className="reels-loading">

          <div className="reels-loading-logo">
            C<span>✦</span>
          </div>

          <h2>
            Loading Reels...
          </h2>

          <div className="reels-loader"></div>

        </div>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="reels-page">

      {/* HEADER */}

      <header className="reels-header">

        <Link
          to="/"
          className="reels-logo"
        >
          <span>
            C✦
          </span>

          <strong>
            Connectly
          </strong>
        </Link>

        <h2>
          Reels
        </h2>

        <Link
          to="/"
          className="reels-home"
        >
          Home
        </Link>

      </header>

      {/* REELS */}

      {reels.length === 0 ? (
        <main className="empty-reels-page">

          <div className="empty-reels-icon">
            ▶
          </div>

          <h2>
            No Reels Yet
          </h2>

          <p>
            No videos have been
            posted yet.
          </p>

          <Link
            to="/create-reel"
            className="empty-create-button"
          >
            + Create Reel
          </Link>

        </main>
      ) : (
        <main className="reels-viewer">

          <section className="reels-feed">

            {reels.map(
              (reel) => {

                const isLiked =
                  likedReels[
                    reel.id
                  ] || false;

                return (
                  <article
                    key={reel.id}
                    className="reel-card"
                    data-reel-id={
                      reel.id
                    }
                    ref={(
                      element
                    ) => {
                      if (element) {
                        reelCardRefs.current[
                          reel.id
                        ] = element;
                      }
                    }}
                  >

                    {/* VIDEO */}

                    <div className="reel-video-wrapper">

                      <video
                        ref={(
                          element
                        ) => {
                          if (element) {
                            reelVideoRefs.current[
                              reel.id
                            ] = element;
                          }
                        }}
                        src={
                          reel.videoUrl
                        }
                        className="reel-video"
                        loop
                        playsInline
                        muted={
                          isMuted
                        }
                        preload="metadata"
                        onClick={
                          handleVideoClick
                        }
                      />

                      {/* SOUND */}

                      <button
                        type="button"
                        className="reel-sound-button"
                        onClick={
                          toggleMute
                        }
                        aria-label={
                          isMuted
                            ? "Unmute"
                            : "Mute"
                        }
                      >
                        {isMuted
                          ? "🔇"
                          : "🔊"}
                      </button>

                      {/* BOTTOM OVERLAY */}

                      <div className="reel-bottom-overlay">

                        <div className="reel-info">

                          <div className="reel-user">

                            <div className="reel-avatar">
                              R
                            </div>

                            <strong>
                              {
                                reel.username ||
                                "raja_official"
                              }
                            </strong>

                          </div>

                          <p className="reel-caption">
                            {
                              reel.caption ||
                              "My new Connectly reel 🎬"
                            }
                          </p>

                        </div>

                        {/* ACTIONS */}

                        <div className="reel-actions">

                          <button
                            type="button"
                            className={
                              isLiked
                                ? "reel-action-button reel-liked"
                                : "reel-action-button"
                            }
                            onClick={() =>
                              handleLike(
                                reel.id
                              )
                            }
                          >
                            <span>
                              {isLiked
                                ? "♥"
                                : "♡"}
                            </span>

                            <small>
                              {
                                reel.likes ||
                                0
                              }
                            </small>
                          </button>

                          <button
                            type="button"
                            className="reel-action-button"
                            onClick={() =>
                              alert(
                                "Comments coming soon 💬"
                              )
                            }
                          >
                            <span>
                              💬
                            </span>

                            <small>
                              Comment
                            </small>
                          </button>

                          <button
                            type="button"
                            className="reel-action-button"
                            onClick={() =>
                              alert(
                                "Share feature coming soon 🚀"
                              )
                            }
                          >
                            <span>
                              ➤
                            </span>

                            <small>
                              Share
                            </small>
                          </button>

                          <button
                            type="button"
                            className="reel-action-button reel-delete-button"
                            onClick={() =>
                              handleDelete(
                                reel.id
                              )
                            }
                          >
                            <span>
                              🗑
                            </span>

                            <small>
                              Delete
                            </small>
                          </button>

                        </div>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </section>

        </main>
      )}

    </div>
  );
}

export default Reels;