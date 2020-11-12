const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Cookie parser

const cookieParser = require('cookie-parser')
app.use(cookieParser())

// Body Parser

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// sets EJS as the viewing engine
app.set("view engine", "ejs");

//function to check whether email is in Database
const emailInDb = (db, emailToCheck) => {
for (let user in db) {
  if(db[user].email === emailToCheck) {
    
    return true
  }
} return false
}

///function to check whether the login info is correct 
const checkLoginInfo = (db, userObj) => {
  for (let user in db) {
    if(db[user].email === userObj.email){
      if (db[user].password === userObj.password) {
       return db[user].id
      }
    } 
  }
  return false

}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const generateRandomString = function (length = 6) {
  return Math.random().toString(20).substr(2, length);
};


// GET Request ------------


app.get("/error404", (req, res) => {
  res.render("error404")
})

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/wrongLogin", (req, res) => {
  const user_id = req.cookies["user_id"]
  const user = userDatabase[user_id]
  const templateVars = { urls: urlDatabase, user: user_id };
  res.render("wrongLogin", templateVars)
})

app.get("/urls.json", (req, res) =>{
  res.json(urlDatabase)
});

app.get("/urls", (req, res) => {
  const user = req.cookies["user_id"]
    const templateVars = { urls: urlDatabase, user: user };
    // console.log("UserData -afterRedirect:", userDatabase)
    res.render('urls_index', templateVars)
});

app.get("/urls/new", (req, res) => {
  const user = req.cookies["user_id"]
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_new", templateVars)
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"]
  const user = userDatabase[user_id]
  const templateVars = {shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    user: user}
  console.log("url Database:", urlDatabase)
  console.log(templateVars.shortURL)
  res.render('urls_show', templateVars)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/hello",(req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"]
  const user = userDatabase[user_id]
  const templateVars = { urls: urlDatabase, user: user };
  res.render('register', templateVars)
})

app.get("/login", (req, res) =>{
  const user_id = req.cookies["user_id"]
  const user = userDatabase[user_id]
  const templateVars = { urls: urlDatabase, user: user };
  res.render("login", templateVars)
})

// -------------POST

//post route for FORM submission

app.post("/urls", (req, res) => {
  console.log(req.body); // req.body is the object with LongURL key and the website value
  short = generateRandomString()
  urlDatabase[short] = req.body.longURL;
  console.log(urlDatabase) 
  res.redirect(`/urls/${short}`)
})

app.post("/urls/:shortURL/delete", (req, res) => {
  shortURL = req.params.shortURL /// req.params 
  console.log(shortURL)
  delete urlDatabase[shortURL];
  res.redirect("/urls")
})

app.post("/urls/:shortURL/update", (req, res) => {
  shortURL = req.params.shortURL /// req.params 
  console.log("Before:",urlDatabase)
  urlDatabase[shortURL] = req.body.updateURL
  console.log("After:",urlDatabase) // database updated with new URL
  res.redirect("/urls")
})


app.post("/logout", (req, res) => {
  res.clearCookie("user_id") /// res.cookies can erase a cooking by refering only to it's name
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  let user = req.body
  if (checkLoginInfo(userDatabase, user)) {
    const userid = checkLoginInfo(userDatabase, user)
    res.cookie("user_id", user)
    const templateVars = {
      user_id: userid
    }
    console.log(templateVars)
    res.redirect("/urls")
  } else {
    res.status(403).redirect("/wrongLogin")
  }
})

app.post("/register", (req, res) => {
  const user = req.body
  console.log(user)
  const id = generateRandomString(6)
  if (!req.body.email || !req.body.password) {
    res.send("400 Status code - Email or password missing")
  }
  if (emailInDb(userDatabase, req.body.email)) {
    res.status(404).redirect("/error404")
  } else {
      userDatabase[id] =  {
        id: id, 
        email: req.body.email, 
        password: req.body.password
      }
  }
  res.cookie("user_id", user)
  const templateVars = {
    user_id: user
  }
  res.redirect("/urls")
})

////LISTENING ----------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});