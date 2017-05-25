// Start of utility functions
function MessageUtilities() {
    this.handleError = function (error) {
        console.log(error);
        $('#alertModal').modal('open');
        document.getElementById('alertModalContent').innerText = 'Oops something went wrong. We were unable to load the required data. Please check your connection and try again.';
    };

    this.showMessages = function (message) {
        $('#alertModal').modal('open');
        document.getElementById('alertModalContent').innerText = message;
    };
}
// End of utility functions

// Helper function to hold the habits in a standard format
function BitBreaks(habitObject, streakDetails) {
    this.hash = habitObject.hash;
    this.title = utilityFunctions.stringToTitleCase(habitObject.title);
    this.description = decodeURI(habitObject.description);
    this.startDate = new Date(habitObject.startDate);
    this.totalDays = habitObject.totalDays;
    this.streakDetails = (streakDetails !== undefined || streakDetails !== null) ? streakDetails : null;

    this.foreverHabit = habitObject.foreverHabit;

    // This will be of type array. Each day will be stored as an index of the array
    this.dailyStatus = habitObject.dailyStatus;
    this.ended = habitObject.ended;

    // These will give incorrect values if forever habit is checked. Basically -ve values...
    this.daysLeft = utilityFunctions.daysLeft(this.startDate, habitObject.totalDays);
    this.daysLeft = this.daysLeft < 0 ? 0 : this.daysLeft;
    this.endDate = utilityFunctions.endingDate(this.startDate, habitObject.totalDays);
}
// End of habit helper function

// Function to create dates specific to fullCalendar.io
function CalendarDates(dailyData, startDate, index) {
    this.id = index;
    this.title = dailyData.quote;
    this.color = dailyData.success === false ? 'red' : 'green';
    this.success = dailyData.success;

    this.start = new Date(startDate.getTime());
    this.start.setDate(startDate.getDate() + index);
    // this.start = this.start.toISOString();

    this.allDay = true;
}
// End of function to create dats specific to fullCalendar.io
