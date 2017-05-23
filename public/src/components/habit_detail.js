Vue.component('calendar', {
    props: {
        events: {
            type: Array,
            required: true
        },
        displayEvent: {
            type: Function,
            required: true
        }
    },
    template: `
        <div id="calendar"></div>
    `,
    mounted() {
        $('#calendar').fullCalendar({
            header: {
                left: 'prevYear,nextYear',
                center: 'title',
                right: 'today prev,next'
            },
            theme: true,
            eventStartEditable: false,
            eventDurationEditable: false,
            eventClick: (calEvent, jsEventObject, view) => {
                this.displayEvent(calEvent);
            },
            events: this.loadEvents
        });
    },
    beforeDestroy() {
        $('#calendar').fullCalendar('destory');
    },
    methods: {
        loadEvents(start, end, timeZone, callback) {
            let startTime = start.valueOf();
            let endDate = end.valueOf();

            let events = this.events.filter((element) => {
                return (element.start.getTime() >= startTime && element.start.getTime() <= endDate);
            });
            callback(events);
        }
    }
});

Vue.component('chart', {
    props: {
        streakArray: {
            type: Array,
            required: true
        }
    },
    template: `
        <canvas id="chart" style="margin-top: 40px"></canvas>
    `,
    mounted() {
        let labelArray = [];
        this.streakArray.forEach((element, index) => {
            labelArray.push(index + 1);
        });
        let context = document.getElementById('chart').getContext('2d');
        this.myChart = new Chart(context, {
            type: 'line',
            data: {
                labels: labelArray,
                datasets: [{
                    label: 'Your Streaks',
                    data: this.streakArray,
                    borderColor: 'rgba(153, 0, 204, 0.7)',
                    backgroundColor: 'rgba(153, 0, 204, 0.5)',
                    pointBackgroundColor: 'rgb(153, 0, 204)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    yAxes: [{
                        ticks: {
                            callback: function (value) {
                                if (value % 1 === 0)
                                    return value;
                            }
                        }
                    }]
                }
            }
        });
    },
    watch: {
        streakArray(updatedArray) {
            this.myChart.data.datasets[0].data = updatedArray;
            this.myChart.update();
        }
    },
    data() {
        return {
            myChart: null
        };
    }
});

const HabitDetails = {
    props: {
        hash: {
            type: String,
            required: true
        }
    },
    template: `
        <div style="padding-bottom: 30px; font-family: 'Lobster', cursive; margin-top: 20px" v-if="habit" class="container">

            <day-viewer-modal v-if="dayViewData" v-on:destroy-modal="destroyModal" :title="dayViewData.title" :succeeded="dayViewData.success" :show-button="showEditButton" :edit-habit="editHabit"></day-viewer-modal>
            <calendar-modal v-if="dayEditData" v-on:destroy-modal="destroyModal" :success="dayEditData.success" :day-description="dayEditData.title" :save-data="updateEvent"></calendar-modal>

            <div><router-link to="/user/dashboard"><i class="material-icons" style="font-size: 40px">arrow_back</i></router-link></div>
            <h4 class="center">{{habit.title}}</h4>
            <div class="center grey-text" v-html="habit.description"></div>
            <div>Max Streak: {{habit.streakDetails.maxStreak}}</div>
            <div>Start Date: {{habit.startDate.toDateString()}}</div>

            <div class="center" v-if="habit.foreverHabit">You have a lot of time but better work hard...</div>
            <div class="center" v-else>Looks like you have only {{habit.daysLeft}} days left. So rather not waste time...</div>
            
            <calendar :events="events" :displayEvent="showEvent"></calendar>
            <chart :streak-array="habit.streakDetails.streakResults"></chart>

        </div>
        <div v-else class="center" style="margin-top: 40px">
            <load-animation></load-animation>
        </div>
    `,
    watch: {
        '$route': 'fetchHabit'
    },
    mounted() {
        this.fetchHabit();
    },
    methods: {
        fetchHabit() {
            let date = new Date();
            let timezone = date.getTimezoneOffset();

            $.ajax({
                type: 'GET',
                url: '/habits/one/' + this.hash + '?timezone=' + timezone,
                success: (data) => {
                    if (data.success) {
                        this.habit = new BitBreaks(data.bitBreak, data.streakDetails);
                        let events = [];
                        for (let i = 0; i < this.habit.dailyStatus.length; i++)
                            events.push(new CalendarDates(this.habit.dailyStatus[i], this.habit.startDate, i));
                        this.events = events;
                    }
                    else
                        messageUtility.showMessages(data.message);
                },
                error: (error) => {
                    messageUtility.handleError(error);
                }
            });
        },
        destroyModal(modalName) {
            $(modalName).modal('close'); // Hacky Fix to remove black screen
            this.dayViewData = null;
            if (modalName === '#calendarModal')
                this.dayEditData = null;
        },
        showEvent(calendarEvent) {
            this.dayViewData = calendarEvent;

            let date = new Date();
            date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
            date.setUTCHours(0, 0, 0, 0);

            let setDate = utilityFunctions.dateDiffAbsolute(date, calendarEvent.start._d);
            if (setDate >= -3 && setDate <= 0 && !this.habit.ended)
                this.showEditButton = true;
            else
                this.showEditButton = false;
        },
        editHabit() {
            this.dayEditData = this.dayViewData;
            $("#dayModal").modal('close');
        },
        updateEvent(success, description) {
            let hash = this.habit.hash;

            let date = new Date();
            date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
            date.setUTCHours(0, 0, 0, 0);

            let setDate = utilityFunctions.dateDiffAbsolute(date, this.dayEditData.start._d);

            if (hash === null || hash === undefined) {
                messageUtility.showMessages('You\'re not playing fair!!!');
                return;
            }
            if (setDate === null || setDate === undefined || success === null || success === undefined ||
                description === null || description === undefined) {
                messageUtility.showMessages('All fields are required. Please fill all of them');
                return;
            }
            if (description.length > 120) {
                messageUtility.showMessages('Message length too long. Please reduce the size...');
                return;
            }

            date = new Date();
            let timezone = date.getTimezoneOffset();

            $.ajax({
                type: 'PATCH',
                contentType: 'application/json',
                url: '/habits/one/' + hash + '?timezone=' + timezone,
                data: JSON.stringify({ success: success, dayQuote: description, setDate: setDate }),
                success: (data) => {
                    if (data.success) {
                        this.dayEditData.success = data.updatedStatus.success;
                        this.dayEditData.title = data.updatedStatus.quote;

                        if (data.updatedStatus.success)
                            this.dayEditData.color = 'green';
                        else
                            this.dayEditData.color = 'red';

                        $('#calendar').fullCalendar('updateEvent', this.dayEditData);
                        $('#calendarModal').modal('close'); // Hacky Fix to remove black screen
                        this.dayEditData = null;

                        this.habit.streakDetails = data.streakDetails;
                    }
                    else
                        messageUtility.showMessages(data.message);
                },
                error: (error) => {
                    messageUtility.handleError(error);
                }
            });

        }
    },
    data() {
        return {
            habit: null,
            events: [],

            dayViewData: null,
            dayEditData: null,
            showEditButton: false
        };
    }
};