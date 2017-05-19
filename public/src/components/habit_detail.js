// TODO: Build this page

const HabitDetails = {
    props: {
        hash: {
            type: String,
            required: true
        }
    },
    template: `
        <div>
        </div>
    `,
    mounted() {
        this.fetchHabit();
    },
    methods: {
        fetchHabit() {
            console.log(this.hash);
            $.ajax({
                type: 'GET',
                url: '/habits/one/' + this.hash,
                success: (data) => {
                    if (data.success) {
                        // Do something here...
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
            maxStreak: null,
            habit: null
        };
    }
};