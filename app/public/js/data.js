$(document).ready(function() {


    $('#dataImportButton').click(function() {
        console.log('ola')
        $('#dataImportInput').click();
    });


    $('#dataImportInput').change(function(event) {
        const file = event.target.files[0];
        if (file) $('#dataImportForm').submit();
    });
});