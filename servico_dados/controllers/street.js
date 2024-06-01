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

module.exports.insert = async (street) => {
    try {
        const streetObj = await Street.create(street)

        // add street ID to related collections
        await addStreetToCollections(streetObj._id, {
            places: streetObj.places,
            entities: streetObj.entities,
            dates: streetObj.dates
        });

        return streetObj
    } catch (error) {
        console.error(error);
        throw new Error("Error adding new street" + error);
    }
}

module.exports.updateStreet = async (street_id, updatedStreet) => {
    try {
        const previousStreet = await Street.findOne({ _id: street_id }).exec();
        if (!previousStreet) {
            throw new Error("Street not found");
        }
        
        // helper func para obter ids onde adicionar/remover o id desta rua
        const getDifferences = (prev, updated) => {
            const toAdd = updated.filter(id => !prev.includes(id)); // que estão na versão updated mas não estavam antes
            const toRemove = prev.filter(id => !updated.includes(id)); // que desparacerem na versão updated mas havia antes
            return { toAdd, toRemove };
        };

        const placesDiff = getDifferences(previousStreet.places, updatedStreet.places);
        const entitiesDiff = getDifferences(previousStreet.entities, updatedStreet.entities);
        const datesDiff = getDifferences(previousStreet.dates, updatedStreet.dates);

        // add street ID to related collections
        await addStreetToCollections(street_id, {
            places: placesDiff.toAdd,
            entities: entitiesDiff.toAdd,
            dates: datesDiff.toAdd
        });

        await removeStreetFromCollections(street_id, {
            places: placesDiff.toRemove,
            entities: entitiesDiff.toRemove,
            dates: datesDiff.toRemove
        })
        
        return Street.findOneAndUpdate({ _id: street_id }, updatedStreet, { new: true });

    } catch (error) {
        console.error(error);
        throw new Error("Error updating street and related references");
    }
};

module.exports.deleteStreetById = async (id) => {
    try {

        const street = await Street.findOne({_id: id}).exec();
        if (!street) {
            throw new Error("Street not found");
        }

        // remove street ID from related collections
        await removeStreetFromCollections(id, {
            places: street.places,
            entities: street.entities,
            dates: street.dates
        });

        // delete street entry
       return Street.findOneAndDelete({_id: id}).exec();

    } catch (error) {
        console.error(error);
        throw new Error("Error deleting street and related references");
    }
};

//Aux funcs

const addStreetToCollections = async (streetId, collections) => {
    const { places, entities, dates } = collections;

    if (places && places.length > 0) {
        await Place.updateMany(
            { _id: { $in: places } },
            { $addToSet: { ruas: streetId } }
        );
    }

    if (entities && entities.length > 0) {
        await Entity.updateMany(
            { _id: { $in: entities } },
            { $addToSet: { ruas: streetId } }
        );
    }

    if (dates && dates.length > 0) {
        await Date.updateMany(
            { _id: { $in: dates } },
            { $addToSet: { ruas: streetId } }
        );
    }
};

const removeStreetFromCollections = async (streetId, collections) => {
    const { places, entities, dates } = collections;

    if (places && places.length > 0) {
        await Place.updateMany(
            { _id: { $in: places } },
            { $pull: { ruas: streetId } }
        );
    }

    if (entities && entities.length > 0) {
        await Entity.updateMany(
            { _id: { $in: entities } },
            { $pull: { ruas: streetId } }
        );
    }

    if (dates && dates.length > 0) {
        await Date.updateMany(
            { _id: { $in: dates } },
            { $pull: { ruas: streetId } }
        );
    }
};