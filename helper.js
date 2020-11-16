const bcrypt = require("bcrypt");

//function to check whether email is in Database
const getUserByEmail = (db, emailToCheck) => {
  for (let user in db) {
    if (db[user].email === emailToCheck) {
      return user;
    }
  }
  return undefined;
};

const urlsForUser = (db, userid) => {
  const resultDB = {};
  for (let items in db) {
    if (db[items].userID === userid) {
      resultDB[items] = {
        longURL: db[items].longURL,
        userID: db[items].userID,
      };
    }
  }
  return resultDB;
};

const generateRandomString = function(length = 6) {
  return Math.random().toString(20).substr(2, length);
};

const checkLoginInfo = (db, userObj) => {
  for (let user in db) {
    if (db[user].email === userObj.email) {
      if (bcrypt.compareSync(userObj.password, db[user].password)) {
        return db[user].id;
      }
    }
  }
  return false;
};



module.exports = { getUserByEmail, generateRandomString, urlsForUser, checkLoginInfo};
