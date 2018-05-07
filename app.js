// Declare variables
const path = require('path');
const moment = require('moment');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const config = require('./config/database');
const passport = require('passport');
// Init app
const app = express();
const port = 6969;

// Connect to mongodb DB
mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', () =>{
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', (err) =>{
  console.log(err);
});

// bring in models
let Article = require('./models/article');
let User = require('./models/user');
let Selling = require('./models/sellings');

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express messages Middleware
app.use(flash());
app.use(function(req, res, next){
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.success_msg = req.flash('success_msg');
  res.locals.user = req.user || null;
  next();
});

// expressValidator Middleware
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;
    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
    return{
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

require('./config/passport')(passport);
  // Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Logged in.
 app.get('*', (req, res, next) =>{
   res.locals.user = req.user || null;
   //req.user = res.locals.user || null;
   next();
 });

// Load view engine
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', (req, res) => {
  Selling.findOne(req.params.id, (err, sellings) =>{
    if(req.user == undefined) {
      res.render('index');
    }else if(req.user != undefined){
      Selling.find({'author' : req.user._id}, (err, sellings) =>{
        if(err){
          console.log(err);
        }else{
          //console.log(sellings);
          res.render('index',{
            sellings:sellings
           });
        }
      });
    } else {
    res.render('index');
  }
});
});
// Route files
let articles = require('./routes/articles');
let users = require('./routes/users');
let exp = require('./routes/exp');
app.use('/articles', articles);
app.use('/users', users);
app.use('/exp', exp);

// Login Process
app.post('/', function(req, res, next){
  //console.log("biggus dickus");
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/register',
    failureFlash: true,
  })(req, res, next);
});

// Start server
const server = app.listen(port, () =>{
  console.log("Starting server..");
  console.log("Opening up port: " + port + "..");
  console.log("The port succesfully opened up on: " + port + "!");
  console.log("Checking for errors../..");
  console.log("No errors found");
  console.log("Server up and running mate.")
});


module.exports = app;
