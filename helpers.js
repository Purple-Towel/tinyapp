// generates a random 6 digit ID
const generateID = function() {
  let characters = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
  let outputID = "";
  for (let i = 6; i > 0; i--) {
    outputID += characters[Math.floor(Math.random() * characters.length)];
  }
  return outputID;
};

// checks if an email address exists in a database
const doesEmailExist = function(emailInput, database) {
  for (let user in database) {
    if (database[user].email === emailInput) {
      return true;
    }
  }
  return false;
};

//gets user id for a matching email address in a database
const fetchUserIDFromEmail = function(emailInput, database) {
  for (let user in database) {
    if (database[user].email === emailInput) {
      return database[user].id;
    }
  }
  return undefined;
};

// filters out the URLs for a given user from a database
const urlsForUserID = function(userIDInput, database) {
  let outputURLs = {};
  for (let url in database) {
    if (database[url].userID === userIDInput) {
      outputURLs[url] = database[url];
    }
  }
  return outputURLs;
};

// checks if an input id is the same as in a given database
const isIDSame = function(userIDInput, database) {
  for (let url in database) {
    if (database[url].userID === userIDInput) {
      return true;
    }
  }
  return false;
};

module.exports = { generateID, doesEmailExist, fetchUserIDFromEmail, urlsForUserID, isIDSame };