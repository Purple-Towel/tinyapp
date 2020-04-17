const fetchUserIDFromEmail = function(emailInput, database) {
  for (let user in database) {
    if (database[user].email === emailInput) {
      return database[user].id;
    }
  }
  return undefined;
};

module.exports = { fetchUserIDFromEmail, };