var Entity = require("../models/entity")
var Street = require("../models/street");

module.exports.list = async () => { // query 
    try {
        let entities = await Entity.find().sort({ name: 1 }).exec();
        // tentei usar "populate" do mongoose, mas não funciona para _ids String
        // acrescentar em cada entrada os dados adicionais de rua para mostrar
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i].toObject(); // converter mongoose document para JS para ser modificável

            entity.ruas = await Promise.all(entity.ruas.map(async (ruaId) => {
                const street = await Street.findOne({ _id: ruaId }, { _id: 1, name: 1 }).exec();
                return street;
            }));

            entities[i] = entity; // precisar das assign explicitamente para array original ser modificado
        }

        return entities;
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching entities");
    }
}

module.exports.findById = async (id) => {
    try {
        let entity = await Entity.findOne({ _id: id }).exec();
        entity = entity.toObject() // preciso converter de mongoose document para javascript para poder modificar!!

        // tentei usar "populate" do mongoose, mas não funciona para _ids String
        // acrescentar dados adicionais de rua para mostrar
        if (entity) {
            entity.ruas = await Promise.all(entity.ruas.map(async ruaId => {
                return Street.findOne({ _id: ruaId }, {_id: 1, name:1}).exec();
            }));
        }
        return entity;
        
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching entity");
    }
}

module.exports.insert = entity => {
    return Entity.create(entity)
}

module.exports.updateEntity = (entity_id, entity) => {
    return Entity.findOneAndUpdate({_id: entity_id}, entity, {new: true})
}

module.exports.deleteEntityById = async (id) => {
    try {
        const entity = await Entity.findOne({_id: id}).exec();
        if (!entity) {
            throw new Error("Entity not found");
        }

        if (entity.ruas && entity.ruas.length > 0) {
            throw new Error("Cant delete entity because it has associated streets")
        }

        return Entity.findOneAndDelete({_id: id}).exec();
    }
    catch (error) {
        console.error(error)
        throw new Error("Error deleting entity")
    }
}