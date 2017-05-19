Vue.component('page-footer', {
    template: `
        <div class="blue darken-4" style="padding: 14px 0; font-family: 'Lobster', cursive">
            <div class="container white-text">
                © 2017 Copyright
                <a href="https://www.github.com/Rud156" target="_blank" class="white-text right"> Desgined with 💗 by: Rud156 </a>
            </div>
        </div>
    `
});

Vue.component('nav-bar', {
    props: {
        loggedIn: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <nav>
            <div class="nav-wrapper blue">
                <a class="brand-logo center" style="font-family: 'Oleo Script', cursive">Bit Breaker</a>
                <a href="#" class="hide-on-med-and-down">
                    <img src="./images/icon.png" alt="Brand Logo" style="padding-left: 14px; height: 95%; padding-top: 3px" />
                </a>

                <a href="#" data-activates="mobile-demo" class="button-collapse"><i class="material-icons">menu</i></a>

                <ul class="right hide-on-med-and-down">
                    <li v-if="!loggedIn"><a href="#registerModal" class="waves-effect waves-light" style="font-family: 'Amaranth', sans-serif; font-size: 20px">Sign Up</a></li>
                    <li v-if="!loggedIn"><a href="#loginModal" class="waves-effect waves-light" style="font-family: 'Amaranth', sans-serif; font-size: 20px">Login</a></li>
                    <li v-if="loggedIn"><router-link v-bind:to="'dashboard'" class="waves-effect waves-light" style="font-family: 'Amaranth', sans-serif; font-size: 20px">DashBoard</router-link></li>
                    <li v-if="loggedIn"><a v-on:click="logoutUser" class="waves-effect waves-light" style="font-family: 'Amaranth', sans-serif; font-size: 20px">Logout</a></li>
                </ul>

                <ul class="side-nav blue" id="mobile-demo">
                    <li v-if="!loggedIn"><a href="#registerModal" class="waves-effect waves-light white-text" style="font-family: 'Amaranth', sans-serif; font-size: 20px">Sign Up</a></li>
                    <li v-if="!loggedIn"><a href="#loginModal" class="waves-effect waves-light white-text" style="font-family: 'Amaranth', sans-serif; font-size: 20px">Login</a></li>
                    <li v-if="loggedIn"><router-link v-bind:to="'dashboard'" class="waves-effect waves-light white-text" style="font-family: 'Amaranth', sans-serif; font-size: 20px">DashBoard</router-link></li>
                    <li v-if="loggedIn"><a v-on:click="logoutUser" class="waves-effect waves-light white-text" style="font-family: 'Amaranth', sans-serif; font-size: 20px">Logout</a></li>
                </ul>
            </div>
        </nav>
    `,
    methods: {
        logoutUser() {
            window.localStorage.removeItem('user');
            window.location.href = '/auth/logout';
        }
    }
});