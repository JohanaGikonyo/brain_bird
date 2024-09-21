// utils/userUtils.js
export const getNameFromEmail = (email) => {
  if (!email) return "Guest";

  const [namePart] = email.split("@");
  const cleanName = namePart.replace(/\d+/g, "");
  const capitalLetterIndex = cleanName.search(/[A-Z]/g, 1);

  let firstName = cleanName;
  let lastName = "";

  if (capitalLetterIndex !== -1) {
    firstName = cleanName.slice(0, capitalLetterIndex);
    lastName = cleanName.slice(capitalLetterIndex);
  }

  const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const capitalizedLastName = lastName ? lastName.charAt(0).toUpperCase() + lastName.slice(1) : "";

  return lastName ? `${capitalizedFirstName} ${capitalizedLastName}` : capitalizedFirstName;
};
