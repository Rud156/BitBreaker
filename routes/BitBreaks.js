var express = require('express');
var router = express.Router();

var crypto = require('crypto');

var Model = require('./model');
var utilities = require('./../helpers/utilities');

// TODO: Fix timezone bug

router.get('/all', utilities.checkAuthentication, function (req, res, next) {
    Model.BitBreaks.find({ username: res.locals.user.username }, function (err, bitBreaks) {
        if (err)
            throw err;
        return res.json({ success: true, message: 'Found all habits of current user', bitBreaks: bitBreaks });
    });
});

router.get('/one/:hash', utilities.checkAuthentication, function (req, res, next) {
    var hash = req.params.hash;

    var timezoneOffset = req.query.timezone;
    timezoneOffset = parseInt(timezoneOffset);

    if (timezoneOffset === undefined)
        return res.json({ success: false, message: 'Invalid request parameters' });

    Model.BitBreaks.findOne({ hash: hash }, function (err, bitBreakObject) {
        if (err)
            throw err;
        if (!bitBreakObject)
            return res.json({ success: false, message: 'Invalid habit requested' });
        else {
            bitBreakObject = utilities.setHabitDate(bitBreakObject, timezoneOffset);
            var streakObject = utilities.calculateStreak(bitBreakObject);
            return res.json({ success: true, message: 'Habit successfully found', bitBreak: bitBreakObject, streakDetails: streakObject });
        }
    });
});

router.patch('/one/:hash', utilities.checkAuthentication, function (req, res, next) {
    var success = req.body.success;
    var dayQuote = req.body.dayQuote;
    var setDate = req.body.setDate;

    var timezoneOffset = req.query.timezone;
    timezoneOffset = parseInt(timezoneOffset);

    if (timezoneOffset === undefined || success === undefined || dayQuote === undefined || setDate === undefined || typeof (setDate) !== 'number' ||
        typeof (dayQuote) !== 'string' || typeof (success) !== 'boolean') {
        return res.json({ success: false, message: 'Incorrect fields specified for updating' });
    }

    var hash = req.params.hash;

    Model.BitBreaks.findOne({ hash: hash }, function (err, bitBreakObject) {
        if (err)
            throw err;
        if (!bitBreakObject)
            return res.json({ success: false, message: 'Invalid habit requested' });
        else {
            if (bitBreakObject.ended)
                return res.json({ success: false, message: 'You cannot update an ended habit' });


            var dateDiff = setDate;
            if (dateDiff > 0)
                return res.json({ success: false, message: 'You cannot edit a date in the future' });
            else if (dateDiff < -3)
                return res.json({ success: false, message: 'You cannot edit more than 3 days in the past' });
            else if (typeof (dateDiff) !== 'number')
                return res.json({ success: false, message: 'Invalid date diffrence structure' });

            var today = new Date();
            today.setTime(today.getTime() - timezoneOffset * 60 * 1000);
            today.setUTCHours(0, 0, 0, 0);

            today = utilities.endingDate(today, dateDiff);
            dateDiff = utilities.dateDiff(bitBreakObject.startDate, today);

            if (today.getTime() < bitBreakObject.startDate)
                return res.json({ success: false, message: 'Data cannot be editied for time before the starting date' });

            var dailyStatus = bitBreakObject.dailyStatus;
            if (dailyStatus === undefined) {
                bitBreakObject.dailyStatus = [];
            }

            bitBreakObject.dailyStatus[dateDiff] = { success: success, quote: dayQuote };
            bitBreakObject.save(function (err, updatedObject) {
                if (err)
                    throw err;
                if (!updatedObject)
                    return res.json({ success: false, message: 'Invalid habit was specified' });

                dailyStatus = utilities.setHabitDate(updatedObject, timezoneOffset);
                var streakObject = utilities.calculateStreak(updatedObject);

                return res.json({
                    success: true,
                    message: 'Habit successfully updated',
                    updatedStatus: updatedObject.dailyStatus[dateDiff],
                    streakDetails: streakObject
                });
            });
        }
    });
});

router.patch('/endhabit/:hash', utilities.checkAuthentication, function (req, res, next) {
    var hash = req.params.hash;
    Model.BitBreaks.findOne({ hash: hash }, function (err, bitObject) {
        if (err)
            throw err;
        if (!bitObject)
            return res.json({ success: false, message: 'Invalid habit specified' });
        if (res.locals.user.username !== bitObject.username)
            return res.json({ success: false, message: 'You are not the creator of this habit. So you cannot end it...' });

        bitObject.ended = true;
        var date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        bitObject.totalDays = utilities.dateDiff(bitObject.startDate, date);

        bitObject.save(function (err, updatedObject) {
            if (err)
                throw err;
            if (!updatedObject)
                return res.json({ success: false, message: 'Invalid habit was requested' });
            return res.json({ success: true, message: 'Habit successfully updated', bitBreak: updatedObject });
        });
    });
});

router.post('/save', utilities.checkAuthentication, function (req, res, next) {
    var title = req.body.title;
    var description = req.body.description;
    var startDate = req.body.startDate;
    var totalDays = req.body.totalDays;
    var forever = req.body.forever;
    var username = req.body.username;

    var dailyStatus = [];
    var ended = false;

    if (title === undefined || description === undefined || startDate === undefined || totalDays === undefined ||
        forever === undefined || username === undefined || typeof (title) !== 'string' || typeof (description) !== 'string' ||
        typeof (startDate) !== 'string' || typeof (totalDays) !== 'number' || typeof (forever) !== 'boolean' || typeof (username) !== 'string') {
        return res.json({ success: false, message: 'Incorrect form fields entered' });
    }

    try {
        startDate = new Date(startDate);
    }
    catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Invalid date format' });
    }

    username = username.toLowerCase();
    if (username !== res.locals.user.username) {
        return res.json({ success: false, message: 'User is either not logged in or the username is invalid' });
    }

    var hash = crypto.createHash('sha256').update(title + username).digest('hex');

    Model.BitBreaks.findOne({ hash: hash }, function (err, bitBreakObject) {
        if (err)
            throw err;
        if (bitBreakObject)
            return res.json({ success: false, message: 'Same habit has already been created. Please try something else' });
        var newHabit = Model.BitBreaks({
            hash: hash,
            username: username,
            title: title,
            description: description,
            startDate: startDate,
            totalDays: totalDays,
            foreverHabit: forever,
            dailyStatus: dailyStatus,
            ended: ended
        });
        newHabit.save(function (err, newHabitObject) {
            if (err)
                throw err;
            return res.json({ success: true, message: 'Habit successfully saved', bitBreak: newHabitObject });
        });
    });
});

router.delete('/delete/:hash', function (req, res, next) {
    var hash = req.params.hash;
    Model.BitBreaks.findOne({ hash: hash }, function (err, bitBreak) {
        if (err)
            throw err;
        if (!bitBreak) {
            return res.json({ success: false, message: 'Invalid habit specified' });
        }
        if (bitBreak.username !== res.locals.user.username) {
            return res.json({ success: false, message: 'You are not the creator of this habit. So you cannot delete it' });
        }

        Model.BitBreaks.findOneAndRemove({ hash: hash }, function (err, bitBreakObject) {
            if (err)
                throw err;
            return res.json({ success: true, message: 'Habit successfully removed' });
        });
    });
});

module.exports = router;