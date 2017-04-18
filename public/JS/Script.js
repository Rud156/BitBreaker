/// <reference path="./../javascripts/jquery.d.ts" />
/// <reference path="./../javascripts/knockoutJS.d.ts" />
/// <reference path="./../javascripts/SammyJS.d.ts" />
/// <reference path="./../../routes/utilities.js" />

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

// Start of utility functions
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

        var tempDate = new Date(startDate.getTime());
        tempDate.setDate(startDate.getDate() + totalDays);

        return tempDate;
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
// End of utility functions


// Start of loading the quotes on the homepage
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
// End of function to load quotes on the homepage

var quoteBodies = document.getElementsByClassName('quoteBody');
var quoteAuthors = document.getElementsByClassName('quoteAuthor');
for (var i = 0; i < quoteBodies.length; i++)
    getAndSetQuote(quoteBodies[i], quoteAuthors[i]);

// Helper function to format the username
function loggedUser(userObject) {
    this.userName = utility.stringToTitleCase(userObject.username);
}

// Helper function to hold the habits in a standerd format
function BitBreaks(habitObject) {
    this.hash = habitObject.hash;
    this.title = utility.stringToTitleCase(habitObject.title);
    this.description = decodeURI(habitObject.description);
    this.startDate = new Date(habitObject.startDate);
    this.totalDays = habitObject.totalDays;

    this.foreverHabit = habitObject.foreverHabit;

    // This will be of type array. Each day will be stored as an index of the array
    this.dailyStatus = habitObject.dailyStatus;
    this.ended = habitObject.ended;

    // These will give incorrect values if forever habit is checked. Basically -ve values...
    this.daysLeft = utility.daysLeft(this.startDate, habitObject.totalDays);
    this.endDate = utility.endingDate(this.startDate, habitObject.totalDays);
}
// End of habit helper function


// Start of main controller
function mainController() {
    var self = this;

    self.currentUser = ko.observable();

    self.userActiveBitBreaks = ko.observableArray();
    self.userEndedBitBreaks = ko.observableArray();

    self.currentlySelectedHabit = ko.observable();

    self.potentiallyRemovableHabit = null;

    // Login user function
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

    // Registering user function
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

    // Get all habits of the user
    self.getUserHabits = function () {
        $.ajax({
            url: '/habits/all',
            type: 'GET',
            success: function (data) {
                if (data.success) {
                    var activeBitBreaks = [];
                    var endedBitBreaks = [];
                    data.bitBreaks.forEach(function (value) {
                        // Condition to check if the habit has ended of not
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

    // Function to save the entered user habit
    // URI encode the description before sending it to prevent garbled form
    // Basic conditional checks
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
        // If the forever button is not checked calculate the total days left til ending
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

    // Function to accept prompt from user to remove a habit
    self.removeHabit = function (habitObject) {
        self.potentiallyRemovableHabit = habitObject;
        $("#promptModal").modal('open');
    };

    // Confirm deletion of habit
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

    // Function to cancel deletion of the habit
    self.cancelDeletion = function () {
        $("#promptModal").modal('close');
        self.potentiallyRemovableHabit = null;
    };

    // Function to mark the selected habit as completed
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

    // Function to show the habit details on a calender
    self.showHabitDetails = function (habitObject) {
        self.currentlySelectedHabit(habitObject);

        var events = [];
        var startDate = habitObject.startDate;
        for (var i = 0; i < habitObject.dailyStatus.length; i++) {
            var color;
            if (habitObject.dailyStatus[i].success)
                color = 'green';
            else
                color = 'red';

            var start = new Date(startDate.getTime());
            start.setDate(startDate.getDate() + i);

            var dataSet = {
                color: color,
                title: habitObject.dailyStatus[i].quote,
                start: start
            };
            events.push(dataSet);
        }


        $("#calendar").fullCalendar({
            header: {
                left: 'prevYear,nextYear',
                center: 'title',
                right: 'today prev,next'
            },
            eventStartEditable: false,
            eventDurationEditable: false,
            eventClick: function (calEvent, jsEvent, view) {
                // Load a custom modal to display details
                // If editable, load the modal to add the editable data
                console.log(calEvent, jsEvent, view);
            },
            events: events
        });

        // $("#calendar").fullCalendar('destory');
        // TODO: Load a new page to display a calender.
        // TODO: Give the ability to add a daily status
    };
}

ko.applyBindings(new mainController());