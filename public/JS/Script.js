/// <reference path="./../javascripts/jquery.d.ts" />
/// <reference path="./../javascripts/knockoutJS.d.ts" />
/// <reference path="./../javascripts/SammyJS.d.ts" />

function handleError(error) {
    console.log(error);
    window.alert("Error Occurred");
}

function getAndSetQuote(quoteBody, quoteAuthor) {
    $.ajax({
        dataType: 'json',
        url: 'https://apimk.com/motivationalquotes?get_quote=yes',
        success: function (data) {
            data = data[0];
            quoteBody.innerText = data.quote;
            quoteAuthor.innerText = '--- ' + data.author_name;
        },
        error: function (error) {
            handleError(error);
        }
    });
}

var quoteBodies = document.getElementsByClassName('quoteBody');
var quoteAuthors = document.getElementsByClassName('quoteAuthor');
for (var i = 0; i < quoteBodies.length; i++)
    getAndSetQuote(quoteBodies[i], quoteAuthors[i]);

