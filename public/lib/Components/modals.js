'use strict';Vue.component('login-modal',{template:'\n        <div id="loginModal" class="modal">\n            <div class="modal-header light-blue darken-1 white-text center" style="padding: 14px; font-family: \'Lobster\', cursive">\n                <h5>Login Here...</h5>\n            </div>\n            <div class="modal-content light-blue darken-4">\n                <div class="row white-text">\n                    <div class="input-field col s12">\n                        <input id="loginUsername" type="text" class="validate" v-model="username">\n                        <label for="loginUsername">User Name: </label>\n                    </div>\n                </div>\n                <div class="row white-text">\n                    <div class="input-field col s12">\n                        <input id="loginPassword" type="password" class="validate" v-model="password">\n                        <label for="loginPassword">Password: </label>\n                    </div>\n                </div>\n                <div class="row">\n                    <button class="waves-effect waves-light btn right z-depth-2" style="margin-right: 14px; background: #e54d03" v-on:click="loginUser">\n                        Login !!!\n                    </button>\n                </div>\n            </div>\n        </div>\n    ',mounted:function mounted(){$('#loginModal').modal()},methods:{loginUser:function loginUser(){var a=this.username,b=this.password;return''===a||''===b?void messageUtility.showMessages('Username and password cannot be blank!!!'):void $.ajax({url:'/auth/login',contentType:'application/json',type:'POST',data:JSON.stringify({username:a,password:b}),success:function success(c){if(c.success){var d=utilityFunctions.stringToTitleCase(c.user.username);userObject={username:d},window.localStorage.setItem('user',userObject.username),$('#loginModal').modal('close'),router.push({path:'user/dashboard'})}else messageUtility.showMessages(c.message)},error:function error(c){messageUtility.handleError(c)}})}},data:function data(){return{username:'',password:''}}}),Vue.component('register-modal',{template:'\n        <div id="registerModal" class="modal">\n            <div class="modal-header light-blue darken-1 white-text center" style="padding: 14px; font-family: \'Lobster\', cursive">\n                <h5>Register Here...</h5>\n            </div>\n            <div class="modal-content light-blue darken-4">\n                <div class="row white-text">\n                    <div class="input-field col s12">\n                        <input id="registerUsername" type="text" class="validate" v-model="username">\n                        <label for="registerUsername">User Name: </label>\n                    </div>\n                </div>\n                <div class="row white-text">\n                    <div class="input-field col s12">\n                        <input id="registerPassword" type="password" class="validate" v-model="password">\n                        <label for="registerPassword">Password: </label>\n                    </div>\n                </div>\n                <div class="row white-text">\n                    <div class="input-field col s12">\n                        <input id="registerRePassword" type="password" class="validate" v-model="rePassword">\n                        <label for="registerRePassword">Re-Enter Password: </label>\n                    </div>\n                </div>\n                <div class="row">\n                    <button class="waves-effect waves-light btn red right z-depth-2" style="margin-right: 14px; background: #e54d03" v-on:click="registerUser">\n                        Register !!!\n                    </button>\n                </div>\n            </div>\n        </div>\n    ',mounted:function mounted(){$('#registerModal').modal()},methods:{registerUser:function registerUser(){var a=this.username,b=this.password,c=this.rePassword;return''===a||''===b||''===c?void messageUtility.showMessages('Username and passwords cannot be blank!!!'):b===c?void $.ajax({url:'/auth/register',contentType:'application/json',type:'POST',data:JSON.stringify({username:a,password:b}),success:function success(d){d.success?($('#registerModal').modal('close'),messageUtility.showMessages('Registeration successful. Please login to continue...')):messageUtility.showMessages(d.message)},error:function error(d){messageUtility.handleError(d)}}):void messageUtility.showMessages('Passwords do not match!!!')}},data:function data(){return{username:'',password:'',rePassword:''}}}),Vue.component('user-prompt-modal',{props:{accept:{type:Function,required:!0},deny:{type:Function,required:!0}},template:'\n        <div id="promptModal" class="modal">\n            <div class="modal-content center">\n                <h5>Do you really want to delete this habit?</h5>\n            </div>\n            <div class="modal-footer">\n                <button class="modal-action waves-effect waves-green btn-flat" @click="deny">No</button>\n                <button class="modal-action waves-effect waves-red btn-flat" @click="accept">Yes</button>\n            </div>\n        </div>\n    ',mounted:function mounted(){$('#promptModal').modal()}}),Vue.component('editor-modal',{template:'\n        <div id="editorModal" class="modal">\n            <div class="modal-header light-blue darken-1 white-text center" style="padding: 14px; font-family: \'Lobster\', cursive">\n                <h5>New Habit</h5>\n            </div>\n            <div class="modal-content purple lighten-1" style="font-family: \'Lobster\', cursive">\n                <div class="row white-text">\n                    <div class="input-field col s12">\n                        <input id="bitTitle" type="text" class="validate" v-model="title">\n                        <label for="bitTitle">Habit Title: </label>\n                    </div>\n                </div>\n                <div class="row white-text">\n                    <div class="col s12 center">\n                        <label for="bitDescription" style="font-size: 1rem">Habit Description:</label>\n                        <br />\n                        <textarea id="bitDescription"></textarea>\n                    </div>\n                </div>\n                <div class="row white-text">\n                    <div class="col s12 center">\n                        <label for="bitEndDate" style="font-size: 1rem">End Date: </label>\n                        <input type="text" class="flatpickr tooltipped white-text" data-position="top" data-tooltip="Click to select date..." id="bitEndDate"\n                            placeholder="Select ending date if the habit is not valid forever..." />\n                    </div>\n                </div>\n                <div class="row white-text">\n                    <div class="col s12 center">\n                        <input type="checkbox" class="filled-in" id="foreverCheck" v-model="foreverCheck" />\n                        <label for="foreverCheck">Is the habit valid forever?</label>\n                    </div>\n                </div>\n            </div>\n            <div class="modal-footer purple">\n                <button class="waves-effect waves-light btn red right z-depth-2" style="margin-right: 14px" v-on:click="saveData">\n                    Save Habit\n                </button>\n            </div>\n        </div>\n    ',mounted:function mounted(){this.initializeModal()},methods:{initializeModal:function initializeModal(){var a=this;$('#editorModal').modal(),flatpickr('.flatpickr'),tinymce.init({selector:'#bitDescription',theme:'modern',plugins:['code advlist image imagetools link colorpicker paste table textcolor emoticons'],toolbar:'undo redo | bold italic | alignleft aligncenter alignright alignjustify | link image | bullist numlist outdent indent | emoticons forecolor',setup:function setup(b){b.on('init',function(){a.iFrame=document.getElementById('bitDescription_ifr'),a.iFrame=a.iFrame.contentWindow||a.iFrame.contentDocument})},default_link_target:'_blank',branding:!1,skin:'lightgray'})},saveData:function saveData(){var a=this,b=this.title,c=this.foreverCheck,d=document.getElementById('bitEndDate').value.trim(),f=this.iFrame.document.body.innerHTML;if(f=encodeURI(f),''===d&&!1===foreverCheck)return void messageUtility.showMessages('You cannot leave both end date and forever checkbox blank. Please select either one...');if(''===b)return void messageUtility.showMessages('Please enter a title to continue...');var g=new Date;g.setUTCHours(0,0,0,0);var h=-1;c||(h=utilityFunctions.dateDiff(g,new Date(d)));var i={title:b,description:f,startDate:g,totalDays:h,forever:c,username:userObject.username};$.ajax({type:'POST',contentType:'application/json',data:JSON.stringify(i),url:'/habits/save',success:function success(j){j.success?(a.title='',a.foreverCheck=!1,a.iFrame.document.body.innerHTML='',document.getElementById('bitEndDate').value='',$('#editorModal').modal('close'),a.$emit('add-new-habit',j.bitBreak)):messageUtility.showMessages(j.message)},error:function error(j){messageUtility.handleError(j)}})}},data:function data(){return{iFrame:null,title:'',foreverCheck:!1}}}),Vue.component('calendar-modal',{props:{success:{type:Boolean,required:!0},dayDescription:{type:String,required:!0},saveData:{type:Function,required:!0}},template:'\n        <div id="calendarModal" class="modal">\n            <div class="modal-header light-blue darken-1 white-text center" style="padding: 14px; font-family: \'Lobster\', cursive">\n                <h5>Edit Day Details</h5>\n            </div>\n            <div class="modal-content purple lighten-1" style="font-family: \'Lobster\', cursive">\n                <div class="row">\n                    <div class="input-field col s12 center">\n                        <input type="checkbox" id="successCheck" class="filled-in" v-model="successCheck" />\n                        <label for="successCheck" style="font-size: 20px">Succeeded</label>\n                    </div>\n                    <div class="input-field col s12">\n                        <textarea id="dailyData" class="materialize-textarea" data-length="120" v-model="quote"></textarea>\n                        <label for="dailyData">Enter Daily Progress Here...</label>\n                    </div>\n                </div>\n            </div>\n            <div class="modal-footer purple">\n                <button class="waves-effect waves-light btn red right z-depth-2" style="margin-right: 14px" @click="saveData(successCheck, quote)">\n                    Save\n                </button>\n            </div>\n        </div>\n    ',mounted:function mounted(){$('#calendarModal').modal(),$('#calendarModal').modal('open')},data:function data(){return{successCheck:this.success,quote:this.dayDescription}}});