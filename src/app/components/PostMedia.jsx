import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel CSS

const PostMedia = ({ mediaUrls }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const handleOpen = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setIsOpen(true);
  };

  const handleClose = () => {
    setSelectedMedia(null);
    setIsOpen(false);
  };

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
              controls
              className="w-full h-full max-w-full object-cover cursor-pointer rounded-lg"
              onClick={() => handleOpen(mediaUrls[0])}
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
                    controls
                    className="w-full h-full object-cover cursor-pointer rounded-lg"
                    onClick={() => handleOpen(mediaUrl)}
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
