$(document).ready(function() {


    $('#dataImportButton').click(function(event) {
        event.preventDefault();
        $('#dataImportInput').click();
    });


    $('#dataImportInput').change(function(event) {

        if (event.target.files[0]){

            const form = $('#dataImportForm')[0];
            const formData = new FormData(form);
            const progressBar = $('#importModal').find('.progress-bar');
            const modalHeader = $('#importModal').find('.modal-title');

            progressBar.removeClass('bg-success bg-danger');
            progressBar.addClass('progress-bar-striped progress-bar-animated');
            modalHeader.text('Importação em progresso');

            $('#importModalButton').click();

            $.ajax({
                url: form.action,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response){
                    progressBar.toggleClass('progress-bar-striped progress-bar-animated bg-success');
                    modalHeader.text('Importação terminada');
                },
                error: function (error) {
                    console.log(error);
                    progressBar.toggleClass('progress-bar-striped progress-bar-animated bg-danger');
                    importModal.find('.modal-title').text('Importação cancelada');
                }
            });
        }
    });
});