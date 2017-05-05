(function (exports) {

    exports.checkAuthentication = function (req, res, next) {
        if (req.isAuthenticated())
            return next();
        else {
            return res.json({ success: false, message: 'User is not logged in' });
        }
    };

    exports.dateDiff = function (startDate, endDate) {
        var oneDay = 24 * 60 * 60 * 1000;
        var dateDiff = Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));
        return dateDiff;
    };

    exports.dateDiffAbsolute = function (startDate, endDate) {
        var oneDay = 24 * 60 * 60 * 1000;
        var dateDiff = Math.round((endDate.getTime() - startDate.getTime()) / oneDay);
        return dateDiff;
    };

    exports.endingDate = function (startDate, noOfDays) {
        var endDate = new Date(startDate.getTime());
        endDate.setDate(startDate.getDate() + noOfDays);
        return endDate;
    };

    exports.daysLeft = function (startDate, totalDays) {
        var oneDay = 24 * 60 * 60 * 1000;

        var todayDate = new Date();
        todayDate.setUTCHours(0, 0, 0, 0);

        var dateDiff = Math.round(Math.abs((startDate.getTime() - todayDate.getTime()) / oneDay));
        totalDays -= dateDiff;

        return totalDays;
    };

    exports.calculateStreak = function (userHabit) {
        var dailyStatus = userHabit.dailyStatus;
        var currentStreak = 0;
        var maxStreak = 0;
        dailyStatus.forEach(function (value) {
            if (value.success)
                currentStreak++;
            else {
                if (currentStreak > maxStreak)
                    maxStreak = currentStreak;
                currentStreak = 0;
            }
        });
        return maxStreak;
    };

    exports.setHabitDates = function (userHabits) {
        var today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        userHabits.forEach(function (currentHabit) {
            var dailyStatus = currentHabit.dailyStatus;

            var totalDays = currentHabit.totalDays;
            var startDate = currentHabit.startDate;
            var currentDateDifference = exports.dateDiff(startDate, today);
            var i;

            if (totalDays != -1) {
                i = 0;
                while (i <= currentDateDifference && i <= totalDays) {
                    if (!dailyStatus[i]) {
                        dailyStatus[i] = {};
                        dailyStatus[i].success = false;
                        dailyStatus[i].quote = 'Nothing Here';
                    }
                    i++;
                }
            }
            else {
                for (i = 0; i <= currentDateDifference; i++) {
                    if (!dailyStatus[i]) {
                        dailyStatus[i] = {};
                        dailyStatus[i].success = false;
                        dailyStatus[i].quote = 'Nothing Here';
                    }
                }
            }
        });
        return userHabits;
    };

    exports.setHabitDate = function (userHabit) {
        var today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        var dailyStatus = userHabit.dailyStatus;

        var totalDays = userHabit.totalDays;
        var startDate = userHabit.startDate;
        var currentDateDifference = exports.dateDiff(startDate, today);
        var i;

        if (totalDays != -1) {
            i = 0;
            while (i <= currentDateDifference && i <= totalDays) {
                if (!dailyStatus[i]) {
                    dailyStatus[i] = {};
                    dailyStatus[i].success = false;
                    dailyStatus[i].quote = 'Nothing Here';
                }
                i++;
            }
        }
        else {
            for (i = 0; i <= currentDateDifference; i++) {
                if (!dailyStatus[i]) {
                    dailyStatus[i] = {};
                    dailyStatus[i].success = false;
                    dailyStatus[i].quote = 'Nothing Here';
                }
            }
        }
        return userHabit;
    };

    exports.stringToTitleCase = function (inputString) {
        inputString = inputString.toLowerCase().split(' ');
        for (var i = 0; i < inputString.length; i++) {
            inputString[i] = inputString[i].charAt(0).toUpperCase() + inputString[i].slice(1);
        }
        return inputString.join(' ');
    };

})(typeof (exports) === 'undefined' ? this.utilityFunctions = {} : exports);