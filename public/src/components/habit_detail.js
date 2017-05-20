const HabitDetails = {
    props: {
        hash: {
            type: String,
            required: true
        }
    },
    template: `
        <div style="padding-bottom: 30px; font-family: 'Lobster', cursive;" v-if="habit" class="container">
            <div><router-link to="/user/dashboard"><i class="material-icons" style="font-size: 40px">arrow_back</i></router-link></div>
            <h4 class="center">{{habit.title}}</h4>
            <div class="center grey-text" v-html="habit.description"></div>
            <div>Max Streak: {{maxStreak}}</div>
            <div>Start Date: {{habit.startDate}}</div>

            <div class="center" v-if="!habit.foreverHabit">You have a lot of time but better work hard...</div>
            <div class="center" v-else>Looks like you have only {{habit.daysLeft}} days left. So rather not waste time...</div>
            <div id="calendar"></div>
        </div>
    `,
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
                        this.habit = new BitBreaks(data.bitBreak);
                        this.maxStreak = data.maxStreak;
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
            maxStreak: null,
            habit: null
        };
    }
};