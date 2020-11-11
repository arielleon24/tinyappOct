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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function (length = 6) {
  console.log(Math.random().toString(20).substr(2, length));
  return Math.random().toString(20).substr(2, length);
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) =>{
  res.json(urlDatabase)
});

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
    res.render('urls_index', templateVars)
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]}
  res.render("urls_new", templateVars)
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    username: req.cookies["username"]}
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

app.post("/login", (req, res) => {
  let login = req.body
  console.log(login)
  res.cookie("username", login)
  const templateVars = {
    username: login
  }
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("username") /// res.cookies can erase a cooking by refering only to it's name
  console.log(req.cookies.username)
  res.redirect("/urls")
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});