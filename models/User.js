const mongoose = require("mongoose")
const passportLocalMongoose = require ('passport-local-mongoose')
const validator = require("validator");
const SALT_WORK_FACTOR = 5;
const bcrypt = require('bcrypt');
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

module.exports  =  mongoose.model("User", userSchema)