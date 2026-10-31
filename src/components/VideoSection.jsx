import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import video1Src from '../assets/gemini_generated_video_7b190859.mp4';
import video2Src from '../assets/gemini_generated_video_caa071c0.mp4';
import video3Src from '../assets/gemini_generated_video_3a65de49.mp4';

const VIDEOS = [
  {
    id: 1,
    title: 'Divine Sanctum',
    subtitle: 'Sacred Meditation',
    src: video1Src,
    fallback: '/assets/videos/gemini_generated_video_7b190859.mp4',
  },
  {
    id: 2,
    title: 'Palm-Leaf Wisdom',
    subtitle: 'Siddhar Inscriptions',
    src: video2Src,
    fallback: '/assets/videos/gemini_generated_video_caa071c0.mp4',
  },
  {
    id: 3,
    title: 'Navapashanam Alchemy',
    subtitle: 'Sacred Formulation',
    src: video3Src,
    fallback: '/assets/videos/gemini_generated_video_3a65de49.mp4',
  },
];

export default function VideoSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef([]);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;

  const isMountedRef = useRef(true);

  // Play a specific video index and pause all others
  const playVideoAtIndex = useCallback((idx) => {
    if (!isMountedRef.current) return;
    setActiveIndex(idx);
    activeIndexRef.current = idx;

    videoRefs.current.forEach((vid, vIdx) => {
      if (!vid) return;
      if (vIdx === idx) {
        vid.muted = isMuted;
        const playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (isMountedRef.current) setIsPlaying(true);
            })
            .catch((err) => {
              if (err && err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                console.warn(`Autoplay note for video ${idx}:`, err.message || err);
              }
            });
        }
      } else {
        vid.pause();
        vid.muted = true;
      }
    });
  }, [isMuted]);

  // Handle continuous loop: Video 1 -> Video 2 -> Video 3 -> Video 1 ...
  const advanceToNextVideo = useCallback(() => {
    if (!isMountedRef.current) return;
    const currentIdx = activeIndexRef.current;
    const nextIdx = (currentIdx + 1) % VIDEOS.length;

    // Strictly pause and mute ALL other videos
    videoRefs.current.forEach((vid, vIdx) => {
      if (vid && vIdx !== nextIdx) {
        vid.pause();
        vid.muted = true;
      }
    });

    setActiveIndex(nextIdx);
    activeIndexRef.current = nextIdx;

    // Play incoming next video immediately
    const nextVid = videoRefs.current[nextIdx];
    if (nextVid && isMountedRef.current) {
      nextVid.muted = isMuted;
      nextVid.currentTime = 0;
      const playPromise = nextVid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (isMountedRef.current) setIsPlaying(true);
          })
          .catch((err) => {
            if (err && err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
              console.warn(`Autoplay note for next video ${nextIdx}:`, err.message || err);
            }
          });
      }
    }
  }, [isMuted]);

  // Default: Start Video 1 automatically on homepage load
  useEffect(() => {
    isMountedRef.current = true;
    playVideoAtIndex(0);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        videoRefs.current.forEach((vid) => {
          if (vid) {
            try {
              vid.pause();
              vid.muted = true;
            } catch {}
          }
        });
        setIsPlaying(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      videoRefs.current.forEach((vid) => {
        if (vid) {
          try {
            vid.pause();
            vid.muted = true;
            vid.currentTime = 0;
          } catch {
            // ignore
          }
        }
      });
    };
  }, [playVideoAtIndex]);

  // User manual click/tap handler: Immediately plays selected video, pauses others
  const handleCardClick = (idx) => {
    // Strictly pause and mute all other videos
    videoRefs.current.forEach((vid, vIdx) => {
      if (vid && vIdx !== idx) {
        vid.pause();
        vid.muted = true;
      }
    });

    setActiveIndex(idx);
    activeIndexRef.current = idx;

    const selectedVid = videoRefs.current[idx];
    if (selectedVid) {
      if (idx !== activeIndex || selectedVid.paused) {
        selectedVid.muted = isMuted;
        selectedVid.play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      } else {
        selectedVid.pause();
        setIsPlaying(false);
      }
    }
  };

  // Toggle mute state for active video ONLY
  const toggleMute = (e) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRefs.current.forEach((vid, vIdx) => {
      if (vid) {
        if (vIdx === activeIndexRef.current) {
          vid.muted = newMuted;
        } else {
          vid.muted = true;
        }
      }
    });
  };

  // Advance when current active video finishes
  const handleVideoEnded = (idx) => {
    if (idx === activeIndexRef.current) {
      advanceToNextVideo();
    }
  };

  return (
    <section className="bogar-video-section" aria-label="Bogar Sacred Heritage Video">
      <div className="bogar-video-section__container">
        {/* Existing Section Header & Styling */}
        <div className="bogar-video-section__header">
          <p className="bogar-video-section__eyebrow">DIVINE ESSENCE & TRADITION</p>
          <h2 className="bogar-video-section__title">Sacred Vision of Bogar Siddhar</h2>
          <div className="bogar-video-section__ornament">
            <span className="bogar-video-section__ornament-line" />
            <span className="bogar-video-section__ornament-symbol">✦</span>
            <span className="bogar-video-section__ornament-line" />
          </div>
        </div>

        {/* 3 Horizontal Portrait Video Cards in ONE Row */}
        <div className="bogar-video-row">
          {VIDEOS.map((vid, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={vid.id}
                className={`bogar-video-card ${
                  isActive ? 'bogar-video-card--active' : 'bogar-video-card--inactive'
                }`}
                onClick={() => handleCardClick(idx)}
                role="button"
                tabIndex={0}
                aria-label={`Play ${vid.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(idx);
                  }
                }}
              >
                {/* Portrait Video Element */}
                <video
                  ref={(el) => (videoRefs.current[idx] = el)}
                  className="bogar-video-card__video"
                  src={vid.src || vid.fallback}
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onEnded={() => handleVideoEnded(idx)}
                  onPlay={() => {
                    if (idx === activeIndexRef.current) setIsPlaying(true);
                  }}
                  onPause={() => {
                    if (idx === activeIndexRef.current) setIsPlaying(false);
                  }}
                >
                  <source src={vid.src} type="video/mp4" />
                  <source src={vid.fallback} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Subtle Gradient Shadow Overlay for text readability */}
                <div className="bogar-video-card__overlay" />

                {/* Top Badge: Playing Indicator & Sound Control */}
                <div className="bogar-video-card__top">
                  <span
                    className={`bogar-video-card__badge ${
                      isActive ? 'bogar-video-card__badge--active' : ''
                    }`}
                  >
                    {isActive ? (
                      <>
                        <span className="bogar-video-card__dot" />
                        <span>{isPlaying ? 'PLAYING' : 'PAUSED'}</span>
                      </>
                    ) : (
                      <span>VIDEO {idx + 1}</span>
                    )}
                  </span>

                  {isActive && (
                    <button
                      type="button"
                      className="bogar-video-card__mute-btn"
                      onClick={toggleMute}
                      aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                    >
                      {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                  )}
                </div>

                {/* Bottom Frosted Glass Card Label */}
                <div className="bogar-video-card__footer">
                  <div className="bogar-video-card__info">
                    <h4 className="bogar-video-card__name">{vid.title}</h4>
                    <p className="bogar-video-card__subtitle">{vid.subtitle}</p>
                  </div>
                  <div className="bogar-video-card__action-icon">
                    {isActive && isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
