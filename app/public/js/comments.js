$(document).ready(function () {

    const token = $('meta[name="csrf-token"]').attr('content');
    const userId = $('meta[name="userId"]').attr('content');
    //setup do token para todos os pedidos ajax
    $.ajaxSetup({
        headers: {
        'Authorization': token
        }
    });

    $('.comments-section').on('click', '.edit-button', function () {
        const commentId = $(this).data('comment-id');

        $(`#comment-text-${commentId}`).hide();
        $(`#comment-textarea-${commentId}`).removeClass('d-none');
        $(`button.submit-button[data-comment-id="${commentId}"]`).removeClass('d-none');
        $(`button.cancel-button[data-comment-id="${commentId}"]`).removeClass('d-none');
        $(`button.edit-button[data-comment-id="${commentId}"]`).hide();
        $(`button.remove-button[data-comment-id="${commentId}"]`).hide();
    });

    $('.comments-section').on('click', '.cancel-button', function () {
        const commentId = $(this).data('comment-id');
        
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

        if (confirmed) {
            $.ajax({
                url: `/comentarios/${commentId}`,
                type: 'DELETE',
                success: function (response) {
                    $(`#comment-banner-${commentId}`).remove(); // apagar o comentário todo
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

        $.ajax({
            url: form.attr('action'),
            type: 'POST',
            data: form.serialize(),
            success: function (response) {
                console.log(response)
                $(`#comment-text-${commentId}`).text(newText).show();
                $(`#comment-text-${commentId}`).data('original-text', newText);

                if (response.updatedAt) {
                    const editedDate = new Date(response.updatedAt).toLocaleString();
                    $(`#comment-date-${commentId}`).html(`${editedDate} (edited)`);
                }

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
    function appendComment(comment, prevCommentOwner=null) {
        // Assuming you have a mixin or template for rendering a single comment
        const commentHtml = `
            <div class="comment d-flex align-items-stretch pt-4 h-100" id="comment-banner-${comment._id}">
                <div class="left-div d-flex flex-column align-items-center pe-3">
                    <img class="profile-icon mb-2" src="/images/default_user_icon.svg" alt="Profile Icon" style="width: 4em; height: auto">
                    <div class="border-start border-secondary flex-grow-1 mb-1 line-end" style="--bs-border-opacity: .5; position: relative;"></div>
                </div>
                <div class="right-div w-100">
                    <form class="card border-dark bg-light mb-0" id="edit-form-${comment._id}" action="/comentarios/${comment._id}" method="post">
                        <div class="card-header d-flex justify-content-between">
                            <div class="header-left">
                                <b>${comment.owner.username}</b>
                                ${prevCommentOwner ? `<i class="bi bi-arrow-right"></i> <span>${prevCommentOwner}</span>` : ''}
                                <br>
                                <small class="text-muted ml-2" id="comment-date-${comment._id}">
                                    ${comment.updatedAt ? new Date(comment.updatedAt).toLocaleString() + ' (edited)' : new Date(comment.createdAt).toLocaleString()}
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
                            <p class="card-text mb-0" id="comment-text-${comment._id}" data-original-text="${comment.text}">${comment.text}</p>
                            <textarea class="form-control d-none" id="comment-textarea-${comment._id}" name="text" rows="3">${comment.text}</textarea>
                            <div class="card-options d-flex justify-content-left mt-3">
                                <button class="btn btn-lg btn-outline-secondary like-button ${comment.likes.includes(userId) ? 'liked' : ''}" type="button" data-comment-id="${comment._id}">
                                    <i class="bi ${comment.likes.includes(userId) ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}"></i>
                                    <span class="ml-1">${comment.likes.length}</span>
                                </button>
                                <button class="btn btn-lg btn-outline-secondary dislike-button ${comment.dislikes.includes(userId) ? 'disliked' : ''}" type="button" data-comment-id="${comment._id}">
                                    <i class="bi ${comment.dislikes.includes(userId) ? 'bi-hand-thumbs-down-fill' : 'bi-hand-thumbs-down'}"></i>
                                    <span class="ml-1">${comment.dislikes.length}</span>
                                </button>
                                <button class="btn btn-lg btn-outline-success reply-button" type="button" data-comment-id="${comment._id}">
                                    Responder
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
        // append new comment html (equivalent to the pug template but in html since page is already loaded!) to page
        $('.comments-section').append(commentHtml);
      }
});