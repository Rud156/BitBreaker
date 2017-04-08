var express = require('express');
var router = express.Router();

var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var Model = require('./model');

function getUser(username) {
    var promise = new Promise(function (resolve, reject) {
        Model.User.findOne({ username: username }, function (err, userObject) {
            if (err)
                reject(err);
            else
                resolve(userObject);
        });
    });
    return promise;
}


router.get('/loginFailure', function (req, res, next) {
    return res.json({ success: false, message: 'Incorrect username or password' });
});


router.post('/register', function (req, res, next) {
    if (res.locals.user) {
        return res.json({ success: false, message: 'User already registered and logged in' });
    }
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var fullName = req.body.fullName;
    if (username === undefined || password === undefined || email === undefined || fullName === undefined ||
        typeof (username) !== 'string' || typeof (password) !== 'string' || typeof (email) !== 'string' || typeof (fullName) !== 'string') {
        return res.json({ success: false, message: 'Incorrect form fields entered' });
    }
    else {
        username = username.toLowerCase();
        getUser(username)
            .then(function (userObject) {
                if (!userObject) {
                    var newUser = Model.User({
                        username: username,
                        password: password,
                        email: email,
                        fullName: fullName,
                        habits: []
                    });
                    Model.createUser(newUser, function (err, savedUser) {
                        if (err)
                            throw err;
                        var userObject = {
                            username: savedUser.username,
                            fullName: savedUser.fullName,
                            email: savedUser.email,
                            habits: savedUser.habits
                        };
                        return res.json({ success: true, message: 'Successfully Registered', user: userObject });
                    });
                }
                else {
                    return res.json({ success: false, message: 'User is already registered' });
                }
            })
            .catch(function (error) {
                res.json({ success: false, message: 'Error Occurred' });
                throw new Error(error);
            });
    }
});


passport.use(new localStrategy(
    function (username, password, done) {
        username = username.toLowerCase();
        getUser(username)
            .then(function (userObject) {
                if (!userObject)
                    return done(null, null);
                Model.comparePassword(password, userObject.password, function (err, isMatch) {
                    if (err)
                        throw err;
                    if (!isMatch)
                        return done(null, null);
                    else
                        return done(null, userObject);
                });
            })
            .catch(function (error) {
                throw new Error(error);
            });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    Model.User.findById(id, function (err, userObj) {
        done(err, userObj);
    });
});


router.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/auth/loginFailure'
    }),
    function (req, res) {
        var userObject = {
            username: req.user.username,
            fullName: req.user.fullName,
            email: req.user.fullName,
            habits: req.user.habits
        };
        return res.json({ success: true, message: 'SuccessFul Login', user: userObject });
    }
);

router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
