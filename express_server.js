// requirements
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const helpers = require("./helpers");
const express = require("express");

// app settings
const app = express();
const PORT = 8080;
app.use(cookieSession({
  name: 'session',
  secret: 'test-secret',
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

/// helper functions
const generateID = helpers.generateID;
const doesEmailExist = helpers.doesEmailExist;
const fetchUserIDFromEmail = helpers.fetchUserIDFromEmail;
const urlsForUserID = helpers.urlsForUserID;
const isIDSame = helpers.isIDSame;

// initial values of database objects
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  }
};

// "/" GET
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls"); 
  } else {
    res.redirect("/login");
  }
})

// "/urls" GET/POST; shows URLs and adds URLs to the database
app.get("/urls", (req, res) => {
  let urlsForUser = urlsForUserID(req.session.user_id, urlDatabase);
  let templateVars = { urls: urlsForUser, userObj: users[`${req.session.user_id}`] };
  res.render("url_index", templateVars);
});
app.post("/urls", (req, res) => {
  let shortURLToAdd = generateID();
  let longURLToAdd = req.body.longURL;
  urlDatabase[`${shortURLToAdd}`] = { longURL: longURLToAdd, userID: req.session.user_id };
  res.redirect(`/urls/${shortURLToAdd}`);
});

// "/urls/new" GET; takes user to the new URL page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = { userObj: users[`${req.session.user_id}`] };
    res.render("url_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// "/urls/:short_url" GET; takes the user to a specific short URL's page
app.get("/urls/:short_url", (req, res) => {
  let templateVars = { shortURL: req.params.short_url, longURL: urlDatabase[`${req.params.short_url}`], userObj: users[`${req.session.user_id}`] };
  res.render("url_show", templateVars);
});

// "/urls/:short_url" POST for ../delete and ../edit routes; deletes or updates the URL
app.post("/urls/:short_url/delete", (req, res) => {
  if (isIDSame(req.session.user_id, urlDatabase)) {
    let urlToDel = req.params.short_url;
    delete urlDatabase[`${urlToDel}`];
    res.redirect("/urls");
  } else {
    res.sendStatus(401);
  }
});
app.post("/urls/:short_url/edit", (req, res) => {
  if (isIDSame(req.session.user_id, urlDatabase)) {
    let urlToEdit = req.params.short_url;
    urlDatabase[`${urlToEdit}`].longURL = req.body.newURL;
    res.redirect("/urls");
  } else {
    res.sendStatus(401);
  }
});

// handles redirecting to the appropriate long URL for a short URL
app.get("/u/:short_url", (req, res) => {
  res.redirect(`${urlDatabase[`${req.params.short_url}`].longURL}`);
});

// "/login" GET/POST; handles signing in a user
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  let emailInput = req.body.email;
  let passwordInput = req.body.password;
  if (doesEmailExist(emailInput, users)) {
    let id = fetchUserIDFromEmail(emailInput, users);
    if (bcrypt.compareSync(passwordInput, users[`${id}`].password)) {
      req.session.user_id = id;
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
  res.redirect("/urls");
});

// "/logout" POST; clears cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// "/register" GET/POST; handles registration of a new user
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  let id = generateID();
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  if ((email !== "") && (password !== "") && !(doesEmailExist(email, users))) {
    let userObjToPass = { id, email, password: hashedPassword };
    users[id] = userObjToPass;
    req.session.user_id = id;
    res.redirect("/urls");
  } else {
    res.sendStatus(400);
  }
});

// runs the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});