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

const HabitDetails = {
    props: {
        hash: {
            type: String,
            required: true
        }
    },
    template: `
        <div style="padding-bottom: 30px; font-family: 'Lobster', cursive; margin-top: 20px" v-if="habit" class="container">

            <calendar-modal v-if="dayData" v-on:destroy-modal="destroyModal" :success="dayData.success" :day-description="dayData.title" :save-data="updateEvent"></calendar-modal>
            
            <div><router-link to="/user/dashboard"><i class="material-icons" style="font-size: 40px">arrow_back</i></router-link></div>
            <h4 class="center">{{habit.title}}</h4>
            <div class="center grey-text" v-html="habit.description"></div>
            <div>Max Streak: {{habit.maxStreak}}</div>
            <div>Start Date: {{habit.startDate}}</div>

            <div class="center" v-if="!habit.foreverHabit">You have a lot of time but better work hard...</div>
            <div class="center" v-else>Looks like you have only {{habit.daysLeft}} days left. So rather not waste time...</div>
            
            <calendar :events="events" :displayEvent="showEvent"></calendar>

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
            $.ajax({
                type: 'GET',
                url: '/habits/one/' + this.hash,
                success: (data) => {
                    if (data.success) {
                        this.habit = new BitBreaks(data.bitBreak, data.maxStreak);
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
        destroyModal() {
            $('#calendarModal').modal('close'); // Hacky Fix to remove black screen
            this.dayData = null;
        },
        showEvent(calendarEvent) {
            // TODO: Calculate SetDate here and display simple view if the date has crossed the limit
            // Do not open the modal in that case
            this.dayData = calendarEvent;
        },
        updateEvent(success, description) {
            let hash = this.habit.hash;
            let setDate = utilityFunctions.dateDiffAbsolute(new Date(), this.dayData.start._d);

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

            $.ajax({
                type: 'PATCH',
                contentType: 'application/json',
                url: '/habits/one/' + hash,
                data: JSON.stringify({ success: success, dayQuote: description, setDate: setDate }),
                success: (data) => {
                    if (data.success) {
                        this.dayData.success = data.updatedStatus.success;
                        this.dayData.title = data.updatedStatus.quote;

                        if (data.updatedStatus.success)
                            this.dayData.color = 'green';
                        else
                            this.dayData.color = 'red';

                        $('#calendar').fullCalendar('updateEvent', this.dayData);
                        $('#calendarModal').modal('close'); // Hacky Fix to remove black screen
                        this.dayData = null;
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

            dayData: null
        };
    }
};