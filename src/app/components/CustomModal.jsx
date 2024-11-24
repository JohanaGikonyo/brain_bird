import React from 'react'
import CustomProfile from "./CustomProfile";

function CustomModal({ viewingPost, setViewingPost}) {

    const closeModal = () => {
        setViewingPost(null);
      };
  return (
    <div>{viewingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md md:max-w-lg mx-4 md:mx-0 p-6 overflow-hidden ">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Profile</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-red-500 transition duration-200 text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Profile Content */}
            <div className="max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
              <div className="flex flex-col items-center space-y-6">
                {/* Profile Picture and Info */}
                <div className="flex flex-col items-center space-y-3">
                  <CustomProfile email={viewingPost.email || viewingPost.reposter_email} />
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center px-4">
                    Detailed information about the user can be viewed here.
                  </p>
                </div>

                {/* Additional User Details */}
                <div className="w-full space-y-4 text-gray-700 dark:text-gray-300">
                  <div>
                    <h3 className="font-semibold text-base">Location:</h3>
                    <p className="text-sm">City, Country</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">About:</h3>
                    <p className="text-sm">
                      Brief description or bio of the user here, providing insight into their profile.
                    </p>
                  </div>
                  {/* Add more sections as needed */}
                </div>
              </div>
            </div>

            {/* Footer with Action Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}</div>
  )
}

export default CustomModal