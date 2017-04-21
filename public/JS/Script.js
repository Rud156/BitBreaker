/// <reference path="./../javascripts/jquery.d.ts" />
/// <reference path="./../javascripts/knockoutJS.d.ts" />
/// <reference path="./../javascripts/SammyJS.d.ts" />
/// <reference path="./../../helpers/utilities.js" />

// TODO: Add routing

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
function MessagesFunction() {
    this.handleError = function (error) {
        console.log(error);
        $("#alertModal").modal('open');
        document.getElementById('alertModalContent').innerText = "Error Occurred.";
    };

    this.showMessages = function (message) {
        $("#alertModal").modal('open');
        document.getElementById('alertModalContent').innerText = message;
    };
}
var messageUtility = new MessagesFunction();
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
            messageUtility.handleError(error);
        }
    });
}
// End of function to load quotes on the homepage

var quoteBodies = document.getElementsByClassName('quoteBody');
var quoteAuthors = document.getElementsByClassName('quoteAuthor');
for (var i = 0; i < quoteBodies.length; i++)
    getAndSetQuote(quoteBodies[i], quoteAuthors[i]);

// Helper function to format and store username
function loggedUser(userObject) {
    this.userName = utilityFunctions.stringToTitleCase(userObject.username);
}
// End of helper function to format and store username

// Helper function to hold the habits in a standard format
function BitBreaks(habitObject) {
    this.hash = habitObject.hash;
    this.title = utilityFunctions.stringToTitleCase(habitObject.title);
    this.description = decodeURI(habitObject.description);
    this.startDate = new Date(habitObject.startDate);
    this.totalDays = habitObject.totalDays;

    this.foreverHabit = habitObject.foreverHabit;

    // This will be of type array. Each day will be stored as an index of the array
    this.dailyStatus = habitObject.dailyStatus;
    this.ended = habitObject.ended;

    // These will give incorrect values if forever habit is checked. Basically -ve values...
    this.daysLeft = utilityFunctions.daysLeft(this.startDate, habitObject.totalDays);
    this.endDate = utilityFunctions.endingDate(this.startDate, habitObject.totalDays);
}
// End of habit helper function

// Function to create dates specific to fullCalendar.io
function CalendarDates(dailyData, startDate, index) {
    this.title = dailyData.quote;
    this.color = dailyData.success === false ? 'red' : 'green';
    this.success = dailyData.success;

    this.start = new Date(startDate.getTime());
    this.start.setDate(startDate.getDate() + index);
    this.start = this.start.toISOString();
}
// End of function to create dats specific to fullCalendar.io


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
            messageUtility.showMessages("Fields cannot be blank!!!");
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
                    messageUtility.showMessages(data.message);
                }
            },
            error: function (error) {
                messageUtility.handleError(error);
            }
        });
    };

    // Registering user function
    self.registerUser = function () {
        var userName = document.getElementById('registerUsername').value.trim();
        var password = document.getElementById('registerPassword').value.trim();
        var rePassword = document.getElementById('registerRePassword').value.trim();

        if (userName === '' || password === '' || rePassword === '') {
            messageUtility.showMessages('Fields cannot be blank!!!');
            return;
        }
        if (password !== rePassword) {
            messageUtility.showMessages('Passwords do not match. Please check them...');
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
                    messageUtility.showMessages(data.message);
                }
            },
            error: function (error) {
                messageUtility.handleError(error);
            }
        });
    };

    // Get all habits of the user
    self.getUserHabits = function () {
        location.hash = '/dashboard';
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
            messageUtility.showMessages('You cannot leave both end date and forever checkbox blank. Please select either one...');
            return;
        }
        if (title === '') {
            messageUtility.showMessages('Please enter a title to continue...');
            return;
        }
        description = encodeURI(description);

        var startDate = new Date();
        startDate.setUTCHours(0, 0, 0, 0);
        endDate = new Date(endDate);

        var totalDays = -1;
        // If the forever button is not checked calculate the total days left til ending
        if (!foreverCheck)
            totalDays = utilityFunctions.dateDiff(startDate, endDate);

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
                    messageUtility.showMessages(data.message);
            },
            error: function (error) {
                messageUtility.handleError(error);
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
            messageUtility.showMessages("No habit marked for deletion!!! You're not playing fair!!!");
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
                    messageUtility.showMessages(data.message);
                }
            },
            error: function (error) {
                messageUtility.handleError(error);
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
                    messageUtility.showMessages(data.message);
                }
            },
            endDate: function (error) {
                messageUtility.handleError(error);
            }
        });
    };

    // Function to show the habit details on a calender
    self.showHabitDetails = function (habitObject) {
        location.hash = '/habit/' + habitObject.hash;
    };

    Sammy(function () {
        this.get('/dashboard', function () {
            self.currentlySelectedHabit(null);
            self.userActiveBitBreaks.removeAll();
            self.userEndedBitBreaks.removeAll();

            $("#calendar").fullCalendar('destory');

            $.ajax({
                url: '/habits/all',
                type: 'GET',
                success: function (data) {
                    if (data.success) {
                        var activeBitBreaks = [];
                        var endedBitBreaks = [];
                        data.bitBreaks.forEach(function (value) {
                            // Condition to check if the habit has ended of not
                            if (value.ended)
                                endedBitBreaks.push(new BitBreaks(value));
                            else
                                activeBitBreaks.push(new BitBreaks(value));
                        });
                        self.userActiveBitBreaks(activeBitBreaks);
                        self.userEndedBitBreaks(endedBitBreaks);
                    }
                    else {
                        location.hash = '/';
                        messageUtility.showMessages(data.message);
                    }
                },
                error: function () {
                    messageUtility.handleError(error);
                }
            });
        });

        this.get('/habit/:hash', function () {
            self.userActiveBitBreaks.removeAll();
            self.userEndedBitBreaks.removeAll();

            $.ajax({
                type: 'GET',
                url: '/habits/one/' + this.params.hash,
                success: function (data) {

                    $("#calendar").fullCalendar('destory');

                    if (data.success) {
                        self.currentlySelectedHabit(new BitBreaks(data.bitBreak));
                        var events = [];
                        for (var i = 0; i < self.currentlySelectedHabit().dailyStatus.length; i++)
                            events.push(new CalendarDates(self.currentlySelectedHabit().dailyStatus[i], self.currentlySelectedHabit().startDate, i));

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
                    }
                    else{
                        location.hash = '/dashboard';
                        messageUtility.showMessages(data.message);
                    }
                },
                error: function (error) {
                    messageUtility.handleError(error);
                }
            });

            // $("#calendar").fullCalendar('destory');
            // TODO: Give the ability to add a daily status
        });
    }).run();
}

ko.applyBindings(new mainController());