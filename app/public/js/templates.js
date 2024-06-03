export const dateTemplate = `
    <div class="row g-3 mb-3" id="__ID__">
        <div class="col">
            <input class="form-control" type="text" name="dates" placeholder="Data" required/>
        </div>
        <div class="col">
            <button class="btn btn-danger w-100 deleteDate" data-field-id="__ID__">
                Eliminar
            </button>
        </div>
    </div>`;


export const placeTemplate = `
    <div class="row g-3 mb-3" id="__ID__">
        <div class="col">
            <input class="form-control" type="text" name="places" placeholder="Lugar" required/>
        </div>
        <div class="col">
            <button class="btn btn-danger w-100 deletePlace" data-field-id="__ID__">
                Eliminar
            </button>
        </div>
    </div>`;


export const entityTemplate = `
    <div class="row g-3 mb-3" id="__ID__">
        <div class="col">
            <input class="form-control" type="text" name="entities" placeholder="Entidade" required/>
        </div>
        <div class="col">
            <button class="btn btn-danger w-100 deleteEntity" data-field-id="__ID__">
                Eliminar
            </button>
        </div>
    </div>`;


export const oldImageTemplate = `
    <div class="row g-3 mb-3" id="__ID__">
        <div class="col">
            <input class="form-control" type='text' name='oldImageSubst' placeholder='Referência' required/>
        </div>
        <div class="col">
            <input class="form-control" type="file" name="oldImageFiles" required/>
        </div>
        <div class="col">
            <button class="btn btn-danger w-100 deleteOldImage" type="button" data-field-id="__ID__">
                Eliminar
            </button>
        </div>
    </div>`;


export const newImageTemplate = `
    <div class="row g-3 mb-3" id="__ID__">
        <div class="col">
            <input class="form-control" type='text' name='newImageSubst' placeholder='Referência' required/>
        </div>
        <div class="col">
            <input class="form-control" type="file" name="newImageFiles" required/>
        </div>
        <div class="col">
            <button class="btn btn-danger w-100 deleteNewImage" type="button" data-field-id="__ID__">
                Eliminar
            </button>
        </div>
    </div>`;


export const houseTemplate = `
    <div class="card mb-3 w-100 p-3 border-dark" id="__ID__">
        <div class="row g-3">
            <div class="col">
                <input class="form-control" type="text" name="enfiteuta" placeholder="Enfiteuta" required>
            </div>
            <div class="col">
                <input class="form-control" type="text" name="subst" placeholder="Pagamento" required>
            </div>
            <div class="col">
                <input class="form-control" type="text" name="vista" placeholder="Vista">
            </div>
            <div class="col">
                <button class="btn btn-danger w-100 deleteHouse" data-field-id="__ID__">
                    Eliminar
                </button>
            </div>
        </div>
        <textarea class="form-control mt-3" rows="3" name="desc" placeholder="Descrição" required></textarea>
    </div>`;