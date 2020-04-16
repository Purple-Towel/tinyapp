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
};

const doesEmailExist = function(emailInput) {
  for (let user in users) {
    if (users[user].email === emailInput) {
      return true;
    }
  }
  return false;
};

const fetchUserIDFromEmail = function(emailInput) {
  for (let user in users) {
    if (users[user].email === emailInput) {
      return users[user].id;
    }
  }
  return null;
};

const urlsForUserID = function(userIDInput) {
  let outputURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === userIDInput) {
      outputURLs[url] = urlDatabase[url];
    }
  }
  return outputURLs;
};

const isIDSame = function(userIDInput) {
  for (let url in urlDatabase) {
   if (urlDatabase[url].userID === userIDInput) {
      return true;
    }
  }
  return false;
}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
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
  let urlsForUser = urlsForUserID(req.cookies["user_id"]);
  let templateVars = { urls: urlsForUser, userObj: users[`${req.cookies["user_id"]}`] };
  res.render("url_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = { userObj: users[`${req.cookies["user_id"]}`] };
    res.render("url_new", templateVars);
  } else {
    res.redirect("/urls")
  }
});

app.get("/urls/:short_url", (req, res) => {
  let templateVars = { shortURL: req.params.short_url, longURL: urlDatabase[`${req.params.short_url}`], userObj: users[`${req.cookies["user_id"]}`] };
  res.render("url_show", templateVars);
});

app.post("/urls/:short_url/delete", (req, res) => {
  if (isIDSame(req.cookies["user_id"])) {
 let urlToDel = req.params.short_url;
  delete urlDatabase[`${urlToDel}`];
  res.redirect("/urls");
  } else {
  res.sendStatus(401);
}
});

app.post("/urls/:short_url/edit", (req, res) => {
  if (isIDSame(req.cookies["user_id"])) {
  let urlToEdit = req.params.short_url;
  urlDatabase[`${urlToEdit}`].longURL = req.body.newURL;
   res.redirect("/urls");
  } else {
    res.sendStatus(401);
  }
 });

app.post("/urls", (req, res) => {
  let shortURLToAdd = generateURL()
  let longURLToAdd = req.body.longURL; 
  urlDatabase[`${shortURLToAdd}`] = { longURL: longURLToAdd, userID: req.cookies["user_id"] };
  res.redirect(`/urls/${shortURLToAdd}`);         
});

app.get("/u/:short_url", (req, res) => {
 res.redirect(`${urlDatabase[`${req.params.short_url}`].longURL}`);
});

app.get("/login", (req, res) => {
  res.render("login");
})
 
app.post("/login", (req, res) => {
  let emailInput = req.body.email;
  let passwordInput = req.body.password;
  if (doesEmailExist(emailInput)) {
    let id = fetchUserIDFromEmail(emailInput);
    if (users[`${id}`].password === passwordInput) {
      res.cookie("user_id", id);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let id = generateURL();
  let email = req.body.email;
  let password = req.body.password;
  if ((email !== "") && (password !== "") && !(doesEmailExist(email))) {
  let userObjToPass = { id, email, password }
  users[id] = userObjToPass;
  res.cookie("user_id", id);
  res.redirect("/urls");
  } else {
    res.sendStatus(400);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});