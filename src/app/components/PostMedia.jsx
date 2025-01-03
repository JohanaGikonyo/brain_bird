import React, { useState, useRef, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel CSS

const PostMedia = ({ mediaUrls }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const videoRefs = useRef([]); // Reference to track all videos

  const handleOpen = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setIsOpen(true);
  };

  const handleClose = () => {
    setSelectedMedia(null);
    setIsOpen(false);
  };

  useEffect(() => {
    const options = {
      root: null, // Use the viewport as the root
      threshold: 0.7, // Video should be 70% visible to trigger play
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const videoElement = entry.target;

        if (entry.isIntersecting) {
          videoElement.play(); // Play video when in view
        } else {
          videoElement.pause(); // Pause video when out of view
        }
      });
    }, options);

    // Observe each video
    videoRefs.current.forEach((video) => {
      if (video) {
        observer.observe(video);
        // Ensure video remains muted after it pauses or finishes playing
        const handlePauseOrEnd = () => {
          video.muted = true;
        };
        video.addEventListener('pause', handlePauseOrEnd);
        video.addEventListener('ended', handlePauseOrEnd);
        
        // Clean up event listeners on unmount
        return () => {
          video.removeEventListener('pause', handlePauseOrEnd);
          video.removeEventListener('ended', handlePauseOrEnd);
        };
      }
    });

    return () => {` `
<      // Unobserve videos on cleanup
      // eslint-disable-next-line react-hooks/exhaustive-deps
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Display first image or carousel if more than one */}
      <div className="w-full h-60 sm:h-80 lg:h-96 mb-2 overflow-hidden rounded-lg">
        {mediaUrls.length === 1 ? (
          mediaUrls[0].startsWith("data:image") ? (
            <Image
              width={800}
              height={600}
              src={mediaUrls[0]}
              alt="media-0"
              className="w-full h-full max-w-full object-cover cursor-pointer rounded-lg"
              onClick={() => handleOpen(mediaUrls[0])}
            />
          ) : (
            <video
              ref={(el) => (videoRefs.current[0] = el)} // Reference to the video element
              controls
              controlsList="nodownload" // Prevent download option
              disablePictureInPicture // Disable Picture-in-Picture
              onContextMenu={(e) => e.preventDefault()} // Disable right-click
              className="w-full h-full max-w-full object-cover cursor-pointer rounded-lg"
              muted // Mute video by default
              autoPlay // Autoplay video
            >
              <source src={mediaUrls[0]} type="video/mp4" />
            </video>
          )
        ) : (
          <Carousel showThumbs={false} infiniteLoop useKeyboardArrows>
            {mediaUrls.map((mediaUrl, i) => (
              <div key={i} className="h-60 sm:h-80 lg:h-96 w-full flex items-center justify-center overflow-hidden">
                {mediaUrl.startsWith("data:image") ? (
                  <Image
                    width={800}
                    height={600}
                    src={mediaUrl}
                    alt={`media-${i}`}
                    className="w-full h-full object-cover cursor-pointer rounded-lg"
                    onClick={() => handleOpen(mediaUrl)}
                  />
                ) : (
                  <video
                    ref={(el) => (videoRefs.current[i] = el)} // Reference to the video element
                    controls
                    controlsList="nodownload" // Prevent download option
                    disablePictureInPicture // Disable Picture-in-Picture mode
                    onContextMenu={(e) => e.preventDefault()} // Disable right-click menu
                    className="w-full h-full object-cover cursor-pointer rounded-lg"
                    muted // Mute video by default
                    autoPlay // Autoplay video
                  >
                    <source src={mediaUrl} type="video/mp4" />
                  </video>
                )}
              </div>
            ))}
          </Carousel>
        )}
      </div>

      {/* Modal for zooming images */}
      <Modal open={isOpen} onClose={handleClose} className="flex items-center justify-center p-4">
        <Box className="p-4 bg-white rounded-lg shadow-lg max-w-full max-h-[90vh] overflow-auto">
          {selectedMedia && selectedMedia.startsWith("data:image") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selectedMedia} alt="selected-media" className="w-full h-full object-cover rounded-lg" />
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default PostMedia;
