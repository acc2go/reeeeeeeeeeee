const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
var flash = require('connect-flash');

// bring in user model
// bring in models
let User = require('../models/user');

// Register form
router.get('/register', (req, res) =>{
  res.render('register');
});

// Register process
router.post('/register', (req, res) =>{
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  //check for empty fields
  let errors = req.validationErrors();
  if(errors){
    req.flash('error_msg', 'Make sure everything is filled in');
    res.redirect('/users/register');
  }

  //if not registered function
  function f_register(){
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password
    });
    bcrypt.genSalt(10,(err, salt) =>{
      bcrypt.hash(newUser.password, salt, (err, hash) =>{
        if(err){
          return;
        }
        newUser.password = hash;
        newUser.save((err)=>{
          if(err){
            console.log(err);
            return;
          } else {
            req.flash('success_msg', 'You are now registered and can log in');
            res.redirect('/');
          }
        });
      });
    });
  }
  //check for username
  User.findOne({'username': username}, (err, user)=>{
    if(err){
      console.log(err);
    }
    if(user != null){
      if(user.username == username){
        req.flash('error_msg', 'this username already exists');
        res.redirect('/users/register');
      }
    }else{
      f_register;
    }
    //Check for email
    User.findOne({'email': email}, (err, user)=>{
      if(err){
        console.log(err);
      }
      if(user != null){
        if(user.email == email){
          req.flash('error_msg', 'this email is already registered');
          res.redirect('/users/register');
        }
      }else{
        f_register;
      }
    });
  });
});

router.use(flash());
router.use(passport.initialize());
router.use(passport.session());


// Logout
router.get('/logout', (req, res)=>{
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

module.exports = router;
