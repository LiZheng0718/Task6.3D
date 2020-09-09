const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const passport = require('passport') ,LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const session = require('express-session')
const flash = require('connect-flash');
const passportLocalMongoose = require ('passport-local-mongoose')
const validator = require("validator");
const SALT_WORK_FACTOR = 5;
var problem = 0;
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(session({
    secret : '$$$SIT313Secret',
    resave: false,
    saveUninitialized: false, 
    cookie: {maxAge: 10000}
  }))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
mongoose.connect("mongodb://localhost/Test1", { useNewUrlParser: true,useUnifiedTopology: true});
const userSchema = new mongoose.Schema({
    country:{ 
        type:String, 
      //  required: true,
        validate(value){
            if(validator.isEmpty(value)){
                problem = 1
                throw new Error('Please input mobile!')
            }
        }
    },
    firstname: {
        type: String,
     //   required:  true ,
        validate(value){
            if(validator.isEmpty(value)){
                problem = 1
                throw new Error('Please input first name!')
            }
        }
    },
    lastname:{ 
        type:String, 
      //  required: true,
        validate(value){
            if(validator.isEmpty(value)){
                problem = 1
                throw new Error('Please input last name!')
            }
        }
    },
    email:{ 
        type:String, 
     //   required: true,
        trim: true,
        lowercase:true,
        validate(value){
             if(validator.isEmpty(value)){
                 problem = 1
                 throw new Error('Please input email!')
             }
            if(!validator.isEmail(value)){
                problem = 4
                throw new Error('Email is not valid!')
            }
        }
    },
    password: {
        type: String,
     //   required: true,
        validate(value){
           if(validator.isEmpty(value)){
               problem = 1
               throw new Error('Please input password!');
           }
             if(!validator.isLength(value,{min:8, max: 20})){
                problem = 3
                throw new Error('password should be at least 8 characters!')
            }
        }
    },
    address:{
        type: String,
       // required: true,
        validate(value){
            if(validator.isEmpty(value)){
                problem = 1
                throw new Error('Please input address!')
            }
        }
    },
    city:{
        type: String,
     //   required: true,
        validate(value){
            if(validator.isEmpty(value)){
                problem = 1
                throw new Error('Please input city!')
            }
        }
    },
    state:{
        type: String,
    //    required: true,
        validate(value){
            if(validator.isEmpty(value)){
                problem = 1
                throw new Error('Please input state!')
            }
        }
    },
    zip:{
        type: String
    },
    mobile:{
        type: String,
        validate(value){
            if((!validator.isEmpty(value))&&(!validator.isMobilePhone(value,))){
                problem = 5
                throw new Error('Phone number is not valid!')
            }
        }
    },
})

userSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});


userSchema.plugin(passportLocalMongoose);

const User  =  mongoose.model("User", userSchema)

passport.use('local', new LocalStrategy({
    usernameField:"email",
    passReqToCallback:true},
    function (req,username, password, done) {
        User.findOne({email:username},function(error,user){       
            return done(null, user);           
       })
   }
))
passport.serializeUser(function (user, done) {
    User.findById(user.id,function(err,user){
        console.log("1"+ user.email)
    done(null, user.id)
})});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        console.log("2"+ user.zip)
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
app.post('/reqsignup', (req,res)=>{
    User.findOne({email:req.body.email},function(error,user){
        if(error){ 
            return next(error);
        }else if (!user) {
            res.send('The email has not created account');
        }else {
            bcrypt.compare(req.body.password , user.password, function(err, isMatch) 
            {
            if (err|| !isMatch) {
                res.send('Wrong Password');
            }else{
                if(user.email == "1379380046@qq.com"){
                    console.log("No save")
                    res.sendFile(__dirname + '/reqtask.html')
                }else
              passport.authenticate('local')(req, res , () => {res.redirect('/reqtask')})
            }
        })
    }
})})
// passport.authenticate('local', {
//     successRedirect: '/reqtask',
//     failureRedirect: '/reqsignup',
//        // req.flash(message)
//     failureFlash: true,
//       // failureFlash: 'Please check you input.' 
//     })
//  //   }
// )

//     ;

app.post('/register' , (req,res)=>{
        var user=new User(
            {
                country:req.body.country,
                firstname:req.body.firstname,
                lastname:req.body.lastname,
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
            
         if(error){
        if(problem == 1){
            res.send("all inputs except Zip/Postal code and phone number are given!");
        }else if(req.body.password != req.body.confirmpassword){
            res.send("Confirm password need to be the same as password!");      
        }else if(problem == 3){
            res.send("The password must be at least 8 characters!");            
        }else if(problem == 4 || problem == 5){
            res.send("The email address and mobile phone number must be valid!");
        }
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
let port = process.env.PORT;
 if (port == null || port == "") {
   port = 8000;
 }

app.listen(port, (req,res)=>{
    console.log("Server is running successfullly!")
})