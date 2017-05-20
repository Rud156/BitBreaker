/// <reference path="./../../javascripts/jquery.d.ts" />

Vue.component('login-modal', {
    template: `
        <div id="loginModal" class="modal">
            <div class="modal-header light-blue darken-1 white-text center" style="padding: 14px; font-family: 'Lobster', cursive">
                <h5>Login Here...</h5>
            </div>
            <div class="modal-content light-blue darken-4">
                <div class="row white-text">
                    <div class="input-field col s12">
                        <input id="loginUsername" type="text" class="validate" v-model="username">
                        <label for="loginUsername">User Name: </label>
                    </div>
                </div>
                <div class="row white-text">
                    <div class="input-field col s12">
                        <input id="loginPassword" type="password" class="validate" v-model="password">
                        <label for="loginPassword">Password: </label>
                    </div>
                </div>
                <div class="row">
                    <button class="waves-effect waves-light btn right z-depth-2" style="margin-right: 14px; background: #e54d03" v-on:click="loginUser">
                        Login !!!
                    </button>
                </div>
            </div>
        </div>
    `,
    mounted() {
        $("#loginModal").modal();
    },
    methods: {
        loginUser() {
            let userName = this.username;
            let password = this.password;
            if (userName === '' || password === '') {
                messageUtility.showMessages('Username and password cannot be blank!!!');
                return;
            }

            $.ajax({
                url: '/auth/login',
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify({ username: userName, password: password }),
                success: (data) => {
                    if (data.success) {

                        let user = utilityFunctions.stringToTitleCase(data.user.username);
                        userObject = { username: user };

                        window.localStorage.setItem('user', userObject.username);
                        $('#loginModal').modal('close');
                        router.push({ path: 'user/dashboard' });
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
            username: '',
            password: ''
        };
    }
});

Vue.component('register-modal', {
    template: `
        <div id="registerModal" class="modal">
            <div class="modal-header light-blue darken-1 white-text center" style="padding: 14px; font-family: 'Lobster', cursive">
                <h5>Register Here...</h5>
            </div>
            <div class="modal-content light-blue darken-4">
                <div class="row white-text">
                    <div class="input-field col s12">
                        <input id="registerUsername" type="text" class="validate" v-model="username">
                        <label for="registerUsername">User Name: </label>
                    </div>
                </div>
                <div class="row white-text">
                    <div class="input-field col s12">
                        <input id="registerPassword" type="password" class="validate" v-model="password">
                        <label for="registerPassword">Password: </label>
                    </div>
                </div>
                <div class="row white-text">
                    <div class="input-field col s12">
                        <input id="registerRePassword" type="password" class="validate" v-model="rePassword">
                        <label for="registerRePassword">Re-Enter Password: </label>
                    </div>
                </div>
                <div class="row">
                    <button class="waves-effect waves-light btn red right z-depth-2" style="margin-right: 14px; background: #e54d03" v-on:click="registerUser">
                        Register !!!
                    </button>
                </div>
            </div>
        </div>
    `,
    mounted() {
        $("#registerModal").modal();
    },
    methods: {
        registerUser() {
            let userName = this.username;
            let password = this.password;
            let rePass = this.rePassword;

            if (userName === '' || password === '' || rePass === '') {
                messageUtility.showMessages('Username and passwords cannot be blank!!!');
                return;
            }
            if (password !== rePass) {
                messageUtility.showMessages('Passwords do not match!!!');
                return;
            }

            $.ajax({
                url: '/auth/register',
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify({ username: userName, password: password }),
                success: (data) => {
                    if (data.success) {
                        $('#registerModal').modal('close');
                        messageUtility.showMessages('Registeration successful. Please login to continue...');
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
            username: '',
            password: '',
            rePassword: ''
        };
    }
});

Vue.component('user-prompt-modal', {
    props: {
        accept: {
            type: Function,
            required: true
        },
        deny: {
            type: Function,
            required: true
        }
    },
    template: `
        <div id="promptModal" class="modal">
            <div class="modal-content center">
                <h5>Do you really want to delete this habit?</h5>
            </div>
            <div class="modal-footer">
                <button class="modal-action waves-effect waves-green btn-flat" @click="deny">No</button>
                <button class="modal-action waves-effect waves-red btn-flat" @click="accept">Yes</button>
            </div>
        </div>
    `,
    mounted() {
        $("#promptModal").modal();
    }
});

Vue.component('editor-modal', {
    template: `
        <div id="editorModal" class="modal">
            <div class="modal-header light-blue darken-1 white-text center" style="padding: 14px; font-family: 'Lobster', cursive">
                <h5>New Habit</h5>
            </div>
            <div class="modal-content purple lighten-1" style="font-family: 'Lobster', cursive">
                <div class="row white-text">
                    <div class="input-field col s12">
                        <input id="bitTitle" type="text" class="validate" v-model="title">
                        <label for="bitTitle">Habit Title: </label>
                    </div>
                </div>
                <div class="row white-text">
                    <div class="col s12 center">
                        <label for="bitDescription" style="font-size: 1rem">Habit Description:</label>
                        <br />
                        <textarea id="bitDescription"></textarea>
                    </div>
                </div>
                <div class="row white-text">
                    <div class="col s12 center">
                        <label for="bitEndDate" style="font-size: 1rem">End Date: </label>
                        <input type="text" class="flatpickr tooltipped white-text" data-position="top" data-tooltip="Click to select date..." id="bitEndDate"
                            placeholder="Select ending date if the habit is not valid forever..." />
                    </div>
                </div>
                <div class="row white-text">
                    <div class="col s12 center">
                        <input type="checkbox" class="filled-in" id="foreverCheck" v-model="foreverCheck" />
                        <label for="foreverCheck">Is the habit valid forever?</label>
                    </div>
                </div>
            </div>
            <div class="modal-footer purple">
                <button class="waves-effect waves-light btn red right z-depth-2" style="margin-right: 14px" v-on:click="saveData">
                    Save Habit
                </button>
            </div>
        </div>
    `,
    mounted() {
        this.initializeModal();
    },
    methods: {
        initializeModal() {
            $('#editorModal').modal();
            flatpickr('.flatpickr');

            tinymce.init({
                selector: '#bitDescription',
                theme: 'modern',
                plugins: ['code advlist image imagetools link colorpicker paste table textcolor emoticons'],
                toolbar: 'undo redo | bold italic | alignleft aligncenter alignright alignjustify | link image | bullist numlist outdent indent | emoticons forecolor',
                setup: (editor) => {
                    editor.on('init', (e) => {
                        this.iFrame = document.getElementById('bitDescription_ifr');
                        this.iFrame = this.iFrame.contentWindow || this.iFrame.contentDocument;
                    });
                },
                default_link_target: '_blank',
                branding: false,
                skin: 'lightgray'
            });
        },
        saveData() {
            let title = this.title;
            let checked = this.foreverCheck;
            let endDate = document.getElementById('bitEndDate').value.trim();

            let description = this.iFrame.document.body.innerHTML;
            description = encodeURI(description);

            if (endDate === '' && foreverCheck === false) {
                messageUtility.showMessages('You cannot leave both end date and forever checkbox blank. Please select either one...');
                return;
            }
            if (title === '') {
                messageUtility.showMessages('Please enter a title to continue...');
                return;
            }

            let startDate = new Date();
            startDate.setUTCHours(0, 0, 0, 0);
            let totalDays = -1;
            if (!checked)
                totalDays = utilityFunctions.dateDiff(startDate, new Date(endDate));

            const dataSet = {
                title,
                description,
                startDate,
                totalDays,
                forever: checked,
                username: userObject.username
            };

            $.ajax({
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(dataSet),
                url: '/habits/save',
                success: (data) => {
                    if (data.success) {
                        this.title = '';
                        this.foreverCheck = false;
                        this.iFrame.document.body.innerHTML = '';
                        document.getElementById('bitEndDate').value = '';

                        $('#editorModal').modal('close');
                        this.$emit('add-new-habit', data.bitBreak);
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
            iFrame: null,
            title: '',
            foreverCheck: false
        };
    }
});

Vue.component('calendar-modal', {
    props: {
        success: {
            type: Boolean,
            required: true
        },
        dayDescription: {
            type: String,
            required: true
        },
        saveData: {
            type: Function,
            required: true
        }
    },
    template: `
        <div id="calendarModal" class="modal">
            <div class="modal-header light-blue darken-1 white-text center" style="padding: 14px; font-family: 'Lobster', cursive">
                <h5>Edit Day Details</h5>
            </div>
            <div class="modal-content purple lighten-1" style="font-family: 'Lobster', cursive">
                <div class="row">
                    <div class="input-field col s12 center">
                        <input type="checkbox" id="successCheck" class="filled-in" v-model="successCheck" />
                        <label for="successCheck" style="font-size: 20px">Succeeded</label>
                    </div>
                    <div class="input-field col s12">
                        <textarea id="dailyData" class="materialize-textarea" data-length="120" v-model="quote"></textarea>
                        <label for="dailyData">Enter Daily Progress Here...</label>
                    </div>
                </div>
            </div>
            <div class="modal-footer purple">
                <button class="waves-effect waves-light btn red right z-depth-2" style="margin-right: 14px" @click="saveData(successCheck, quote)">
                    Save
                </button>
            </div>
        </div>
    `,
    mounted() {
        $('#calendarModal').modal();
        $('#calendarModal').modal('open');
    },
    data() {
        return {
            successCheck: this.success,
            quote: this.dayDescription
        };
    }
});