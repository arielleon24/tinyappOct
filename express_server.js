const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const PORT = 8080; // default port 8080
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  checkLoginInfo,
} = require("./helper");

// Cookie parser
const cookieSession = require("cookie-session");

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

// Body Parser

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//databases

const urlDatabase = {};
const userDatabase = {};

//Home page
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});


/// REGISTER ROUTES

app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  if(user_id) {
    res.redirect("/urls")
  }
  const user = userDatabase[user_id];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const id = generateRandomString(6);
  if (!req.body.email || !req.body.password) {
    res.send("400 Status code - Email or password missing");
  }
  if (getUserByEmail(userDatabase, req.body.email)) {
    res.status(404).redirect("/error404");
  } else {
    userDatabase[id] = {
      id: id,
      email: req.body.email,
      password: hashedPassword,
    };
  }
  req.session.user_id = id;
  res.redirect("/urls");
});

/// LOGIN ROUTES

app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  if(user_id) {
    res.redirect("/urls")
  }
  const user = userDatabase[user_id];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  let user = req.body;
  if (checkLoginInfo(userDatabase, user)) {
    const userid = checkLoginInfo(userDatabase, user);
    req.session.user_id = userid;
    res.redirect("/urls");
  } else {
    res.status(403).redirect("/wrongLogin");
  }
});

/// LOGOUT ROUTE

app.post("/logout", (req, res) => {
  res.clearCookie("session"); /// res.cookies can erase a cooking by refering only to it's name
  res.redirect("/urls");
});

//// /URLS INDEX ROUTES

app.get("/urls", (req, res) => {
  const user = userDatabase[req.session.user_id];
  const filter = urlsForUser(urlDatabase, req.session.user_id);
  const templateVars = { urls: filter, user: user };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const short = generateRandomString();
  urlDatabase[short] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${short}`);
});

//// URLS NEW ROUTES --------------

app.get("/urls/new", (req, res) => {
  const user = userDatabase[req.session.user_id];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_new", templateVars);
});

/// URLS IDs (SHOW) ROUTES

app.get("/urls/:shortURL", (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    const user = userDatabase[req.session.user_id];
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: user,
    };
    res.render("urls_show", templateVars);
  }
  res.render("notYourUrl");
});

app.post("/urls/:shortURL", (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    const shortURL = req.params.shortURL; /// req.params
    urlDatabase[shortURL].longURL = req.body.updateURL;
    res.redirect(`/urls/${shortURL}`);
  }
  res.render("notYourUrl");

});

/// DELETE ROUTE

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL; /// req.params
  if (req.session.user_id) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});


/////REDIRECTION TO LONG URLS

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL.longURL);
});


// ERROR HANDLING ROUTES

app.get("/error404", (req, res) => {
  res.render("error404");
});

app.get("/wrongLogin", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = { urls: urlDatabase, user: user_id };
  res.render("wrongLogin", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

////LISTENING ----------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
