var userObject = null;
var messageUtility = new MessageUtilities();

const routes = [
    { path: '/', component: HomePage },
    {
        path: '/user', component: UserPage,
        children: [
            { path: 'dashboard', component: DashBoard },
            { path: 'habit/:hash', component: HabitDetails, props: true}
        ]
    },
    { path: '*', redirect: '/' }
];

const router = new VueRouter({
    routes
});
router.beforeEach((to, from, next) => {
    if (to.path === '/') {
        if (window.localStorage.getItem('user') !== null) {
            userObject = { username: window.localStorage.getItem('user') };
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
    components: {
        'home-page': HomePage
    }
}).$mount('#app');