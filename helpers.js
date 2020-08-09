//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// HELPER FUNCTIONS
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const urlDatabase = {};

const users = {};


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
  if (findUserByID(randomString)) {
    generateRandomString();
  }

  return randomString;
};

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
const findUserByEmail = (email, database) => {
  for (let id in database) {
    if (database[id]['email'] === email) {
      return true;
    }
  }
  return false;
};

//Check if user email already exists in the users or urls database
const findUserByID = (userID) => {
  if (userID in users) {
    return true;
  } else if (userID in urlDatabase) {
    return true;
  }
  return false;
};

//Get user object based on user ID
const getUserByID = (userID) => {
  return users[userID];
};

//Get user object based on email
const getUserByEmail = (email) => {
  for (let id in users) {
    if (users[id]['email'] === email) {
      return users[id];
    }
  }
};

//FINDS user by userID and returns a User object
const urlsForUser = (id) => {
  const userURLs = {};

  //Look through users in database to see if it matches the specific user ID
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL]['userID'] === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

module.exports = {
  generateRandomString,
  addNewUser,
  findUserByEmail,
  getUserByID,
  getUserByEmail,
  urlsForUser
};
