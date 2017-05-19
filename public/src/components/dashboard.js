const DashBoard = {
    template: `
        <div>
            <nav-bar :logged-in="true"></nav-bar>
            <div class="container">
                <div>
                    <h3 class="center">
                        Currently Active Habits:
                    </h3>
                    <h5 class="center grey-text" style="font-family: 'Amaranth', Tahoma, Geneva, Verdana, sans-serif" v-if="activeHabits.length === 0">
                        You don't seem to have any active habits
                    </h5>
                    <div class="masonry">
                        <habit-card v-for="habit in activeHabits" :key="habit.hash" :habit="habit" :remove-habit="removeHabit" :mark-complete="markComplete"></habit-card>
                    </div>
                </div>
                <div style="padding-top: 50px">
                    <h3 class="center">
                        Ended Habits:
                    </h3>
                    <h5 class="center grey-text" style="font-family: 'Amaranth', Tahoma, Geneva, Verdana, sans-serif" v-if="endedHabits.length === 0">
                        You don't seem to have any completed habits
                    </h5>
                    <div class="masonry">
                        <habit-card v-for="habit in endedHabits" :key="habit.hash" :remove-habit="removeHabit" :habit="habit"></habit-card>
                    </div>
                </div>

                <div class="fixed-action-btn">
                    <a class="btn-floating btn-large purple waves-effect waves-light" href="#editorModal">
                        <i class="large material-icons">mode_edit</i>
                    </a>
                </div>
            </div>
        </div>
    `,
    beforeCreate() {
        if (!window.localStorage.getItem('user')) {
            router.push({ path: '/' });
        }
    },
    mounted() {
        this.fetchAllHabits();
    },
    methods: {
        fetchAllHabits() {
            $.ajax({
                type: 'GET',
                url: '/habits/all',
                success: (data) => {
                    if (data.success) {
                        data.bitBreaks.forEach((element) => {
                            if (element.ended)
                                this.endedHabits.push(new BitBreaks(element));
                            else
                                this.activeHabits.push(new BitBreaks(element));
                        });
                    }
                    else {
                        messageUtility.showMessages(data.message);
                        window.localStorage.removeItem('user');
                        router.push({ path: '/' });
                    }
                },
                error: (error) => {
                    messageUtility.handleError(error);
                }
            });
        },
        removeHabit(habit) {
            console.log(habit);
        },
        markComplete(habit) {
            console.log(habit);
        }
    },
    data() {
        return {
            user: userObject,
            activeHabits: [],
            endedHabits: []
        };
    }
};