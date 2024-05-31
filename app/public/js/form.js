$(document).ready(function() {
    
    $('#updateForm').submit(function(event){
        event.preventDefault();
        var formData = $(this).serializeArray();
        formData.push({name: 'extraData', value: 'extraValue'});
        
        console.log('AJAX')

        $.ajax({
            type: 'POST',
            url: '/your-endpoint',
            data: formData,
            success: function(response) {
                console.log('Response:', response);
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
            }
        });
    });
});