function checkAuthentication(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else {
        return res.json({ success: false, message: 'User is not logged in' });
    }
}

function dateDiff(startDate, endDate) {
    var oneDay = 24 * 60 * 60 * 1000;
    var dateDiff = Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));
    return dateDiff;
}

function setHabitDates(userHabits) {
    var today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    userHabits.forEach(function (currentHabit) {
        var dailyStatus = currentHabit.dailyStatus;

        var totalDays = currentHabit.totalDays;
        var startDate = currentHabit.startDate;
        var currentDateDiffrence = dateDiff(startDate, today);
        var i;

        if (totalDays != -1) {
            for (i = 0; i <= currentDateDiffrence, i <= totalDays; i++) {
                if (!dailyStatus[i]) {
                    dailyStatus[i] = {};
                    dailyStatus[i].success = false;
                    dailyStatus[i].quote = "You didn't put anything today";
                }
            }
        }
        else {
            for (i = 0; i <= currentDateDiffrence; i++) {
                if (!dailyStatus[i]) {
                    dailyStatus[i] = {};
                    dailyStatus[i].success = false;
                    dailyStatus[i].quote = "You didn't put anything today";
                }
            }
        }
    });
    return userHabits;
}

function setHabitDate(userHabit) {
    var today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    var dailyStatus = userHabit.dailyStatus;

    var totalDays = userHabit.totalDays;
    var startDate = userHabit.startDate;
    var currentDateDiffrence = dateDiff(startDate, today);
    var i;

    if (totalDays != -1) {
        for (i = 0; i <= currentDateDiffrence, i <= totalDays; i++) {
            if (!dailyStatus[i]) {
                dailyStatus[i] = {};
                dailyStatus[i].success = false;
                dailyStatus[i].quote = "You didn't put anything today";
            }
        }
    }
    else {
        for (i = 0; i <= currentDateDiffrence; i++) {
            if (!dailyStatus[i]) {
                dailyStatus[i] = {};
                dailyStatus[i].success = false;
                dailyStatus[i].quote = "You didn't put anything today";
            }
        }
    }
}


module.exports = {
    checkAuthentication: checkAuthentication,
    setHabitDates: setHabitDates,
    setHabitDate: setHabitDate
};