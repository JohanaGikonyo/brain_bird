// components/UserName.js
import React from "react";

const UserName = ({ email }) => {
  const getNameFromEmail = (email) => {
    if (!email) return "Guest";

    // Split email by the "@" symbol to get the name part
    const [namePart] = email.split("@");

    // Remove any digits from the name part
    const cleanName = namePart.replace(/\d+/g, "");

    // Assuming first name starts with a lowercase and is followed by uppercase for last name
    const capitalLetterIndex = cleanName.search(/[A-Z]/g, 1); // Find first capital letter after the first character
    let firstName = cleanName;
    let lastName = "";

    if (capitalLetterIndex !== -1) {
      firstName = cleanName.slice(0, capitalLetterIndex);
      lastName = cleanName.slice(capitalLetterIndex);
    }

    // Capitalize first and last name if available
    const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const capitalizedLastName = lastName ? lastName.charAt(0).toUpperCase() + lastName.slice(1) : "";

    return lastName ? `${capitalizedFirstName} ${capitalizedLastName}` : capitalizedFirstName;
  };

  return <h3 className="text-lg font-bold">{email ? `@${getNameFromEmail(email)}   ` : "Guest"} ...</h3>;
};

export default UserName;
