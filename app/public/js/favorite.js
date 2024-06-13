$(document).ready(function() {

    $('#favoriteButton').click(function(){
        
        $(this).toggleClass('btn-outline-warning btn-warning');
        var currentValue = ($(this).attr('data-value') === 'true');
        $(this).attr('data-value', (!currentValue).toString());

        $.ajax({
            url: ($(this).attr('action')),
            type: currentValue ? 'DELETE' : 'POST',
            data: {},
            success: function () {},
            error: function (error) {
                console.log(error);
                alert('An error occurred while change favorite.');
            }
        })
    });
});