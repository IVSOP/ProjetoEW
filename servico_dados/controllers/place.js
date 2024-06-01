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

module.exports.deletePlaceById = async (id) => {
    try {
        const place = await Place.findOne({_id: id}).exec();
        if (!place) {
            throw new Error("Place not found");
        }

        if (place.ruas && place.ruas.length > 0) {
            throw new Error("Cant delete place because it has associated streets")
        }

        return Place.findOneAndDelete({_id: id}).exec();
    }
    catch (error) {
        console.error(error)
        throw new Error("Error deleting place")
    }
}