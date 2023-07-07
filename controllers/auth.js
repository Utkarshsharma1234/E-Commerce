const User = require('../model/user')
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const user = require('../model/user');
const {validationResult} = require('express-validator')

const transporter = nodemailer.createTransport(sendGridTransport({
    auth :{
        api_key : ""
    }
}));
exports.getLogin = (req,res,next) =>{

    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }
    else{
        message = null;
    }
    res.render('auth/login',{
        path : '/login',
        pageTitle : "Login Page",
        isAuthenticated : false,
        errorMessage : message,
        oldInputLogin : {
            email : '',
            password : ''
        }
        
    })
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }
    else{
        message = null;
    }
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      errorMessage : message,
      oldInput : {email : "", password : "", confirmPassword : ""},
      validationErrors : []
    });
};


exports.postLogin = (req,res,next) =>{
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('auth/login',{
            path : '/login',
            pageTitle : 'Login',
            errorMessage : errors.array()[0].msg,
            oldInputLogin : {
                email : email,
                password : password
            }
        })
    }

    User.findOne({email : email})
        .then(user =>{
            if(!user){
                // req.flash('error', 'User not Found!')
                return res.status(422).render('auth/login',{
                    path : '/login',
                    pageTitle : 'Login',
                    errorMessage : 'User not Found!',
                    oldInputLogin : {
                        email : email,
                        password : password
                    }
                })
            }

            bcrypt.compare(password, user.password)      // isme pehli value me hum woh likhte h jisko hume compare krna hota h aur dusri value me woh likhte h jo ki database me user me stored hashed value h password ki.
                .then(doMatch =>{        // if the password matches then we will create a session for the user and will login the user.
                    if(doMatch){
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                       return req.session.save(err=>{
                            console.log(err);
                            res.redirect('/');
                        }) 
                    }
                    
                    else{
                        // req.flash('error', 'Invalid password.')
                        // res.redirect('/login');
                        return res.status(422).render('auth/login',{
                            path : '/login',
                            pageTitle : 'Login',
                            errorMessage : 'Invalid Password',
                            oldInputLogin : {
                                email : email,
                                password : password
                            }
                        })
                    }
                    
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });      
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postSignup = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('auth/signup',{
            path : '/signup',
            pageTitle : 'Sign Up',
            errorMessage : errors.array()[0].msg,
            oldInput : {
                email : email, 
                password : password, 
                confirmPassword : req.body.confirmPassword
            },
            validationErrors : errors.array()
        })
    }
    // User.findOne({      // checking if the user with same email exists or not
    //     email : email          // right side is the email which the user enters and left side is the method value for checking the email.
    // })
    // .then(userDoc =>{ 
    //     if(userDoc){        // if exists then we just simply give an error message and again ask to signup
    //         req.flash('error', 'E-mail already exists. Try with different account.')
    //         return res.redirect('/signup');
    //     }
    // })
         bcrypt.hash(password, 12)    // pehla arguement woh h jo value hum encrypt krna chahte h aur doosra woh h ki hum kitni values tk usko encrypt krna chahte h.
            .then(hashedPassword =>{
                const user = new User({     // if not exists we will create a new user and will save it in the user model.
                    email : email,
                    password : hashedPassword,
                    cart : {items : []}
                });
                return user.save();
            })
            .then(result =>{
                res.redirect('/login');
                return transporter.sendMail({
                    to : email,
                    from : 'shop@node-complete.com',
                    subject : 'SignUp Succeeded!',
                    html : '<h1> Successful signup </h1>'
                })
                
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
}


exports.postLogout = (req,res,next) =>{
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/');
    });
}

exports.getReset = (req,res,next) =>{
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }
    else{
        message = null;
    }
    res.render('auth/reset',{
        path : '/reset',
        pageTitle : 'Reset Password',
        errorMessage : message
    })
}

exports.postReset = (req,res,next) =>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');
        User.findOne({email : req.body.email})
            .then(user =>{
                if(!user){
                    req.flash('error', 'No email found');
                    return res.redirect('/reset');
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result =>{
                req.flash('mailSent', 'A mail is sent to your registered email address.');
                res.redirect('/');
                transporter.sendMail({
                    to : req.body.email,
                    from : 'shop@node-complete.com',
                    subject : 'Reset Password',
                    html : `
                        <p> Password reset requested </p>
                        <p> Click this <a href = "https://localhost:3000/reset/${token}"> Link</a>to reset your password. </p>    
                    `
                })
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    })
}

exports.getNewPassword = (req,res,next) =>{
    const token = req.params.token;
    User.findOne({resetToken : token, resetTokenExpiration : {$gt : Date.now()}})
        .then(user =>{
            if(!user){
               return res.redirect('/login');
            }

            let message = req.flash('error');
            if(message.length > 0){
                message = message[0];
            }
            else{
                message = null;
            }
            res.render('auth/new-password', {
                path : '/new-password',
                pageTitle : 'New Password',
                errorMessage : message,
                userId : user._id.toString(),
                passwordToken  : token
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    
}

exports.postNewPassword = (req,res,next) =>{
    const id = req.body.userId;
    const newPassword = req.body.new_password;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken : passwordToken,
        resetTokenExpiration : {$gt : Date.now()},
        _id : id
        })
        .then(user =>{
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then((hashedPassword) =>{
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result =>{
            res.redirect('/login');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}