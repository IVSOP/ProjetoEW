$(document).ready(function () {

    const token = $('meta[name="csrf-token"]').attr('content');

    //setup do token para todos os pedidos ajax
    $.ajaxSetup({
        headers: {
        'Authorization': token
        }
    });

    $('.edit-button').on('click', function () {
        const commentId = $(this).data('comment-id');
        console.log("Entered edit")
        $(this).hide();
        $(`#comment-text-${commentId}`).hide();
        $(`#comment-textarea-${commentId}`).removeClass('d-none');
        $(`button.submit-button[data-comment-id="${commentId}"]`).removeClass('d-none');
        $(`button.cancel-button[data-comment-id="${commentId}"]`).removeClass('d-none');
    });
  
    $('.cancel-button').on('click', function () {
        const commentId = $(this).data('comment-id');
        const originalText = $(`#comment-text-${commentId}`).data('original-text');
        console.log("Entered cancel")
        $(`#comment-textarea-${commentId}`).val(originalText).addClass('d-none');
        $(`#comment-text-${commentId}`).show();
        $(`button.submit-button[data-comment-id="${commentId}"]`).addClass('d-none');
        $(`button.cancel-button[data-comment-id="${commentId}"]`).addClass('d-none');
        $(`button.edit-button[data-comment-id="${commentId}"]`).show();
    });
  
    $('.submit-button').on('click', function () {
        const commentId = $(this).data('comment-id');
        const newText = $(`#comment-textarea-${commentId}`).val();
        const form = $(`#edit-form-${commentId}`);
        console.log("Entered submit")
        $.ajax({
            url: form.attr('action'),
            type: 'POST',
            data: form.serialize(), // serialize form data
            success: function (response) {
                $(`#comment-text-${commentId}`).text(newText).show();
                $(`#comment-text-${commentId}`).data('original-text', newText);
                $(`#comment-textarea-${commentId}`).addClass('d-none');
                $(`button.submit-button[data-comment-id="${commentId}"]`).addClass('d-none');
                $(`button.cancel-button[data-comment-id="${commentId}"]`).addClass('d-none');
                $(`button.edit-button[data-comment-id="${commentId}"]`).show();
            },
            error: function (error) {
              console.log(error);
              alert('An error occurred while updating the comment.');
            }
        });
        console.log("Finished then")
    });

    // $('.comment-form').on('submit', function (e) {
    //     e.preventDefault();
    
    //     const form = $(this);
    //     const commentId = form.attr('action').split('/').pop(); // obter o comment_id do parâmetro id da rota do form
    //     const newText = form.find('textarea[name="comment_text"]').val();
    
    //     //intercetar form de editar comentario com ajax, para n ter de fazer page reload ou redirect
    //     $.ajax({
    //       url: form.attr('action'),
    //       type: 'PUT',
    //       data: form.serialize(), // serialize form data
    //       success: function (response) {
    //         $(`#comment-text-${commentId}`).text(newText).show();
    //         $(`#comment-text-${commentId}`).data('original-text', newText);
    //         $(`#comment-textarea-${commentId}`).addClass('d-none');
    //         $(`button.submit-button[data-comment-id="${commentId}"]`).addClass('d-none');
    //         $(`button.cancel-button[data-comment-id="${commentId}"]`).addClass('d-none');
    //         $(`button.edit-button[data-comment-id="${commentId}"]`).show();
    //       },
    //       error: function (error) {
    //         console.log(error);
    //         alert('An error occurred while updating the comment.');
    //       }
    //     });
    //   });
});