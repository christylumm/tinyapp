// SETUP -----------------------------------------
const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const { response } = require("express");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


// DATABASES ------------------------------------

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

  // b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  // i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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

// HELPER FUNCTIONS ----------------------------------

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

//ADD new user by generating an ID and creating a new user object
const addNewUser = (email, password) => {
  //Generate an ID
  const userID = generateRandomString();

  //Create a new user object with generated userID
  const newUser = {
    id: userID,
    email: email,
    password: password
  };

  //Add new user object to users database
  users[userID] = newUser;

  //Return userID
  return userID;
};

//FIND user based on email in the database
const findUserByEmail = (email) => {
  let person = '';
  for (let userID in users) {
    if (users[userID]['email'] === email) {
      //return the full user object
      person = users[userID];
    }
    //console.log(users[userID]);
  }

  return person;
}

const findUserByPassword = (password) => {
  let match = false;
  for (let userID in users) {
    if (users[userID]['password'] === password) {
      match = true;
    }
  }
  return match;
}

//FINDS user by userID and returns a User object

// GET ----------------------------------------------

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
    user: users[req.cookies["user_id"]]
  };
  //res.render("urls_new", templateVars);

  if (users[req.cookies["user_id"]]) {
    res.render("urls_new", templateVars);
  } else {
    res.render("login", templateVars);
  }
});

//GET to return the registration page template
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("register", templateVars);
  

});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("login", templateVars);
})

//GET urls_index based on urlDatabase
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };

  //console.log(req.cookies["user_id"]);
  res.render("urls_index", templateVars);
});

//GET shortURL and longURL values on the list of URLs on the myURLs page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  
  res.render("urls_show", templateVars);
});


// POST --------------------------------------------

//POST to handle the /login in your Express server
app.post("/login", (req, res) => {
  //console.log(users);
  //const user = users[req.cookies["user_id"]]
  //console.log(req.cookies["user_id"]);
  //console.log('inside login post!');
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    res.status(403).send('Email cannot be found');
  } else {
    if (findUserByEmail(email) !== '') {
      if (findUserByPassword(password)) {
        let person = findUserByEmail(email);
        // req.cookies["user_id"] = person['id'];
        res.cookie('user_id', person['id']);
        console.log(person['id']);
        res.redirect("/urls");
      } else {
        res.status(403).send("Password doesn't match")
      }
    }
  }
});

//POST to handle /logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

//POST or catch the submit of the register form
app.post('/register', (req, res) => {
  //Extract the user info form the form
  const email = req.body.email;
  const password = req.body.password;
  
  if (email === '' || password === '') {
    res.status(400).send('Email or password is left empty');
  } else {
    if (findUserByEmail(email) !== '') {
      res.status(400).send('Email already exists in the database');
    } else {
      //Add user to database
      const userID = addNewUser(email, password);

      //Set the user ID in a cookie
      res.cookie('user_id', userID);

      //Redirect to /urs index
      res.redirect("/urls");
    }
  }
  
});

//CREATE a new short URL
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();

  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`);
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


// LISTEN ------------------------------------------

//Allows us to make HTTP requests to port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

