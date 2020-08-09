const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = true;
    // Write your assert statement here
    assert.equal(expectedOutput, user);
  });

  it('should return undefined for a non-existant email', function() {
    const user = !(findUserByEmail("user@example.com", testUsers));
    const expectedOutput = false;
    // Write your assert statement here
    assert.equal(expectedOutput, user);
  });
});