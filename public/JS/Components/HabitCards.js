/// <reference path="./../../javascripts/knockoutJS.d.ts" />

ko.components.register('habit-card', {
    template:
    '<div class="masonry-item">' +
    '<div class="card blue lighten-1 center white-text waves-effect waves-light">' +
    '<div style="padding: 10px">' +
    '<span class="right waves-effect waves-red" style="cursor: pointer" data-bind="click: removeHabit"><i class="material-icons">delete</i></span>' +
    '<span class="right waves-effect waves-red" style="cursor: pointer; margin-right: 3px" data-bind="ifnot: habitObject.ended, click: markHabitCompleted"><i class="material-icons">check_circle</i></span>' +
    '</div>' +
    '<div class="card-content" data-bind="click: showHabitDetails">' +
    '<span class="card-title" data-bind="text: habitObject.title"></span>' +
    '<div data-bind="html: habitObject.description"></div>' +
    '</div>' +
    '<div class="card-action">' +
    '<div data-bind="ifnot: habitObject.foreverHabit">Days Left: <span data-bind="text: habitObject.daysLeft"></span></div>' +
    '<div data-bind="ifnot: habitObject.foreverHabit">Ending Date: <span data-bind="text: habitObject.endDate.toDateString()"></span></div>' +
    '<div data-bind="if: habitObject.foreverHabit">Looks like you have &#8734; time left. Try to make the best use of it.</div>' +
    '</div>' +
    '</div>' +
    '</div>',
    viewModel: function (params) {
        var self = this;

        self.rootObject = params.root;
        self.habitObject = params.data;

        self.removeHabit = function (thisObject) {
            self.rootObject.removeHabit(thisObject.habitObject);
        };

        self.markHabitCompleted = function (thisObject) {
            self.rootObject.markHabitCompleted(thisObject.habitObject);
        };

        self.showHabitDetails = function (thisObject) {
            self.rootObject.showHabitDetails(thisObject.habitObject);
        };
    }
});