const UserPage = {
    template: `
        <div style="margin: 30px 0">
            <editor-modal v-on:add-new-habit="addNewHabit"></editor-modal>

            <router-view :active-habits="activeHabits" :ended-habits="endedHabits" :mark-complete="markComplete" :remove-habit="removeHabit" :loading="loading"></router-view>

            <div class="fixed-action-btn">
                <a class="btn-floating btn-large purple waves-effect waves-light" href="#editorModal">
                    <i class="large material-icons">mode_edit</i>
                </a>
            </div>
        </div>
    `,
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
                        let activeHabits = [];
                        let endedHabits = [];
                        data.bitBreaks.forEach((element) => {
                            if (element.ended)
                                endedHabits.push(new BitBreaks(element));
                            else
                                activeHabits.push(new BitBreaks(element));
                        });
                        this.activeHabits = activeHabits;
                        this.endedHabits = endedHabits;
                        this.loading = false;
                    }
                    else {
                        messageUtility.showMessages(data.message);
                        store.commit('removeUser');
                        router.push({ path: '/' });
                    }
                },
                error: (error) => {
                    messageUtility.handleError(error);
                }
            });
        },
        addNewHabit(rawHabit) {
            this.activeHabits.push(new BitBreaks(rawHabit));
        },
        removeHabit(habit) {
            $.ajax({
                type: 'DELETE',
                url: '/habits/delete/' + habit.hash,
                contentType: 'application/json',
                success: (data) => {
                    if (data.success) {

                        this.activeHabits = this.activeHabits.filter((element) => {
                            return element.hash !== habit.hash;
                        });
                        this.endedHabits = this.endedHabits.filter((element) => {
                            return element.hash !== habit.hash;
                        });

                        this.potentiallyRemovableHabit = null;
                    }
                    else {
                        messageUtility.showMessages(data.message);
                    }
                },
                error: (error) => {
                    messageUtility.handleError(error);
                }
            });
        },
        markComplete(habit) {
            let hash = habit.hash;

            $.ajax({
                type: 'PATCH',
                contentType: 'application/json',
                url: '/habits/endhabit/' + hash,
                success: (data) => {
                    if (data.success) {
                        this.activeHabits = this.activeHabits.filter((element) => {
                            return element.hash !== hash;
                        });

                        this.endedHabits.push(new BitBreaks(data.bitBreak));
                    }
                    else {
                        messageUtility.showMessages(data.message);
                    }
                },
                error: (error) => {
                    messageUtility.handleError(error);
                }
            });
        }
    },
    data() {
        return {
            activeHabits: [],
            endedHabits: [],
            loading: true
        };
    }
};