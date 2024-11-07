import React, { useState } from 'react';

function PostContent({ content }) {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const processContent = (content) => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const hashtagRegex = /#(\w+)/g;
    return content
      .replace(urlRegex, (url) => `<a href="${url}" class="text-blue-500" target="_blank">${url}</a>`)
      .replace(hashtagRegex, (hashtag) => `<span class="text-blue-500">${hashtag}</span>`);
  };

  const processedContent = processContent(content);

  return (
    <div className="mt-2">
      <div
        className={`text-white break-words ${showMore ? `line-clamp-none` : 'line-clamp-1'}`}
        dangerouslySetInnerHTML={{ __html: processedContent }}
        onClick={toggleShowMore}

      />
      
    
    </div>
  );
}

export default PostContent;
