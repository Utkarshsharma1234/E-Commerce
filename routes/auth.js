const express = require('express');

const authController = require('../controllers/auth');
const {check, body} = require('express-validator');
const User = require('../model/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',
            [check('email')
            .isEmail()
            .withMessage('Please enter a valid email address.')
            .normalizeEmail(),
            
            body('password', 'Please enter a valid Password. It must be minimum 7 characters including alphanumeric characters.')
                .isLength({min : 7})
                .isAlphanumeric()
                .trim()],
            authController.postLogin);

router.post('/signup',
            [check('email')
            .isEmail()
            .withMessage('Please enter a valid email address.')
            .custom((value,{req})=>{
                return User.findOne({email : value})
                    .then(userDoc =>{
                        if(userDoc) {
                            return Promise.reject(
                                'E-mail already exists. Try with some other account.'
                                )
                        }
                    })
                    
            })
            .normalizeEmail(),
            body('password', 'Please enter a valid password with only characters and numbers and atleast 7 characters.')
            .isLength({min : 7})
            .isAlphanumeric()
            .trim(),
            
            body('confirmPassword')
            .trim()
            .custom((value, {req})=>{
                if(value !== req.body.password){
                    throw new Error("Passwords doesn't match");
                }

                return true;
            })
        ]
            ,authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);


module.exports = router;