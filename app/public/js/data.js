$(document).ready(function() {


    $('#dataImportButton').click(function(event) {
        event.preventDefault();
        $('#dataImportInput').click();
    });


    $('#dataImportInput').change(function(event) {

        if (event.target.files[0]){

            const form = $('#dataImportForm')[0];
            const formData = new FormData(form);

            $.ajax({
                url: form.action,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response){
                    console.log('File imported successfully:', response);
                },
                error: function (error) {
                    console.log(error);
                    alert('An error occurred while importing file.');
                }
            });
        }
    });
});