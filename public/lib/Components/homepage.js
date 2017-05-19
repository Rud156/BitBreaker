'use strict';Vue.component('about-slider',{props:{headings:{type:Array,required:!0},headingText:{type:Array,required:!0}},template:'\n        <div class="carousel carousel-slider center" id="aboutSlider" data-indicators="true">\n            <div class="carousel-item green darken-3 white-text" href="#one!">\n                <h2 style="font-size: 40px;">{{headings[0]}}</h2>\n                <div class="white-text infoText">\n                    <div class="container">\n                        {{headingText[0]}}\n                    </div>\n                </div>\n            </div>\n            <div class="carousel-item purple darken-4 white-text" href="#two!">\n                <h2 style="font-size: 40px;">{{headings[1]}}</h2>\n                <div class="white-text infoText">\n                    <div class="container">\n                        {{headingText[1]}}\n                    </div>\n                </div>\n            </div>\n            <div class="carousel-item orange darken-2 white-text" href="#three!">\n                <h2 style="font-size: 40px;">{{headings[2]}}</h2>\n                <div class="white-text infoText">\n                    <div class="container">\n                        {{headingText[2]}}\n                    </div>\n                </div>\n            </div>\n        </div>\n    ',mounted:function mounted(){$('.carousel.carousel-slider').carousel({fullWidth:!0}),this.sliderInterval=window.setInterval(function(){$('#aboutSlider').carousel('next')},7e3)},beforeDestroy:function beforeDestroy(){window.clearInterval(this.sliderInterval)},data:function data(){return{sliderInterval:null}}});var HomePage={template:'\n        <div>\n            <nav-bar :logged-in="false"></nav-bar>\n\n            <login-modal></login-modal>\n            <register-modal></register-modal>\n\n            <!-- Start of Quotes Holder -->\n            <div class="center">\n                <div class="grey darken-3 white-text" style="padding-top: 30px; padding-bottom: 30px">\n                    <blockquote v-if="pageQuote.quote" class="white-text" style="margin: 0">{{pageQuote.quote}}</blockquote>\n                    <div v-if="pageQuote.author" class="container" style="text-align: right">\n                        <h4 style="margin: 0">{{pageQuote.author}}</h4>\n                    </div>\n                    <div class="container" v-if="!pageQuote.quote">\n                        <circular-spinner></circular-spinner>\n                    </div>\n                </div>\n            </div>\n            <!-- End of Quotes Holder -->\n\n            <about-slider :headings="headings" :heading-text="headingText"></about-slider>\n        </div>\n    ',mounted:function mounted(){this.fetchQuote()},methods:{fetchQuote:function fetchQuote(){var a=this;$.ajax({dataType:'json',url:'https://apimk.com/motivationalquotes?get_quote=yes',success:function success(b){b=b[0],a.pageQuote={quote:b.quote,author:'--- '+b.author_name}},error:function error(b){messageUtility.handleError(b)}})}},data:function data(){return{headings:['What This Website is About: ','How to get started: ','Anything Else: '],headingText:['This is a simple webiste to break any habit or to keep yourself motivated to do something new...','Just create an account and we\'ll try to keep you motivated till you complete you\'re goals...','We hope that you wil find this website useful and achieve your goals that you set!!!'],pageQuote:{quote:null,author:null}}}};