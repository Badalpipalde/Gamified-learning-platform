import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlay } from 'react-icons/hi';

const VideoPlayer = ({ videoUrl, title, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Extract YouTube thumbnail from embed URL
  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const match = url.match(/embed\/([a-zA-Z0-9_-]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
  };

  const thumbnail = getYouTubeThumbnail(videoUrl);

  if (!videoUrl) {
    return (
      <div className={`aspect-video rounded-2xl bg-gray-900 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <HiPlay className="w-16 h-16 mx-auto mb-2 opacity-50" />
          <p>Video coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`video-container relative aspect-video rounded-2xl overflow-hidden group ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && showVideo && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Loading video...</span>
          </div>
        </div>
      )}

      {/* Thumbnail with play button overlay */}
      {!showVideo && (
        <motion.button
          className="absolute inset-0 w-full h-full z-20 cursor-pointer group/play"
          onClick={() => setShowVideo(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Thumbnail image */}
          {thumbnail && (
            <img
              src={thumbnail}
              alt={title || 'Video thumbnail'}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover/play:bg-black/30 transition-colors duration-300" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 group-hover/play:bg-white/30 transition-all duration-300"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <HiPlay className="w-10 h-10 sm:w-12 sm:h-12 text-white ml-1" />
            </motion.div>
          </div>

          {/* Title overlay */}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-sm font-medium truncate">{title}</p>
            </div>
          )}
        </motion.button>
      )}

      {/* YouTube iframe */}
      {showVideo && (
        <iframe
          src={`${videoUrl}?autoplay=1&rel=0&modestbranding=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title || 'Video lesson'}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
