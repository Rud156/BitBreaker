(function (exports) {

    exports.dateDiff = function (startDate, endDate) {
        var oneDay = 24 * 60 * 60 * 1000;
        var dateDiff = Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));
        return dateDiff;
    };

    exports.dateDiffAbsolute = function (startDate, endDate) {
        var oneDay = 24 * 60 * 60 * 1000;
        var dateDiff = (endDate.getTime() - startDate.getTime()) / oneDay;
        if (dateDiff < 0)
            dateDiff = Math.ceil(dateDiff);
        else
            dateDiff = Math.floor(dateDiff);
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
        var streakArray = [];
        dailyStatus.forEach(function (value) {
            if (value.success)
                currentStreak++;
            else {
                if (currentStreak > maxStreak)
                    maxStreak = currentStreak;
                currentStreak = 0;
            }
            streakArray.push(currentStreak);
        });
        if (currentStreak > maxStreak)
            maxStreak = currentStreak;
        return { maxStreak: maxStreak, streakResults: streakArray };
    };

    exports.stringToTitleCase = function (inputString) {
        inputString = inputString.toLowerCase().split(' ');
        for (var i = 0; i < inputString.length; i++) {
            inputString[i] = inputString[i].charAt(0).toUpperCase() + inputString[i].slice(1);
        }
        return inputString.join(' ');
    };

})(typeof (exports) === 'undefined' ? this.utilityFunctions = {} : exports);