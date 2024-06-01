var Street = require("../models/street")
var Place = require("../models/place");
var Entity = require("../models/entity");
var Date = require("../models/date");

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

module.exports.deleteStreetById = async (id) => {
    try {

        const street = await Street.findOne({_id: id}).exec();
        if (!street) {
            throw new Error("Street not found");
        }

        // remove street from places collection
        if (street.places) {
            await Promise.all(street.places.map(async (placeId) => {
                await Place.updateOne(
                    {_id: placeId},
                    {$pull: {ruas: {_id: id}}}
                );
            }));
        }

        // remove street from the entities collection
        if (street.entities) {
            await Promise.all(street.entities.map(async (entityId) => {
                await Entity.updateOne(
                    {_id: entityId},
                    {$pull: {ruas: {_id: id}}}
                );
            }));
        }

        // Remove street from the dates collection
        if (street.dates) {
            await Promise.all(street.dates.map(async (dateId) => {
                await Date.updateOne(
                    {_id: dateId},
                    {$pull: {ruas: {_id: id}}}
                );
            }));
        }

        // delete street entry
       return Street.findOneAndDelete({_id: id}).exec();

    } catch (error) {
        console.error(error);
        throw new Error("Error deleting street and related references");
    }
};