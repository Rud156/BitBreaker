/// <reference path='./../javascripts/jquery.d.ts' />
/// <reference path='./../javascripts/knockoutJS.d.ts' />
/// <reference path='./../../helpers/utilities.js' />
/// <reference path="./../javascripts/director.js" />
/// <reference path="./Models.js" />

var messageUtility = new MessageUtilities();

// TODO: Add UI for single habit view
// TODO: Add Ability to edit and update habit
// TODO: Remove Sammy.JS

// Start of main controller
function MainController() {
    var self = this;

    self.currentQuote = ko.observable();

    self.currentUser = ko.observable();

    self.userActiveBitBreaks = ko.observableArray();
    self.userEndedBitBreaks = ko.observableArray();

    self.currentlySelectedHabit = ko.observable();
    self.currentEvent = null;

    self.potentiallyRemovableHabit = null;

    // Start of function to load quote into the homepage
    self.getQuote = function () {
        $.ajax({
            dataType: 'json',
            url: 'https://apimk.com/motivationalquotes?get_quote=yes',
            success: function (data) {
                data = data[0];
                self.currentQuote({ quote: data.quote, author: data.author_name });
            },
            error: function (error) {
                messageUtility.handleError(error);
            }
        });
    };
    // End of function to load quote

    // Login user function
    self.loginUser = function () {
        var userName = document.getElementById('loginUsername').value.trim();
        var password = document.getElementById('loginPassword').value.trim();
        if (userName === '' || password === '') {
            messageUtility.showMessages('Fields cannot be blank!!!');
            return;
        }

        $.ajax({
            url: '/auth/login',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({ username: userName, password: password }),
            success: function (data) {
                if (data.success) {
                    self.currentUser(new LoggedUser(data.user));
                    window.localStorage.setItem('user', self.currentUser().userName);
                    $('#loginModal').modal('close');
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
                    $('#registerModal').modal('close');
                    messageUtility.showMessages('Registeration successful. Please login to continue...');
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

    self.checkLogin = function () {
        if (window.localStorage.getItem('user') !== null) {
            var user = window.localStorage.getItem('user');
            self.currentUser(new LoggedUser({ username: user }));
            location.hash = '/dashboard';
        }
        else {
            self.currentUser(null);
            self.userActiveBitBreaks.removeAll();
            self.userEndedBitBreaks.removeAll();
            self.currentlySelectedHabit(null);
            self.potentiallyRemovableHabit = null;
            self.getQuote();
        }
    };

    // Get all habits of the user
    self.getUserHabits = function () {
        location.hash = '/dashboard';
    };

    self.saveDailyData = function () {
        var success = document.getElementById('successCheck').checked;
        var quote = document.getElementById('dailyData').value.trim();
        var setDate = utilityFunctions.dateDiffAbsolute(new Date(), self.currentEvent.start._d);
        var hash = self.currentlySelectedHabit().hash;

        if (hash === null || hash === undefined) {
            messageUtility.showMessages('You\'re not playing fair!!!');
            return;
        }
        if (setDate === null || setDate === undefined || success === null || success === undefined ||
            quote === null || quote === undefined) {
            messageUtility.showMessages('All fields are required. Please fill all of them');
            return;
        }

        if (quote.length > 120) {
            messageUtility.showMessages('Message length too long. Please reduce the size...');
            return;
        }

        $.ajax({
            type: 'PATCH',
            contentType: 'application/json',
            url: '/habits/one/' + hash,
            data: JSON.stringify({ success: success, dayQuote: quote, setDate: setDate }),
            success: function (data) {
                if (data.success) {
                    // TODO: Dynamically update the calendar
                    self.currentEvent.success = data.updatedStatus.success;
                    self.currentEvent.title = data.updatedStatus.quote;

                    if (data.updatedStatus.success === true)
                        self.currentEvent.color = 'green';
                    else
                        self.currentEvent.color = 'red';

                    $('#calendar').fullCalendar('updateEvent', self.currentEvent);
                    self.currentEvent = null;
                    $('#calendarModal').modal('close');
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
        // Encode the data to prevent transformation when strigifying it
        description = encodeURI(description);

        var startDate = new Date();
        startDate.setUTCHours(0, 0, 0, 0);
        endDate = new Date(endDate);

        var totalDays = -1;
        // If the forever button is not checked calculate the total days left till ending
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
                    $('#editorModal').modal('close');
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
        $('#promptModal').modal('open');
    };

    // Confirm deletion of habit
    self.deleteHabit = function () {
        $('#promptModal').modal('close');
        if (self.potentiallyRemovableHabit === null) {
            messageUtility.showMessages('No habit marked for deletion!!! You\'re not playing fair!!!');
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
        $('#promptModal').modal('close');
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
}

var mainController = new MainController();
ko.applyBindings(mainController);

// DirectorJS routes bindings
var routes = {
    '/dashboard': function () {
        $('#calendar').fullCalendar('destory');

        $.ajax({
            url: '/habits/all',
            type: 'GET',
            success: function (data) {
                // RESET the values to default state
                mainController.currentlySelectedHabit(null);
                mainController.userActiveBitBreaks.removeAll();
                mainController.userEndedBitBreaks.removeAll();
                mainController.potentiallyRemovableHabit = null;

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
                    mainController.userActiveBitBreaks(activeBitBreaks);
                    mainController.userEndedBitBreaks(endedBitBreaks);
                }
                else {
                    location.hash = '#/';
                    window.localStorage.removeItem('user');
                    messageUtility.showMessages(data.message);
                }
            },
            error: function () {
                messageUtility.handleError(error);
            }
        });
    },

    '/habit/:hash': function (hash) {
        $.ajax({
            type: 'GET',
            url: '/habits/one/' + hash,
            success: function (data) {
                //RESET values to default state
                mainController.potentiallyRemovableHabit = null;
                mainController.userActiveBitBreaks.removeAll();
                mainController.userEndedBitBreaks.removeAll();

                if (data.success) {
                    $('#calendar').fullCalendar('destory');

                    mainController.currentlySelectedHabit(new BitBreaks(data.bitBreak, data.maxStreak));
                    var events = [];
                    for (var i = 0; i < mainController.currentlySelectedHabit().dailyStatus.length; i++)
                        events.push(new CalendarDates(mainController.currentlySelectedHabit().dailyStatus[i], mainController.currentlySelectedHabit().startDate, i));

                    $('#calendar').fullCalendar({
                        header: {
                            left: 'prevYear,nextYear',
                            center: 'title',
                            right: 'today prev,next'
                        },
                        theme: true,
                        eventStartEditable: false,
                        eventDurationEditable: false,
                        eventClick: function (calEvent, jsEvent, view) {
                            mainController.currentEvent = calEvent;

                            $('#calendarModal').modal('open');
                            if (calEvent.title !== 'Nothing Here')
                                document.getElementById('dailyData').value = calEvent.title;
                            else
                                document.getElementById('dailyData').value = '';
                            document.getElementById('successCheck').checked = calEvent.success;
                        },
                        // Try adding dynamic event. Make a function to reuse the calender
                        // instead of destroying and creating it again and again.
                        events: events
                    });
                }
                else {
                    location.hash = '/dashboard';
                    messageUtility.showMessages(data.message);
                }
            },
            error: function (error) {
                location.hash = '/dashboard';
                messageUtility.handleError(error);
            }
        });
    },

    '/': function () {
        mainController.checkLogin();
    }
};

var router = Router(routes);
router.init();

if (location.hash === '')
    location.hash = '#/';