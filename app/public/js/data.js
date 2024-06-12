$(document).ready(function() {


    $('#dataImportButton').click(function() {
        $('#dataImportInput').click();
    });


    $('#dataImportInput').change(function(event) {
        const file = event.target.files[0];
        if (file) $('#dataImportForm').submit();
    });
});