const express = require('express');
const auth = require('../routes/auth');
const user = require('../routes/user');
const interest = require('../routes/interest');

module.exports = function(app){
    app.use(express.json());
    app.use("/auth", auth);
    app.use("/user", user);
    app.use("/interest", interest);
}