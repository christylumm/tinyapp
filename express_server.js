// SETUP ------------------_-----------------
const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const { response } = require("express");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// USER DATABASE ------------------------------

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

// HELPER FUNCTIONS ----------------------------

//UPDATE a URL, helper function
const updateURL = (id, content) => {
  urlDatabase[id] = content;
};

//CREATE random string for shortURL
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


// GET ---------------------------------------

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET the original longURL destination, redirect when user clicks on shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//GET a route for /urls and use res.render() to pass the URL data to our template
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

//GET to return the registration page template
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  }
  res.render("register", templateVars);
});

//GET urls_index based on urlDatabase
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

//GET shortURL and longURL values on the list of URLs on the myURLs page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

// POST ---------------------------------------

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

//POST to UPDATE the url in the Database
app.post("/urls/:id", (req, res) => {
  const urlID = req.params.id;
  const longURL = req.body.longURL;
  
  updateURL(urlID, longURL);
  
  res.redirect(`/urls/${urlID}`);
});

//POST to handle the /login in your Express server
app.post("/login", (req, res) => {
  const username = req.body.username;
  
  if (username) {
    res.cookie('username', username);
    res.redirect('/urls');
  }
});

//POST to handle /logout
app.post("/logout", (req, res) => {
  //console.log(req.body);
  res.clearCookie("username");
  res.redirect("/urls");
})

//POST or catch the submit of the register form
app.post('/register', (req, res) => {
  //Extract the user info form the form
  const email = req.body.email;
  const password = req.body.password;
});


// LISTEN ---------------------------------------

//Allows us to make HTTP requests to port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

