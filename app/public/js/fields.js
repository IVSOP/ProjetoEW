$(document).ready(function(){

    var lastOldImageId = ($('#oldImagesContainer .row').length);
    var lastHouseId = ($('#housesContainer .card').length);

    var oldImageTemplate = `
        <div class="row g-3 mb-3" id="oldImage__INDEX__">
            <div class="col">
                <input class="form-control" type='text' name='oldImageSubst' placeholder='Referência' required/>
            </div>
            <div class="col">
                <input class="form-control" type="file" name="oldImageFiles" required/>
            </div>
            <div class="col">
                <button class="btn btn-danger w-100 deleteOldImage" type="button" data-field-id="oldImage__INDEX__">
                    Eliminar
                </button>
            </div>
        </div>`;

    var houseTemplate = `
        <div class="card mb-3 w-100 p-3 border-dark" id="house__INDEX__">
            <div class="row g-3">
                <div class="col">
                    <input class="form-control" type="text" name="enfiteuta" placeholder="Enfiteuta" required>
                </div>
                <div class="col">
                    <input class="form-control" type="text" name="subst" placeholder="Pagamento" required>
                </div>
                <div class="col">
                    <input class="form-control" type="text" name="vista" placeholder="Vista" required>
                </div>
                <div class="col">
                    <button class="btn btn-danger w-100 deleteHouse" data-field-id="house__INDEX__">
                        Eliminar
                    </button>
                </div>
            </div>
            <textarea class="form-control mt-3" rows="3" name="descricao" placeholder="Inserir descrição" required></textarea>
        </div>`;


    function addField(container,fieldTemplate,counter) {
        var newField = fieldTemplate.replace(/__INDEX__/g, counter);
        container.append(newField);
    }


    $('#addOldImage').click(function(){
        lastOldImageId++;
        addField($("#oldImagesContainer"),oldImageTemplate,lastOldImageId);
    });
    
    
    $('#addHouse').click(function(){
        lastHouseId++;
        addField($("#housesContainer"),houseTemplate,lastHouseId);
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