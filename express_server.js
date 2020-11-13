const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const PORT = 8080; // default port 8080
const {getUserByEmail, generateRandomString, urlsForUser} = require("./helper")

// Cookie parser
const cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

// Body Parser

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// sets EJS as the viewing engine
app.set("view engine", "ejs");

const checkLoginInfo = (db, userObj) => {
  for (let user in db) {
    if(db[user].email === userObj.email){
      if (bcrypt.compareSync(userObj.password, db[user].password)) {
       return db[user].id;
      }
    } 
  }
  return false;
};


const urlDatabase = {
  "b2xVn2": { longURL:"http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL:"http://www.google.com", userID: "user2RandomID"}, 
  "9cm7cf": { longURL:"http://www.gamespot.com", userID: "user2RandomID"}
};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};



// GET Request ------------

console.log(getUserByEmail(userDatabase, userDatabase.user2RandomID.email))

app.get("/error404", (req, res) => {
  res.render("error404");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/wrongLogin", (req, res) => {
  const user_id = req.session.user_id;
  const user = userDatabase[user_id];
  const templateVars = { urls: urlDatabase, user: user_id };
  res.render("wrongLogin", templateVars);
});

app.get("/urls.json", (req, res) =>{
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  console.log(req.session.user_id)
  const user = userDatabase[req.session.user_id];
  // console.log([req.cookies["user_id"]])
    const filter = urlsForUser(urlDatabase, req.session.user_id)
    const templateVars = { urls: filter, user: user };
    res.render('urls_index', templateVars);
});

//// URLS NEW ROUTES --------------

app.get("/urls/new", (req, res) => {
  const user = userDatabase[req.session.user_id];
    const templateVars = { urls: urlDatabase, user: user };
    res.render("urls_new", templateVars);
});
 

app.post("/urls", (req, res) => {
  short = generateRandomString();
  urlDatabase[short] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${short}`);
});


app.get("/urls/:shortURL", (req, res) => {
  const user = userDatabase[req.session.user_id]
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL, 
    user: user}
    res.render('urls_show', templateVars);
  });
  
app.post("/urls/:shortURL/update", (req, res) => {
    shortURL = req.params.shortURL; /// req.params 
    urlDatabase[shortURL].longURL = req.body.updateURL;
    res.redirect(`/urls/${shortURL}`);
})

  app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL.longURL);
  });
  
  app.get("/hello",(req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });
  
  app.get("/register", (req, res) => {
    const user_id = req.session.user_id;
    console.log(user_id, "HEYYYYYYYYYY")
    const user = userDatabase[user_id];
    const templateVars = { urls: urlDatabase, user: user };
    res.render('register', templateVars);
  });
  
  app.get("/login", (req, res) =>{
    const user_id = req.session.user_id;
    const user = userDatabase[user_id];
    const templateVars = { urls: urlDatabase, user: user };
    res.render("login", templateVars);
  });
  
  

////////////////////////////////////////////////////////ROUTE ABOVE IS BROKEN

app.post("/urls/:shortURL/delete", (req, res) => {
  shortURL = req.params.shortURL; /// req.params 
  if(req.session.user_id) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("session"); /// res.cookies can erase a cooking by refering only to it's name
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let user = req.body;
  if (checkLoginInfo(userDatabase, user)) {
    const userid = checkLoginInfo(userDatabase, user)
    req.session.user_id = userid;
    const templateVars = {
      user_id: user
    };
    res.redirect("/urls");
  } else {
    res.status(403).redirect("/wrongLogin");
  }
});

app.post("/register", (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const id = generateRandomString(6);
  if (!req.body.email || !req.body.password) {
    res.send("400 Status code - Email or password missing");
  };
  if (getUserByEmail(userDatabase, req.body.email)) {
    res.status(404).redirect("/error404");
  } else {
      userDatabase[id] =  {
        id: id, 
        email: req.body.email, 
        password: hashedPassword 
      }
  };
  console.log(userDatabase[id])
  req.session.user_id = id;
  res.redirect("/urls");
});

////LISTENING ----------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});