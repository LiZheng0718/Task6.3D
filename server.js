const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const User = require('./models/User')
const passport = require('passport') ,LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const session = require('express-session')
const flash = require('connect-flash');
var problem = 0;
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(session({
    secret : '$$$SIT313Secret',
    resave: false,
    saveUninitialized: false, 
    cookie: {maxAge: 120000 }
  }))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
mongoose.connect("mongodb://localhost/iCrowdTaskDB4", { useNewUrlParser: true,useUnifiedTopology: true});
passport.use('local', new LocalStrategy({
    usernameField:"email",
    passReqToCallback:true},
    function (req,username, password, done) {
        User.findOne({email:username},function(error,user){
        if(error){ 
            return next(error);
        }else if (!user) {
            return done(null, false, (req.flash('error', 'Incorrect username.')));
        }else {
            bcrypt.compare(password , user.password, function(err, isMatch) 
            {
            if (err|| !isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }else{
                return done(null, user);
            }
        })
    }
})}
))
//passport.serializeUser(User.serializeUser())
//passport.deserializeUser(User.deserializeUser())
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
app.get('/reqsignup',(req,res)=>{
    res.sendFile(__dirname + "/reqsignup.html")
 })
app.get('/reqtask' , (req,res)=>{
    if (req.isAuthenticated()){
        res.sendFile(__dirname + "/reqtask.html")
    }else{
        res.sendFile(__dirname + '/reqsignup.html')
    }
})
app.get('/register',(req,res)=>{
    res.sendFile(__dirname + "/register.html")
})
app.post('/reqsignup',passport.authenticate('local', {
    successRedirect: '/reqtask',
    failureRedirect: '/reqsignup',
       // req.flash(message)
    failureFlash: true,
      // failureFlash: 'Please check you input.' 
    }));

app.post('/register' , (req,res)=>{
        var user=new User(
            {
                country:req.body.country,
                firstname:req.body.lastname,
                lastname:req.body.email,
                email:req.body.email,
                password:req.body.password,
                address:req.body.address, 
                city:req.body.city,
                state:req.body.state,
                zip:req.body.zip,
                mobile:req.body.mobile
            }
        )
        user.save(function (error) {
        if (error){
            res.send(error)
        }else if(problem == 1){
            res.send("all inputs except Zip/Postal code and phone number are given!");
        }else if(req.body.password != req.body.confirmpassword){
            res.send("Confirm password need to be the same as password!");      
        }else if(problem == 3){
            res.send("The password must be at least 8 characters!");            
        }else if(problem == 4 || problem == 5){
            res.send("The email address and mobile phone number must be valid!");
        }else{
            res.send("Register successfully!");
        }
    });
})
app.post('/relogin' , (req,res)=>{
    res.redirect("reqsignup")
})
app.post('/reregister' , (req,res)=>{
    res.redirect("register")
})
app.post('/forgetpassword' , (req,res)=>{
    res.redirect("forgetpassword")
})
app/post('/save' , (req,res)=>{

})
let port = process.env.PORT;
 if (port == null || port == "") {
   port = 8000;
 }

app.listen(8000, (req,res)=>{
    console.log("Server is running successfullly!")
})