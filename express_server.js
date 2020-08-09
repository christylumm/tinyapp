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
const salt = bcrypt.genSalt(8);

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
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// HELPER FUNCTIONS 
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//CREATE random string for shortURL
const generateRandomString = function() {
  let randomString = '';

  //Generate string based off these alphanumeric characters
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  //Generate a new ID if ID is already used
  if (checkID(randomString)) {
    generateRandomString();
  }

  return randomString;
};

//Checks if an ID is already in the users and url databases
const checkID = (userID) => {
  if (userID in users) {
    return true;
  } else if (userID in urlDatabase) {
    return true;
  } 
  return false;
} 

//Add new user by generating an ID, creating a new user object, and adding user into to users database
const addNewUser = (email, password) => {
  //Generate an ID
  let userID = generateRandomString();

  //Create a new user object with generated userID
  users[userID] = {
    id: userID,
    email: email,
    password: password
  };

  //Return userID
  return userID;
};


//Check if user email already exists in the users database
const findUserByEmail = (email) => {
  for (let id in users) {
    if (users[id]['email'] === email) {
      return true;
    }
  }
  return false;
}

//Check if user email already exists in the users or urls database
const findUserByID = (userID) => {
  if (userID in users) {
    return true;
  } else if (userID in urlDatabase) {
    return true;
  }
  return false;
}

//Get user object based on user ID
const getUserByID = (userID) => {
  return users[userID];
}

//Get user object based on email
const getUserByEmail = (email) => {
  for (let id in users) {
    if (users[id]['email'] === email) {
      return users[id];
    }
  }
}

//FINDS user by userID and returns a User object
const urlsForUser = (id) => {
  const userURLs = {}

  //Look through users in database to see if it matches the specific user ID
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL]['userID'] === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    };
  }
  return userURLs;
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// GET REQUESTS 
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET the original longURL destination, redirect when user clicks on shortURL
// app.get("/u/:shortURL", (req, res) => {
//   const longURL = urlDatabase[req.params.shortURL].longURL;
//   res.redirect(longURL);
// });

//GET a route for /urls and use res.render() to pass the URL data to our template
app.get("/urls/new", (req, res) => {
  //If you're not logged in as a user, redirect them to the login page
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: getUserByID(req.session.user_id)
    };
    res.render("urls_new", templateVars);
  }
  
  // const templateVars = {
  //   user: users[req.cookies["user_id"]]
  // };

  // if (users[req.cookies["user_id"]]) {
  //   res.render("urls_new", templateVars);
  // } else {
  //   res.render("login", templateVars);
  // }
});

//EDIT PAGE - shows only if they're a user
app.get("/urls/:shortURL", (req, res) => {

  //If they're not logged in, redirect to the Login page
  if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]['longURL'],
      user: getUserByID(req.session.user_id)
    }
    res.render("urls_show", templateVars);
  } else if (req.session.user_id) {
    res.status(403).send('Oops! Please log in for this to work');
  } else {
    let templateVars = {
      user: getUserByID(req.session.user_id)
    }
    res.render("login", templateVars);
  }
});


// REDIRECT - when short URL requested, redirect user to long URL site
app.get("/u/:shortURL", (req, res) => {

  if (!req.session.user_id) {
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
    urls: urlsForUser(req.session.user_id),
    user: getUserByID(req.session.user_id)
  }

  res.render("urls_index", templateVars);

  // let templateVars = {
  //   urls: urlDatabase,
  //   user: users[req.cookies["user_id"]]
  // };

  // console.log(req.cookies["user_id"]);
  // res.render("urls_index", templateVars);
});

// REGISTER - shows register page
app.get("/register", (req, res) => {
  let templateVars = {
    user: getUserByID(req.session.user_id)
  };
  res.render("register", templateVars);
});

// LOGIN - shows login page
app.get("/login", (req, res) => {
  let templateVars = {
    user: getUserByID(req.session.user_id)
  }

  res.render("login", templateVars);
/* 
  if (req.session.name) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      name: req.session.name
    };
    res.render("login", templateVars)
  } */

/*   const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("login", templateVars); */
});

// MAIN PAGE - redirect '/' to list of urls
app.get("/", (req, res) => {
  res.redirect("/urls");
})

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// POST REQUESTS
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// CREATE - creates a new short URL with associated long URL, added to the url Database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  
  //Update the urlDatabase object
  urlDatabase[shortURL] = {
    longURL : [req.body.longURL],
    userID: req.session.user_id
  }

  res.redirect(`/urls/${shortURL}`);
});


// DELETE a URL from the database
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");

  if (req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: getUserByID(req.session.user_id)
    }
    res.render("login", templateVars);
  }
});

//UPDATE long URL associated with the short URL
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    urlDatabase[req.params.shortURL]['longURL'] = req.body.longURL;
  } else {
    let templateVars = {
      user: getUserByID(req.session.user_id)
    }
    res.render("login", templateVars);
  }

/*   if (req.session.name) {
    res.redirect('/login');
    res.status(403).send("Looks like you're not logged in! Please log in to edit this URL");
  } else if (urlDatabase[req.params.shortURL]['userID'] !== req.session.name) {
    res.status(403).send("This URL was submitted by someone else, and therefore you cannot edit it");
  } else {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;

    res.redirect("/urls");
  } */

    // const urlID = req.params.shortURL;
  // const longURL = urlDatabase[req.params.shortURL].longURL;
  
  // updateURL(urlID, longURL);
  
  // res.redirect(`/urls/${urlID}`);

  //If the user isn't logged in, redirect them to the login page

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
  } else if (findUserByEmail(email)) {
    res.status(400).send('Looks like this email already exists! Please try another one.');

    //If the user meets the requirements as a new user, generate a hashed password
  } else {
    let userID = addNewUser(email, password);

    //Update the username cookie
    req.session.user_id = userID;

    //Redirect users to /urls
    res.redirect("/urls");
  }
  
  // if (email === '' || password === '') {
    
  // } else {
  //   if (findUserByEmail(email) !== '') {
  //     res.status(400).send('Email already exists in the database');
  //   } else {
  //     //Add user to database
  //     const userID = generateRandomString();
  //     const hash = bcrypt.hashSync(password, salt);

  //     users[userID] = {
  //       id: userID,
  //       email: email,
  //       password: hash
  //     };

  //     //Set the user ID in a cookie
  //     res.cookie('user_id', userID);

  //     //Redirect to /urls index
  //     res.redirect("/urls");
  //   }
  // }
  
});


// POST to handle the /login in your Express server
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (email === '' || password === '') {
    res.status(403).send('Looks like you missed a field! Please fill in all the fields');

    //If the user email is not in the database, send an alert that they have the wrong email
  } else if (findUserByEmail(email) === false) {
    res.status(403).send("Sorry! It looks like your email isn't in our database. Please try again!");
  
    //Check if bcrypt password matches with password in users database, if true, redirect to urls list
  } else if (bcrypt.compareSync(password, getUserByEmail(email)["password"])) {
    req.session.user_id = getUserByEmail(email)["id"];
    res.redirect("/urls");

    //If the password is invalid
  } else {
    res.status(403).send("Oops! Please double check that your email and password are correct, and try again.")
  }

  // if (email === '' || password === '') {
  //   res.status(403).send('Looks like you missed a field! Please fill in all the fields');
  // } else {
  //   if (findUserByEmail(email) !== '') {
  //     if (findUserByPassword(password)) {
  //       let person = findUserByEmail(email);
  //       // req.cookies["user_id"] = person['id'];
  //       res.cookie('user_id', person['id']);
  //       //console.log(person['id']);
  //       res.redirect("/urls");
  //     } else {
  //       if (!bcrypt.compareSync(password, users[findUserByEmail(email).password])) {
  //         res.status(403).send("Password doesn't match")
  //       }
  //     } else {
  //       res.direct("/urls");
  //     }
  //   }
  // }
});

// POST to handle /logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
  // res.clearCookie("user_id");
  // res.redirect("/urls");
})

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// LISTEN 
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//Boot up server, and allow us to make HTTP requests to port 8080
app.listen(PORT, () => {
  console.log(`Tiny App is listening on port ${PORT}!`);
});

