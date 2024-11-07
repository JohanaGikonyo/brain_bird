import React, { useState } from 'react';

function CommentContent({ comment }) {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const processContent = (comment) => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const hashtagRegex = /#(\w+)/g;
    return comment
      .replace(urlRegex, (url) => `<a href="${url}" className="text-blue-400" target="_blank">${url}</a>`)
      .replace(hashtagRegex, (hashtag) => `<span className="text-blue-400">${hashtag}</span>`);
  };

  const processedContent = processContent(comment);

  return (
    <div className="mt-2">
      <div
        className={`text-sm break-words ${showMore ? `line-clamp-none` : 'line-clamp-1'}`}
        dangerouslySetInnerHTML={{ __html: processedContent }}
        onClick={toggleShowMore}

      />
      
    
    </div>
  );
}

export default CommentContent;
