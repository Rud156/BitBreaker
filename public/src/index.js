var messageUtility = new MessageUtilities();

const store = new Vuex.Store({
    strict: true,
    state: {
        userObject: null
    },
    mutations: {
        setUser(state, user) {
            state.userObject = user;
            window.localStorage.setItem('user', state.userObject.username);
        },
        removeUser(state) {
            state.userObject = null;
            window.localStorage.removeItem('user');
        }
    },
    getters: {
        userChanged(state) {
            return state.userObject;
        }
    }
});

const routes = [
    { path: '/', component: HomePage },
    {
        path: '/user', component: UserPage,
        children: [
            { path: 'dashboard', component: DashBoard },
            { path: 'habit/:hash', component: HabitDetails, props: true }
        ]
    },
    { path: '*', redirect: '/' }
];

const router = new VueRouter({
    routes
});
router.beforeEach((to, from, next) => {
    if (window.localStorage.getItem('user') !== null && !store.state.userObject) {
        store.commit('setUser', { username: window.localStorage.getItem('user') });
    }

    if (to.path === '/') {
        if (window.localStorage.getItem('user') !== null) {
            router.push({ path: 'user/dashboard' });
        }
        else
            next();
    }
    else
        next();
});

const vm = new Vue({
    router,
    store,
    computed: {
        returnUser() {
            return this.$store.getters.userChanged;
        }
    },
    components: {
        'home-page': HomePage
    }
}).$mount('#app');