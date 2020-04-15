const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require("cookie-parser");

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateURL = function() {
  let characters = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
  let outputURL = "";
  for (let i = 6; i > 0; i--) {
    outputURL += characters[Math.floor(Math.random() * characters.length)];
  }
  return outputURL;
}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, userObj: users[`${req.cookies["user_id"]}`] };
  res.render("url_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { userObj: users[`${req.cookies["user_id"]}`] };
  res.render("url_new", templateVars);
});

app.get("/urls/:short_url", (req, res) => {
  let templateVars = { shortURL: req.params.short_url, longURL: urlDatabase[`${req.params.short_url}`], userObj: users[`${req.cookies["user_id"]}`] };
  res.render("url_show", templateVars);
});

app.post("/urls/:short_url/delete", (req, res) => {
 let urlToDel = req.params.short_url;
  delete urlDatabase[`${urlToDel}`];
  res.redirect("/urls");
});

app.post("/urls/:short_url/edit", (req, res) => {
  let urlToEdit = req.params.short_url;
  urlDatabase[`${urlToEdit}`] = req.body.newURL;
   res.redirect("/urls");
 });

app.post("/urls", (req, res) => {
  let shortURLToAdd = generateURL()
  let longURLToAdd = req.body.longURL; 
  urlDatabase[`${shortURLToAdd}`] = longURLToAdd;
  res.redirect(`/urls/${shortURLToAdd}`);         
});

app.get("/u/:short_url", (req, res) => {
 res.redirect(`${urlDatabase[`${req.params.short_url}`]}`);
});
 
app.post("/login", (req, res) => {
  let usernameInput = req.body.username;
  res.cookie('username', usernameInput);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let id = generateURL();
  let email = req.body.email;
  let password = req.body.password;
  let userObjToPass = { id, email, password }
  users[id] = userObjToPass;
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});