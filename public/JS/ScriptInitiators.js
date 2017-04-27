// Start of default initializations
flatpickr('.flatpickr');

var iFrame = null;
tinymce.init({
    selector: '#bitDescription',
    theme: 'modern',
    plugins: ['image textcolor spellchecker insertdatetime table searchreplace link emoticons colorpicker textcolor autoresize imagetools paste'],
    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright alignjustify | link image | bullist numlist outdent indent | emoticons forecolor`',
    setup: function (editor) {
        editor.on('init', function (e) {
            iFrame = document.getElementById('bitDescription_ifr');
            iFrame = iFrame.contentWindow || iFrame.contentDocument;
        });
    },
    default_link_target: '_blank'
});
// End of default initializations