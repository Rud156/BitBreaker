var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var userSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    }
});

var habitSchema = mongoose.Schema({
    hash: {
        type: String,
        index: true
    },
    username: {
        type: String,
        index: true
    },
    title: String,
    description: String,
    startDate: Date,
    totalDays: Number,
    ended: Boolean,
    foreverHabit: Boolean,
    dailyStatus: {}
});

module.exports = {
    User: mongoose.model('User', userSchema),
    BitBreaks: mongoose.model('BitBreaks', habitSchema)
};

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        if (err)
            throw err;
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            if (err)
                throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

module.exports.comparePassword = function (password, hash, callback) {
    bcrypt.compare(password, hash, callback);
};