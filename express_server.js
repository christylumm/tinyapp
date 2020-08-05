const express = require("express");
const app = express();
const PORT = 8080; //default port 8080

const bodyParser = require("body-parser");
const { response } = require("express");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//Create a new short URL
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();

  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`);
});

//Delete a URL from the database
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

//Function that updates a URL
const updateURL = (id, content) => {
  urlDatabase[id] = content;
}

//POST to update the url in the Database
app.post("/urls/:id", (req, res) => {
  const urlID = req.params.id;
  const longURL = req.body.longURL;
  
  updateURL(urlID, longURL);
  
  res.redirect(`/urls/${urlID}`);
});

/* //Edit a resource
app.post("/urls/:id", (req, res) => {
  res.render("urls_show");
  res.redirect("urls_show");
}) */

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Using the shortURL, redirect to the original longURL destination
app.get("/u/:shortURL", (req, res) => {
  //console.log(req.params.shortURL);
  const longURL = urlDatabase[req.params.shortURL];
  //console.log(longURL);
  res.redirect(longURL);
});

//Add a route for /urls and use res.render() to pass the URL data to our template
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Add shortURL and longURL values to the list of URLs on the myURLs page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result = '';

  //generate string based off these alphanumeric characters
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};