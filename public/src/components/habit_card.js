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
        markComplete: {
            type: Function
        }
    },
    template: `
        <div class="masonry-item">
            <div class="card blue lighten-1 center white-text" style="width: 100%">
                <div class="card-content">

                    <div class="row">
                        <div class="col waves-effect waves-red" :class="[habit.ended ? 's6': 's4']" v-on:click="removeHabit(habit)">DELETE</div>
                        <div class="col s4 waves-effect waves-green" v-if="!habit.ended" v-on:click="markComplete(habit)">MARK DONE</div>
                        <router-link class="col waves-effect waves-light white-text" :class="[habit.ended ? 's6': 's4']" v-bind:to="'habit/' + habit.hash">VIEW</router-link>
                    </div>

                    <span class="card-title">{{habit.title}}</span>
                    <div v-html="habit.description"></div>
                </div>
                <div class="card-action">
                    <div v-if="!habit.foreverHabit">Days Left: <span>{{habit.daysLeft}}</span></div>
                    <div v-if="!habit.foreverHabit">Ending Date: <span>{{habit.endDate.toDateString()}}</span></div>
                    <div v-else>Looks like you have &#8734; time left. Try to make the best use of it.</div>
                </div>
            </div>
        </div>
    `
});