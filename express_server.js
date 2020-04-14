const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("url_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("url_new");
});

app.get("/urls/:short_url", (req, res) => {
  let templateVars = { shortURL: req.params.short_url, longURL: urlDatabase[`${req.params.short_url}`] };
  res.render("url_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURLToAdd = generateURL()
  let longURLToAdd = req.body.longURL; 
  urlDatabase[`${shortURLToAdd}`] = longURLToAdd;
  res.redirect(`/urls/${shortURLToAdd}`);         
});

app.get('/u/:short_url', (req, res) => {
 res.redirect(`${urlDatabase[`${req.params.short_url}`]}`);
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});