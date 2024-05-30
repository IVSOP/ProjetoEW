$(document).ready(function(){

    var oldImagesCounter = 1;
    var oldImageTemplate = `
        <div class="row g-3 mt-0" id="oldImage__INDEX__">
            <div class="col">
                <input class="form-control" type='text' name='oldImageSubst__INDEX__' placeholder='Referência' required/>
            </div>
            <div class="col">
                <input class="form-control" type="file" name="oldImageFile__INDEX__" required/>
            </div>
            <div class="col">
                <button class="btn btn-danger w-100 deleteOldImage" type="button" data-field-id="oldImage__INDEX__">
                    Eliminar
                </button>
            </div>
        </div>`;

    var housesCounter = 1;
    var houseTemplate = `
        <div class="card mb-0 mt-3 w-100 p-3 border-dark" id="house__INDEX__">
            <div class="row g-3">
                <div class="col">
                    <input class="form-control" type="text" name="enfiteuta__INDEX__" placeholder="Enfiteuta" required>
                </div>
                <div class="col">
                    <input class="form-control" type="text" name="subst__INDEX__" placeholder="Pagamento" required>
                </div>
                <div class="col">
                    <input class="form-control" type="text" name="vista__INDEX__" placeholder="Vista" required>
                </div>
                <div class="col">
                    <button class="btn btn-danger w-100 deleteHouse" data-field-id="house__INDEX__">
                        Eliminar
                    </button>
                </div>
            </div>
            <textarea class="form-control mt-3" rows="3" name="descricao__INDEX__" placeholder="Inserir descrição" required></textarea>
        </div>`;


    function addField(container,fieldTemplate,counter) {
        var newField = fieldTemplate.replace(/__INDEX__/g, counter);
        container.append(newField);
    }


    $('#addOldImage').click(function(){
        oldImagesCounter++;
        addField($("#oldImagesContainer"),oldImageTemplate,oldImagesCounter);
    });
    
    
    $('#addHouse').click(function(){
        housesCounter++;
        addField($("#housesContainer"),houseTemplate,housesCounter);
    });


    $('#oldImagesContainer').on('click', '.deleteOldImage', function() {
        var fieldId = $(this).data('field-id');
        $('#' + fieldId).remove();
    });


    $('#housesContainer').on('click', '.deleteHouse', function() {
        var fieldId = $(this).data('field-id');
        $('#' + fieldId).remove();
    });
});