const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
//const cookieSession = require('cookie-session');

const { response } = require("express");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
/* app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
})); */

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//CREATE a new short URL
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();

  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`);
  //console.log(urlDatabase);
});

//DELETE a URL from the database
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

//UPDATE a URL, helper function
const updateURL = (id, content) => {
  urlDatabase[id] = content;
};

//POST to UPDATE the url in the Database
app.post("/urls/:id", (req, res) => {
  const urlID = req.params.id;
  const longURL = req.body.longURL;
  
  updateURL(urlID, longURL);
  
  res.redirect(`/urls/${urlID}`);
});

/* //GET login information
app.get("/login", (req, res) => {
  let templateVars = {
    username: req.session.username
  };
  res.render("urls_index", templateVars);
}); */

//POST to handle the /login in your Express server
app.post("/login", (req, res) => {
  const username = req.body.username;
  
/*   let templateVars = {
    username: req.cookies["username"]
  }; */
  
  if (username) {
    res.cookie('username', username);
    res.redirect('/urls');
  }

  //res.render("urls_index", templateVars);
});

//POST to handle /logout
app.post("/logout", (req, res) => {
  //console.log(req.body);
  res.clearCookie("username");
  res.redirect("/urls");
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET the original longURL destination, redirect when user clicks on shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Add a route for /urls and use res.render() to pass the URL data to our template
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

//Add shortURL and longURL values to the list of URLs on the myURLs page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() {
  let result = '';

  //generate string based off these alphanumeric characters
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};