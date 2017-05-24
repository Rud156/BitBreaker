Vue.component('page-footer', {
    template: `
        <div id="pageFooter">
            <div class="page-footer blue darken-4">
                <div class="container blue darken-4" style="padding: 14px 0; font-family: 'Lobster', cursive">
                    <div class="container white-text">
                        © 2017 Copyright
                        <a href="https://www.github.com/Rud156" target="_blank" class="white-text right"> Desgined with 💗 by: Rud156 </a>
                    </div>
                </div>    
            </div>
        </div>
    `
});

Vue.component('nav-bar', {
    props: {
        user: {
            required: true
        }
    },
    template: `
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper blue">
                    <a class="brand-logo center" style="font-family: 'Oleo Script', cursive">{{user ? user.username + "'s DashBoard" : 'Bit Breaker'}}</a>
                    <a class="hide-on-med-and-down">
                        <img src="./images/icon.png" alt="Brand Logo" style="padding-left: 14px; height: 95%; padding-top: 3px" />
                    </a>

                    <a style="cursor: pointer" data-activates="mobile-demo" class="button-collapse"><i class="material-icons">menu</i></a>

                    <ul class="right hide-on-med-and-down">
                        <li v-if="!user"><a href="#registerModal" class="waves-effect waves-light" style="font-family: 'Amaranth', sans-serif; font-size: 20px">Sign Up</a></li>
                        <li v-if="!user"><a href="#loginModal" class="waves-effect waves-light" style="font-family: 'Amaranth', sans-serif; font-size: 20px">Login</a></li>
                        <li v-if="user"><router-link to="/user/dashboard" class="waves-effect waves-light" style="font-family: 'Amaranth', sans-serif; font-size: 20px">DashBoard</router-link></li>
                        <li v-if="user"><a v-on:click="logoutUser" class="waves-effect waves-light" style="font-family: 'Amaranth', sans-serif; font-size: 20px">Logout</a></li>
                    </ul>

                    <ul class="side-nav blue" id="mobile-demo">
                        <li v-if="!user"><a href="#registerModal" class="waves-effect waves-light white-text" style="font-family: 'Amaranth', sans-serif; font-size: 20px">Sign Up</a></li>
                        <li v-if="!user"><a href="#loginModal" class="waves-effect waves-light white-text" style="font-family: 'Amaranth', sans-serif; font-size: 20px">Login</a></li>
                        <li v-if="user"><router-link to="/user/dashboard" class="waves-effect waves-light white-text" style="font-family: 'Amaranth', sans-serif; font-size: 20px">DashBoard</router-link></li>
                        <li v-if="user"><a v-on:click="logoutUser" class="waves-effect waves-light white-text" style="font-family: 'Amaranth', sans-serif; font-size: 20px">Logout</a></li>
                    </ul>
                </div>
            </nav>
        </div>
    `,
    mounted() {
        $(".button-collapse").sideNav({
            draggable: true,
            closeOnClick: true
        });
    },
    methods: {
        logoutUser() {
            store.commit('removeUser');
            window.location.href = '/auth/logout';
        }
    }
});