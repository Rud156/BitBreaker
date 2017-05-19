const DashBoard = {
    props: {
        activeHabits: {
            type: Array,
            required: true
        },
        endedHabits: {
            type: Array,
            required: true
        },
        markComplete: {
            type: Function,
            required: true
        },
        removeHabit: {
            type: Function,
            required: true
        }
    },
    template: `
        <div>
            <user-prompt-modal :accept="userAccepts" :deny="userDenies"></user-prompt-modal>

            <div class="container">
                <div>
                    <h3 class="center">
                        Currently Active Habits:
                    </h3>
                    <h5 class="center grey-text" style="font-family: 'Amaranth', Tahoma, Geneva, Verdana, sans-serif" v-if="activeHabits.length === 0">
                        You don't seem to have any active habits
                    </h5>
                    <div class="masonry">
                        <habit-card v-for="habit in activeHabits" :key="habit.hash" :habit="habit" :remove-habit="setPotentiallyRemoveAbleHabit" :mark-complete="markComplete"></habit-card>
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
                        <habit-card v-for="habit in endedHabits" :key="habit.hash" :remove-habit="setPotentiallyRemoveAbleHabit" :habit="habit"></habit-card>
                    </div>
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

    },
    methods: {
        userAccepts() {
            if (!this.potentiallyRemovableHabit) {
                messageUtility.showMessages('No habit marked for deletion!!! You\'re not playing fair!!!');
                return;
            }
            $('#promptModal').modal('close');
            this.removeHabit(this.potentiallyRemovableHabit);
            this.potentiallyRemovableHabit = null;
        },
        userDenies() {
            this.potentiallyRemovableHabit = null;
            $('#promptModal').modal('close');
        },
        setPotentiallyRemoveAbleHabit(habit) {
            this.potentiallyRemovableHabit = habit;
            $('#promptModal').modal('open');
        }
    },
    data() {
        return {
            user: userObject,
            potentiallyRemovableHabit: null
        };
    }
};