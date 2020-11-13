//function to check whether email is in Database
const getUserByEmail = (db, emailToCheck) => {
  for (let user in db) {
    if(db[user].email === emailToCheck) {
      
      return user;
    }
  } return false;
  };

const urlsForUser = (db, userid) => {
  const resultDB = {};
  for (let items in db) {
    if (db[items].userID === userid) {
      resultDB[items] = {
        longURL: db[items].longURL,
        userID: db[items].userID
      }
    }
  }
  return resultDB;
}

const generateRandomString = function (length = 6) {
  return Math.random().toString(20).substr(2, length);
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser}