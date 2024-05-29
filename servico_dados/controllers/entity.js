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

module.exports.deleteEntityById = id => {
    return Entity.findOneAndDelete({
        _id: id
    });
}