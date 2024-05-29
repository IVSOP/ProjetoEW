var Place = require("../models/place")

module.exports.list = () => { // query 
    return Place
        .find()
        .sort({name:1}) // sort dos resultados devolvidos por nome crescente
        .exec()
}

module.exports.findById = id => {
    return Place
        .findOne({_id: id})
        .exec()
}

module.exports.insert = place => {
    return Place.create(place)
}

module.exports.updatePlace = (place_id, place) => {
    return Place.findOneAndUpdate({_id: place_id}, place, {new: true})
}

module.exports.deletePlaceById = id => {
    return Place.findOneAndDelete({
        _id: id
    });
}