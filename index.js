var bodyParser = require("body-parser");
var express = require("express");
var mongoose = require('mongoose');
var bcrypt = require("bcrypt");
var passport = require("passport");
var passportLocal = require("passport-local");
var session = require("express-session")
mongoose.connect('mongodb://Nadkins88:Sonichedge11@ds147681.mlab.com:47681/poolaide');
var model = require('./model.js')
var app = express();
app.set('port', (process.env.PORT || 8000));

// MIDDLEWARE
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// PASSPORT
passport.use(new passportLocal.Strategy({
  usernameField: 'email'
}, function(email, password, done) {
  model.User.findOne({ email: email }, function(err, user) {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    user.validPassword(password, function (valid){
      if (valid) {
        return done(null, user);
      } else{
        return done(null, false, { message: 'Incorrect password.' });
      }
    });
  });
}));

passport.serializeUser(function(id, done){
  model.User.findById(id, function(err, user){
    done(err, user);
  });
});

// ACTION: CREATE USER
app.post("/users", function (req, res){
  //TODO: validation checks firstName
  bcrypt.hash(req.body.password, 10, function(err, hash){
    if (! req.body.password) {
      res.sendStatus(422)
      return
    }
    if (err) {
      res.status(500);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send("Broke");
    }else {
      var user = new model.User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          encryptedPass: hash
      });
      user.save(function (err) {
        if (err) {
          if (err.errors) {
            res.sendStatus(422)
            return
          }
          if (err.code = 11000) {
            res.status(422)
            res.setHeader("Content-Type", "text/plain")
            res.send("Email already Taken")
            return
          }
          res.status(500);
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.send("Broke");
        } else {
            res.status(201);
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.send("");
        };
      });
    }
  });
});

// ACTION: CREATE SESSION
app.post('/session', passport.authenticate('local'), function(req, res){
  res.status(201);
  res.send("");
});

//ACTION: RETRIEVE SESSIION
app.get('/session', function (req,res){
    if (req.user){
    res.json(req.user);
} else{
    res.sendStatus(401);
}
});

//ACTION: GET
app.get("/poolaide", function (req, res) {
  if (! req.user){
    res.sendStatus(401)
    return
  }
  model.poolAide.find({}, function(err, aide) {
    if (err){
      response.send( aide )
    } else{
      res.status(200);
      res.setHeader("Access-Controll-Allow-Origin", "*");
      res.json( aide ).end();
    }
  });
});

app.get("/poolaide/:aideId", function (req, res) {
    if (! req.user){
        res.sendStatus(401)
        return
    }
    var id = req.params.aideId;

    model.poolAide.findOne({"_id": id}, function (err, poolaide){
        if (err){
            res.status(500)
            res.send("")
        }
        console.log("wtf! :", aideId);
        res.json(poolaide);
    })
    console.log(req.params);
});

//ACTION: POST
app.post("/poolaide", function (req, res) {
    if (! req.user){
        res.sendStatus(401)
        return
    }
    var poolAide = new model.poolAide({
        Name: req.body.Name,
        Type: req.body.Type,
        Weakness: req.body.Weakness,
        Region: req.body.Region,
    });
    resource.save(function (err){
        console.log("Your Error is", err)
    if (err) {
        if (err.errors) {
            var messages = {};
            for (var e in err.errors) {
                messages[e] = err.errors[e].message;
            }
            res.status(422);
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.json(messages);
        } else {
            res.status(500);
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.send("Something's Wrong");
        }
    }else {
        res.status(201);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");
        res.send(resource._id);
    }
    });
});

// app.listen(app.get('port'),)

app.listen(app.get("port"), function () {
    console.log("Server running on port 8000");
});
