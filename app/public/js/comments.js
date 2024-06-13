$(document).ready(function () {

    const token = $('meta[name="csrf-token"]').attr('content');

    //setup do token para todos os pedidos ajax
    $.ajaxSetup({
        headers: {
        'Authorization': token
        }
    });

    $('.comments-section').on('click', '.edit-button', function () {
        const commentId = $(this).data('comment-id');

        console.log("Entered edit")

        $(`#comment-text-${commentId}`).hide();
        $(`#comment-textarea-${commentId}`).removeClass('d-none');
        $(`button.submit-button[data-comment-id="${commentId}"]`).removeClass('d-none');
        $(`button.cancel-button[data-comment-id="${commentId}"]`).removeClass('d-none');
        $(`button.edit-button[data-comment-id="${commentId}"]`).hide();
        $(`button.remove-button[data-comment-id="${commentId}"]`).hide();
    });

    $('.comments-section').on('click', '.cancel-button', function () {
        const commentId = $(this).data('comment-id');
        
        console.log("Entered cancel edit")
        
        const originalText = $(`#comment-text-${commentId}`).data('original-text');
        $(`#comment-textarea-${commentId}`).val(originalText).addClass('d-none');
        $(`#comment-text-${commentId}`).show();
        $(`button.submit-button[data-comment-id="${commentId}"]`).addClass('d-none');
        $(`button.cancel-button[data-comment-id="${commentId}"]`).addClass('d-none');
        $(`button.edit-button[data-comment-id="${commentId}"]`).show();
        $(`button.remove-button[data-comment-id="${commentId}"]`).show();
    });
  
    $('.comments-section').on('click', '.remove-button', function () {
        const commentId = $(this).data('comment-id');

        const confirmed = confirm("Tem a certeza que pretende apagar este comentário?");

        console.log("Entered remove comment")

        if (confirmed) {
            $.ajax({
                url: `/comentarios/${commentId}`,
                type: 'DELETE',
                success: function (response) {
                    $(`#edit-form-${commentId}`).remove(); // apagar o comentário todo
                },
                error: function (error) {
                    console.log(error);
                    alert('Error occurred while deleting the comment.');
                }
            });
        }
    });
  
    $('.comments-section').on('click', '.submit-button', function () {
        const commentId = $(this).data('comment-id');
        const newText = $(`#comment-textarea-${commentId}`).val();
        const form = $(`#edit-form-${commentId}`);

        console.log("Entered submitomment")

        $.ajax({
            url: form.attr('action'),
            type: 'POST',
            data: form.serialize(),
            success: function (response) {
                $(`#comment-text-${commentId}`).text(newText).show();
                $(`#comment-text-${commentId}`).data('original-text', newText);
                $(`#comment-textarea-${commentId}`).addClass('d-none');
                $(`button.submit-button[data-comment-id="${commentId}"]`).addClass('d-none');
                $(`button.cancel-button[data-comment-id="${commentId}"]`).addClass('d-none');
                $(`button.edit-button[data-comment-id="${commentId}"]`).show();
                $(`button.remove-button[data-comment-id="${commentId}"]`).show();
            },
            error: function (error) {
              console.log(error);
              alert('An error occurred while updating the comment.');
            }
        });
        console.log("Finished then")
    });

    // dar like
    $('.comments-section').on('click', '.like-button', function () {
        const button = $(this);
        const commentId = button.data('comment-id');
        const icon = button.find('i');
        const isLiked = icon.hasClass('bi-hand-thumbs-up-fill');
        const dislikeButton = $(`button.dislike-button[data-comment-id='${commentId}']`);
        const isDisliked = dislikeButton.find('i').hasClass('bi-hand-thumbs-down-fill'); // ver se botão de dislike está ativo, para atualizar direito em baixo
        $.ajax({
            url: `/comentarios/${commentId}/gostos`,
            type: 'PUT',
            data: JSON.stringify({ // é preciso isto para mandar bool em vez de "true" e "false" !!!!
                "status": !isLiked
            }),
            contentType: 'application/json', // é preciso isto para mandar bool em vez de "true" e "false" !!!!
            success: function (response) {
                console.log(response)
                console.log("Likes: ",response.likes.length, " Disklikes: ",response.dislikes.length)

                icon.toggleClass('bi-hand-thumbs-up bi-hand-thumbs-up-fill');
                button.find('span.ml-1').text(response.likes.length);

                if (isDisliked) { // se antes estava disliked, ao dar like, tenho de atualizar tanto o like como o dislike
                    dislikeButton.find('i').toggleClass('bi-hand-thumbs-down bi-hand-thumbs-down-fill');
                    dislikeButton.find('span.ml-1').text(response.dislikes.length);
                }
            },
            error: function (error) {
                console.log(error);
                alert('An error occurred while liking the comment.');
            }
        });
    });

    // dar dislike
    $('.comments-section').on('click', '.dislike-button', function () {
        const button = $(this);
        const commentId = button.data('comment-id');
        const icon = button.find('i');
        const isDisliked = icon.hasClass('bi-hand-thumbs-down-fill');
        const likeButton = $(`button.like-button[data-comment-id='${commentId}']`);
        const isLiked = likeButton.find('i').hasClass('bi-hand-thumbs-up-fill'); // ver se botão de like está ativo, para atualizar direito em baixo
        $.ajax({
            url: `/comentarios/${commentId}/desgostos`,
            type: 'PUT',
            data: JSON.stringify({ // é preciso isto para mandar bool em vez de "true" e "false" !!!!
                "status": !isDisliked
            }),
            contentType: 'application/json', // é preciso isto para mandar bool em vez de "true" e "false" !!!!
            success: function (response) {
                console.log(response)
                console.log("Likes: ",response.likes.length, " Disklikes: ",response.dislikes.length)
                icon.toggleClass('bi-hand-thumbs-down bi-hand-thumbs-down-fill');
                button.find('span.ml-1').text(response.dislikes.length);

                if (isLiked) { // se antes estava liked, ao dar dislike, tenho de atualizar tanto o like como o dislike
                    likeButton.find('i').toggleClass('bi-hand-thumbs-up bi-hand-thumbs-up-fill');
                    likeButton.removeClass('liked');
                    likeButton.find('span.ml-1').text(response.likes.length);
                }
            },
            error: function (error) {
                console.log(error);
                alert('An error occurred while liking the comment.');
            }
        });
    });

    //submit new comment
    $('.new-comment-form').on('submit', function (e) {
        e.preventDefault(); // prevenir refresh da página
    
        const form = $(this);
    
        $.ajax({
          url: form.attr('action'),
          type: 'POST',
          data: form.serialize(),
          success: function (response) {
            console.log("Got response", response)
            // acrescentar comentário novo à lista de comentários
            appendComment(response)
            form[0].reset();
          },
          error: function (error) {
            console.log(error);
            alert('An error occurred while submitting the comment.');
          }
        });
    });

    //adicionar correspondente de pug de comentário em html
    function appendComment(comment) {
        // Assuming you have a mixin or template for rendering a single comment
        const commentHtml = `
            <form class="card border-dark bg-light mb-0 mt-3 w-100" id="edit-form-${comment._id}" action="/comentarios/${comment._id}" method="post">
            <div class="card-header d-flex justify-content-between">
            <div class="header-left">
                <b>${comment.owner.username}</b>
                <br>
                <small class="text-muted ml-2">
                ${new Date(comment.createdAt).toLocaleString()}
                ${comment.updatedAt ? ' (edited)' : ''}
                </small>
            </div>
            <div class="header-right align-items-center">
                <button class="btn btn-lg edit-button p-2" type="button" data-comment-id="${comment._id}">
                <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-lg remove-button p-2" type="button" data-comment-id="${comment._id}">
                <i class="bi bi-trash-fill"></i>
                </button>
                <button class="btn btn-lg submit-button p-2 d-none" type="button" data-comment-id="${comment._id}">
                <i class="bi bi-check-lg"></i>
                </button>
                <button class="btn btn-lg cancel-button p-2 d-none" type="button" data-comment-id="${comment._id}">
                <i class="bi bi-x-lg"></i>
                </button>
            </div>
            </div>
            <div class="card-body text-dark">
            <p class="card-text" id="comment-text-${comment._id}" data-original-text="${comment.text}">${comment.text}</p>
            <textarea class="form-control d-none" id="comment-textarea-${comment._id}" name="text" rows="3">${comment.text}</textarea>
            ${comment.replies.length > 0 ? `<div class="card border-light bg-light mt-3 ml-3">${comment.replies.map(reply => commentSection(reply)).join('')}</div>` : ''}
            </div>
        </form>
        `
        // append new comment html (equivalent to the pug template but in html since page is already loaded!) to page
        $('.comments-section').append(commentHtml);
      }
});