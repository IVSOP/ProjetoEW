var Street = require("../models/street")

module.exports.list = () => { // query 
    return Street
        .find()
        .sort({name:1}) // sort dos resultados devolvidos por nome crescente
        .exec()
}

module.exports.findById = id => {
    return Street
        .findOne({_id: id})
        .exec()
}

module.exports.insert = street => {
    return Street.create(street)
}

module.exports.updateStreet = (street_id, street) => {
    return Street.findOneAndUpdate({_id: street_id}, street, {new: true})
}

module.exports.deleteStreetById = id => {
    return Street.findOneAndDelete({
        _id: id
    });
}