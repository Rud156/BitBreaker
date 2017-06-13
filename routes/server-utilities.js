var crypto = require('crypto');
var utilities = require('./../helpers/utilities');


function setHabitDate(userHabit, timezoneOffset, key) {
    var today = new Date();
    today.setTime(today.getTime() - timezoneOffset * 60 * 1000);
    today.setUTCHours(0, 0, 0, 0);

    var dailyStatus = userHabit.dailyStatus;

    var totalDays = userHabit.totalDays;
    var startDate = userHabit.startDate;
    var currentDateDifference = utilities.dateDiff(startDate, today);
    var i;

    if (totalDays != -1) {
        i = 0;
        while (i <= currentDateDifference && i <= totalDays) {
            if (!dailyStatus[i]) {
                dailyStatus[i] = {};
                dailyStatus[i].success = false;
                dailyStatus[i].quote = 'Nothing Here';
            }
            else
                dailyStatus[i].quote = decrypt(dailyStatus[i].quote, key);
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
            else
                dailyStatus[i].quote = decrypt(dailyStatus[i].quote, key);
        }
    }
    return userHabit;
}

function encrypt(dataToEncrypt, key) {
    var cipher = crypto.createCipher('aes-256-ctr', key);
    var encryptedData = cipher.update(dataToEncrypt, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData;
}

function decrypt(dataToDecrypt, key) {
    var deCipher = crypto.createDecipher('aes-256-ctr', key);
    var decryptedData = deCipher.update(dataToDecrypt, 'hex', 'utf8');
    decryptedData += deCipher.final('utf8');
    return decryptedData;
}

function checkAuthentication(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else {
        return res.json({ success: false, message: 'You need to be logged in to view that page' });
    }
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    setHabitDate: setHabitDate,
    checkAuthentication: checkAuthentication
};