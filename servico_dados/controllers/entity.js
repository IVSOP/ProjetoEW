var Entity = require("../models/entity")

module.exports.list = () => { // query 
    return Entity
        .find()
        .sort({name:1}) // sort dos resultados devolvidos por nome crescente
        .exec()
}

module.exports.findById = id => {
    return Entity
        .findOne({_id: id})
        .exec()
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