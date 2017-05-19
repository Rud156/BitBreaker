Vue.component('about-slider', {
    props: {
        headings: {
            type: Array,
            required: true
        },
        headingText: {
            type: Array,
            required: true
        }
    },
    template: `
        <div class="carousel carousel-slider center" id="aboutSlider" data-indicators="true">
            <div class="carousel-item green darken-3 white-text" href="#one!">
                <h2 style="font-size: 40px;">{{headings[0]}}</h2>
                <div class="white-text infoText">
                    <div class="container">
                        {{headingText[0]}}
                    </div>
                </div>
            </div>
            <div class="carousel-item purple darken-4 white-text" href="#two!">
                <h2 style="font-size: 40px;">{{headings[1]}}</h2>
                <div class="white-text infoText">
                    <div class="container">
                        {{headingText[1]}}
                    </div>
                </div>
            </div>
            <div class="carousel-item orange darken-2 white-text" href="#three!">
                <h2 style="font-size: 40px;">{{headings[2]}}</h2>
                <div class="white-text infoText">
                    <div class="container">
                        {{headingText[2]}}
                    </div>
                </div>
            </div>
        </div>
    `,
    mounted() {
        $('.carousel.carousel-slider').carousel({ fullWidth: true });
        this.sliderInterval = window.setInterval(function () {
            $("#aboutSlider").carousel('next');
        }, 7000);
    },
    beforeDestroy() {
        window.clearInterval(this.sliderInterval);
    },
    data() {
        return {
            sliderInterval: null
        };
    }
});

const HomePage = {
    template: `
        <div>
            <nav-bar :logged-in="false"></nav-bar>

            <login-modal></login-modal>
            <register-modal></register-modal>

            <!-- Start of Quotes Holder -->
            <div class="center">
                <div class="grey darken-3 white-text" style="padding-top: 30px; padding-bottom: 30px">
                    <blockquote class="white-text" style="margin: 0">{{pageQuote.quote}}</blockquote>
                    <div class="container" style="text-align: right">
                        <h4 style="margin: 0">{{pageQuote.author}}</h4>
                    </div>
                </div>
            </div>
            <!-- End of Quotes Holder -->

            <about-slider :headings="headings" :heading-text="headingText"></about-slider>
        </div>
    `,
    mounted() {
        this.fetchQuote();
    },
    methods: {
        fetchQuote() {
            $.ajax({
                dataType: 'json',
                url: 'https://apimk.com/motivationalquotes?get_quote=yes',
                success: (data) => {
                    data = data[0];
                    this.pageQuote = {
                        quote: data.quote,
                        author: '--- ' + data.author_name
                    };
                },
                error: (error) => {
                    messageUtility.handleError(error);
                }
            });
        }
    },
    data() {
        return {
            headings: ['What This Website is About: ', 'How to get started: ', 'Anything Else: '],
            headingText: [
                'This is a simple webiste to break any habit or to keep yourself motivated to do something new...',
                `Just create an account and we'll try to keep you motivated till you complete you're goals...`,
                'We hope that you wil find this website useful and achieve your goals that you set!!!'
            ],
            pageQuote: {
                quote: 'There should be something here. If you\'re seeing this, please wait a moment...',
                author: ''
            }
        };
    }
};