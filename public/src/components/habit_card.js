Vue.component('habit-card', {
    props: {
        habit: {
            type: Object,
            required: true
        },
        removeHabit: {
            type: Function,
            required: true
        },
        markCompleted: {
            type: Function
        }
    },
    template: `
        <div class="masonry-item">
            <div class="card blue lighten-1 center white-text waves-effect waves-light">
                <div style="padding: 10px">
                    <span v-on:click="removeHabit(habit)" class="right waves-effect waves-red" style="cursor: pointer"><i class="material-icons">delete</i></span>
                    <span v-if="!habit.ended" v-on:click="markCompleted(habit)" class="right waves-effect waves-red" style="cursor: pointer; margin-right: 3px"><i class="material-icons">check_circle</i></span>
                </div>
                <router-link class="card-content"  v-bind:to="'/habit/' + habit.hash">
                    <span class="card-title white-text">{{habit.title}}</span>
                    <div class="white-text" v-html="habit.description"></div>
                </router-link>
                <div class="card-action">
                    <div v-if="!habit.foreverHabit">Days Left: <span></span></div>
                    <div v-if="!habit.foreverHabit">Ending Date: <span></span></div>
                    <div v-else>Looks like you have &#8734; time left. Try to make the best use of it.</div>
                </div>
            </div>
        </div>
    `
});