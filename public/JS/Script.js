/// <reference path="./../javascripts/jquery.d.ts" />
/// <reference path="./../javascripts/knockoutJS.d.ts" />
/// <reference path="./../javascripts/SammyJS.d.ts" />

// Start of default initializations
flatpickr('.flatpickr');
var iFrame = null;
tinymce.init({
    selector: "#bitDescription",
    theme: 'modern',
    plugins: ['image textcolor spellchecker insertdatetime table searchreplace link emoticons colorpicker textcolor autoresize imagetools paste'],
    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright alignjustify | link image | bullist numlist outdent indent | emoticons forecolor`',
    setup: function (editor) {
        editor.on('init', function (e) {
            iFrame = document.getElementById('bitDescription_ifr');
            iFrame = iFrame.contentWindow || iFrame.contentDocument;
        });
    },
    default_link_target: "_blank"
});
// End of default initializations

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

    this.dateDiff = function (startDate, endDate) {
        var oneDay = 24 * 60 * 60 * 1000;
        var dateDiff = Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));
        return dateDiff;
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

function BitBreaks(habitObject) {
    this.hash = habitObject.hash;
    this.title = utility.stringToTitleCase(habitObject.title);
    this.description = decodeURI(habitObject.description);
    this.startDate = new Date(habitObject.startDate);
    this.totalDays = habitObject.totalDays;

    this.foreverHabit = habitObject.foreverHabit;

    this.dailyStatus = habitObject.dailyStatus;
    this.ended = habitObject.ended;

    // These will give incorrect values if forever habit is checked. Basically -ve values...
    this.daysLeft = utility.daysLeft(this.startDate, habitObject.totalDays);
    this.endDate = utility.endingDate(this.startDate, habitObject.totalDays);
}

function mainController() {
    var self = this;

    self.currentUser = ko.observable();

    self.userActiveBitBreaks = ko.observableArray();
    self.userEndedBitBreaks = ko.observableArray();

    self.currentlySelectedHabit = ko.observable();
    self.events = [];

    self.potentiallyRemovableHabit = null;

    self.loginUser = function () {
        var userName = document.getElementById('loginUsername').value.trim();
        var password = document.getElementById('loginPassword').value.trim();
        if (userName === '' || password === '') {
            utility.showMessages("Fields cannot be blank!!!");
            return;
        }

        $.ajax({
            url: '/auth/login',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({ username: userName, password: password }),
            success: function (data) {
                if (data.success) {
                    self.currentUser(new loggedUser(data.user));
                    $("#loginModal").modal('close');
                    self.getUserHabits();
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
            url: '/auth/register',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({ username: userName, password: password }),
            success: function (data) {
                if (data.success) {
                    self.currentUser(new loggedUser(data.user));
                    $("#registerModal").modal('close');
                    self.getUserHabits();
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

    self.getUserHabits = function () {
        $.ajax({
            url: '/habits/all',
            type: 'GET',
            success: function (data) {
                if (data.success) {
                    var activeBitBreaks = [];
                    var endedBitBreaks = [];
                    data.bitBreaks.forEach(function (value) {
                        if (value.ended) {
                            endedBitBreaks.push(new BitBreaks(value));
                        }
                        else {
                            activeBitBreaks.push(new BitBreaks(value));
                        }
                    });
                    self.userActiveBitBreaks(activeBitBreaks);
                    self.userEndedBitBreaks(endedBitBreaks);
                }
                else {
                    utility.showMessages(data.message);
                }
            },
            error: function () {
                utility.handleError(error);
            }
        });
    };

    self.saveNewHabit = function () {
        var title = document.getElementById('bitTitle').value.trim();
        var description = iFrame.document.body.innerHTML;
        var endDate = document.getElementById('bitEndDate').value.trim();
        var foreverCheck = document.getElementById('foreverCheck').checked;

        if (endDate === '' && foreverCheck === false) {
            utility.showMessages('You cannot leave both end date and forever checkbox blank. Please select either one...');
            return;
        }
        if (title === '') {
            utility.showMessages('Please enter a title to continue...');
            return;
        }
        description = encodeURI(description);

        var startDate = new Date();
        startDate.setUTCHours(0, 0, 0, 0);
        endDate = new Date(endDate);

        var totalDays = -1;
        if (!foreverCheck)
            totalDays = utility.dateDiff(startDate, endDate);

        var dataSet = {
            title: title,
            description: description,
            startDate: startDate,
            totalDays: totalDays,
            forever: foreverCheck,
            username: self.currentUser().userName
        };
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dataSet),
            url: '/habits/save',
            success: function (data) {
                if (data.success) {
                    $("#editorModal").modal('close');
                    self.userActiveBitBreaks.push(new BitBreaks(data.bitBreak));
                }
                else
                    utility.showMessages(data.message);
            },
            error: function (error) {
                utility.handleError(error);
            }
        });
    };

    self.removeHabit = function (habitObject) {
        self.potentiallyRemovableHabit = habitObject;
        $("#promptModal").modal('open');
    };

    self.deleteHabit = function () {
        $("#promptModal").modal('close');
        if (self.potentiallyRemovableHabit === null) {
            utility.showMessages("No habit marked for deletion!!! You're not playing fair!!!");
            return;
        }
        var hash = self.potentiallyRemovableHabit.hash;
        $.ajax({
            url: '/habits/delete/' + hash,
            type: 'DELETE',
            contentType: 'application/json',
            success: function (data) {
                if (data.success) {
                    self.userActiveBitBreaks.remove(self.potentiallyRemovableHabit);
                    self.userEndedBitBreaks.remove(self.potentiallyRemovableHabit);
                    self.potentiallyRemovableHabit = null;
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

    self.cancelDeletion = function () {
        $("#promptModal").modal('close');
        self.potentiallyRemovableHabit = null;
    };

    self.markHabitCompleted = function (habitObject) {
        var hash = habitObject.hash;

        $.ajax({
            type: 'PATCH',
            contentType: 'application/json',
            url: '/habits/endhabit/' + hash,
            success: function (data) {
                if (data.success) {
                    self.userActiveBitBreaks.remove(habitObject);
                    self.userEndedBitBreaks.push(new BitBreaks(data.bitBreak));
                }
                else {
                    utility.showMessages(data.message);
                }
            },
            endDate: function (error) {
                utility.handleError(error);
            }
        });
    };

    self.showHabitDetails = function (habitObject) {
        self.currentlySelectedHabit(habitObject);


        $("#calendar").fullCalendar({
            header: {
                left: 'prevYear,nextYear',
                center: 'title',
                right: 'today,prev,next'
            }
        });

        for (var key in habitObject.dailyStatus) {
            var dataSet = {
                start: habitObject.startDate.getDate(),
                end: habitObject.startDate.getData() + key,
                description: habitObject.key.quote,
                success: habitObject.key.success
            };
            self.events.push(dataSet);
        }
        // TODO: Load a new page to display a calender.
        // TODO: Give the ability to add a daily status
    };
}

ko.applyBindings(new mainController());