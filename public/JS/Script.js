/// <reference path="./../javascripts/jquery.d.ts" />
/// <reference path="./../javascripts/knockoutJS.d.ts" />
/// <reference path="./../javascripts/SammyJS.d.ts" />

function utilityFunction() {
    this.handleError = function (error) {
        console.log(error);
        $("#alertModal").modal('open');
        document.getElementById('alertModalContent').innerText = "Error Occurred.";
    };

    this.stringToTitleCase = function (baseString) {
        baseString = baseString.toLowerCase().split(' ');
        for (var i = 0; i < baseString.length; i++) {
            baseString[i] = baseString[i].charAt(0).toUpperCase() + baseString[i].slice(1);
        }
        return baseString.join(' ');
    };

    this.showMessages = function (message) {
        $("#alertModal").modal('open');
        document.getElementById('alertModalContent').innerText = message;
    };

    this.endingDate = function (startDate, totalDays) {
        var oneDay = 24 * 60 * 60 * 1000;

        var todayDate = new Date();
        todayDate.setUTCHours(0, 0, 0, 0);

        var dateDiff = Math.round(Math.abs((startDate.getTime() - todayDate.getTime()) / oneDay));
        totalDays -= dateDiff;

        todayDate.setDate(todayDate.getDate() + totalDays);
        return todayDate;
    };

    this.daysLeft = function (startDate, totalDays) {
        var oneDay = 24 * 60 * 60 * 1000;

        var todayDate = new Date();
        todayDate.setUTCHours(0, 0, 0, 0);

        var dateDiff = Math.round(Math.abs((startDate.getTime() - todayDate.getTime()) / oneDay));
        totalDays -= dateDiff;

        return totalDays;
    };
}
var utility = new utilityFunction();

function getAndSetQuote(quoteBody, quoteAuthor) {
    $.ajax({
        dataType: 'json',
        url: 'https://apimk.com/motivationalquotes?get_quote=yes',
        success: function (data) {
            data = data[0];
            quoteBody.innerText = data.quote;
            quoteAuthor.innerText = '--- ' + data.author_name;
        },
        error: function (error) {
            utility.handleError(error);
        }
    });
}

var quoteBodies = document.getElementsByClassName('quoteBody');
var quoteAuthors = document.getElementsByClassName('quoteAuthor');
for (var i = 0; i < quoteBodies.length; i++)
    getAndSetQuote(quoteBodies[i], quoteAuthors[i]);


function loggedUser(userObject) {
    this.userName = utility.stringToTitleCase(userObject.username);
}

function bitBreaks(habitObject) {
    this.hash = habitObject.hash;
    this.title = utility.stringToTitleCase(habitObject.title);
    this.description = decodeURI(habitObject.description);
    this.startDate = habitObject.startDate;
    this.totalDays = habitObject.totalDays;
    this.foreverHabit = habitObject.foreverHabit;
    this.dailyStatus = habitObject.dailyStatus;
    this.ended = habitObject.ended;

    this.daysLeft = utility.daysLeft(habitObject.startDate, habitObject.totalDays);
    this.endDate = utility.endingDate(habitObject.startDate, habitObject.totalDays);
}

function mainController() {
    var self = this;

    // Currently the user is always logged in. Change this when UI is complete
    self.currentUser = ko.observable();
    self.userActiveBitBreaks = ko.observableArray();
    self.userEndedBitBreaks = ko.observableArray();

    self.loginUser = function () {
        var userName = document.getElementById('loginUsername').value.trim();
        var password = document.getElementById('loginPassword').value.trim();
        if (userName === '' || password === '') {
            utility.showMessages("Fields cannot be blank!!!");
            return;
        }

        $.ajax({
            url: 'http://localhost:3000/auth/login',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({ username: userName, password: password }),
            success: function (data) {
                if (data.success) {
                    self.currentUser(new loggedUser(data.user));
                    $("#loginModal").modal('close');
                }
                else {
                    utility.showMessages(data.message);
                }
            },
            error: function (error) {
                utility.handleError(error);
            }
        });
    };

    self.registerUser = function () {
        var userName = document.getElementById('registerUsername').value.trim();
        var password = document.getElementById('registerPassword').value.trim();
        var rePassword = document.getElementById('registerRePassword').value.trim();

        if (userName === '' || password === '' || rePassword === '') {
            utility.showMessages('Fields cannot be blank!!!');
            return;
        }
        if (password !== rePassword) {
            utility.showMessages('Passwords do not match. Please check them...');
            return;
        }

        $.ajax({
            url: 'http://localhost:3000/auth/register',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({ username: userName, password: password }),
            success: function (data) {
                if (data.success) {
                    self.currentUser(new loggedUser(data.user));
                    $("#registerModal").modal('close');
                }
                else {
                    utility.showMessages(data.message);
                }
            },
            error: function (error) {
                utility.handleError(error);
            }
        });
    };

    self.saveNewHabit = function () {

    };
}

ko.applyBindings(new mainController());