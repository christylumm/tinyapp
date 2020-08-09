//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// SETUP
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const express = require("express");
const bcrypt = require('bcrypt');
const app = express();

//default port 8080
const PORT = process.env.port || 8080;

//middleware
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");

//import helper functions
const {generateRandomString, addNewUser, findUserByEmail, findUserByID, getUserByID, getUserByEmail, urlsForUser} = require('./helpers.js');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secret-keys']
}));
app.use(methodOverride('_method'));

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// DATABASES
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// HELPER FUNCTIONS
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// //CREATE random string for shortURL
// const generateRandomString = function() {
//   let randomString = '';

//   //Generate string based off these alphanumeric characters
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   const charactersLength = characters.length;
//   for (let i = 0; i < 6; i++) {
//     randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   //Generate a new ID if ID is already used
//   if (findUserByID(randomString)) {
//     generateRandomString();
//   }

//   return randomString;
// };

// //Add new user by generating an ID, creating a new user object, and adding user into to users database
// const addNewUser = (email, password) => {
//   //Generate an ID
//   let userID = generateRandomString();

//   //Create a new user object with generated userID
//   users[userID] = {
//     id: userID,
//     email: email,
//     password: password
//   };

//   //Return userID
//   return userID;
// };


// //Check if user email already exists in the users database
// const findUserByEmail = (email, database) => {
//   for (let id in database) {
//     if (database[id]['email'] === email) {
//       return true;
//     }
//   }
//   return false;
// };

// //Check if user email already exists in the users or urls database
// const findUserByID = (userID) => {
//   if (userID in users) {
//     return true;
//   } else if (userID in urlDatabase) {
//     return true;
//   }
//   return false;
// };

// //Get user object based on user ID
// const getUserByID = (userID) => {
//   return users[userID];
// };

// //Get user object based on email
// const getUserByEmail = (email) => {
//   for (let id in users) {
//     if (users[id]['email'] === email) {
//       return users[id];
//     }
//   }
// };

// //FINDS user by userID and returns a User object
// const urlsForUser = (id) => {
//   const userURLs = {};

//   //Look through users in database to see if it matches the specific user ID
//   for (let shortURL in urlDatabase) {
//     if (urlDatabase[shortURL]['userID'] === id) {
//       userURLs[shortURL] = urlDatabase[shortURL];
//     }
//   }
//   return userURLs;
// };


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// GET REQUESTS
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET a route for /urls and use res.render() to pass the URL data to our template
app.get("/urls/new", (req, res) => {
  //If you're not logged in as a user, redirect them to the login page
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: getUserByID(req.session.userId)
    };
    res.render("urls_new", templateVars);
  }
});

//EDIT PAGE - shows only if they're a user
app.get("/urls/:shortURL", (req, res) => {

  //If they're not logged in, redirect to the Login page
  if (req.session.userId === urlDatabase[req.params.shortURL]['userID']) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]['longURL'],
      user: getUserByID(req.session.userId)
    };
    res.render("urls_show", templateVars);
  } else if (req.session.userId) {
    res.status(403).send('Oops! Please log in for this to work');
  } else {
    let templateVars = {
      user: getUserByID(req.session.userId)
    };
    res.render("login", templateVars);
  }
});


// REDIRECT - when short URL requested, redirect user to long URL site
app.get("/u/:shortURL", (req, res) => {

  if (!req.session.userId) {
    res.status(403).send('Oops! Please log in for this to work');
    res.redirect("login");
  } else {
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(longURL);
  }
});

// LIST OF URLS - shows all the URLs in the database
app.get("/urls", (req, res) => {

  let templateVars = {
    urls: urlsForUser(req.session.userId),
    user: getUserByID(req.session.userId)
  };

  res.render("urls_index", templateVars);
});

// REGISTER - shows register page
app.get("/register", (req, res) => {
  let templateVars = {
    user: getUserByID(req.session.userId)
  };
  res.render("register", templateVars);
});

// LOGIN - shows login page
app.get("/login", (req, res) => {
  let templateVars = {
    user: getUserByID(req.session.userId)
  };

  res.render("login", templateVars);
});

// MAIN PAGE - redirect '/' to list of urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// POST REQUESTS
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// CREATE - creates a new short URL with associated long URL, added to the url Database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  
  //Update the urlDatabase object
  urlDatabase[shortURL] = {
    longURL : [req.body.longURL],
    userID: req.session.userId
  };

  res.redirect(`/urls/${shortURL}`);
});

// DELETE a URL from the database
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");

  if (req.session.userId) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: getUserByID(req.session.userId)
    };
    res.render("login", templateVars);
  }
});

//UPDATE long URL associated with the short URL, after clicking the edit button
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.userId) {
    urlDatabase[req.params.shortURL]['longURL'] = req.body.longURL;
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: getUserByID(req.session.userId)
    };
    res.render("login", templateVars);
  }

});

// POST or catch the submit of the register form
app.post('/register', (req, res) => {
  //Extract the user info form the form
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password, 10);

  //Check that the user filled out both fields
  if (email === '' || password === '') {
    res.status(400).send('Looks like you missed a field! Please fill out all the fields to complete registration');

    //Checks if email exists in the database
  } else if (findUserByEmail(email, users)) {
    res.status(400).send('Looks like this email already exists! Please try another one.');

    //If the user meets the requirements as a new user, generate a hashed password
  } else {
    let userID = addNewUser(email, password);

    //Update the username cookie
    req.session.userId = userID;

    //Redirect users to /urls
    res.redirect("/urls");
  }
  
});


// POST to handle the /login in your Express server
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (email === '' || password === '') {
    res.status(403).send('Looks like you missed a field! Please fill in all the fields');

    //If the user email is not in the database, send an alert that they have the wrong email
  } else if (findUserByEmail(email, users) === false) {
    res.status(403).send("Sorry! It looks like your email isn't in our database. Please try again!");
  
    //Check if bcrypt password matches with password in users database, if true, redirect to urls list
  } else if (bcrypt.compareSync(password, getUserByEmail(email)["password"])) {
    req.session.userId = getUserByEmail(email)["id"];
    res.redirect("/urls");

    //If the password is invalid
  } else {
    res.status(403).send("Oops! Please double check that your email and password are correct, and try again.");
  }
});

// POST to handle /logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// LISTEN
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//Boot up server, and allow us to make HTTP requests to port 8080
app.listen(PORT, () => {
  console.log(`Tiny App is listening on port ${PORT}!`);
});

