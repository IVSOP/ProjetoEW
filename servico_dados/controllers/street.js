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

        // add street id to places collection
        if (streetObj.places && streetObj.places.length > 0) {
            await Place.updateMany(
                { _id: { $in: streetObj.places } },
                { $addToSet: { ruas: streetObj._id } }
            );
        }

        // add street id to places collection
        if (streetObj.entities && streetObj.entities.length > 0) {
            await Entity.updateMany(
                { _id: { $in: streetObj.entities } },
                { $addToSet: { ruas: streetObj._id } }
            );
        }

        // add street id to dates collection
        if (streetObj.dates && streetObj.dates.length > 0) {
            await Date.updateMany(
                { _id: { $in: streetObj.dates } },
                { $addToSet: { ruas: streetObj._id } }
            );
        }
        
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

        // update places collection
        if (placesDiff.toAdd.length > 0) {
            await Place.updateMany(
                { _id: { $in: placesDiff.toAdd } },
                { $addToSet: { ruas: street_id } }
            );
        }
        if (placesDiff.toRemove.length > 0) {
            await Place.updateMany(
                { _id: { $in: placesDiff.toRemove } },
                { $pull: { ruas: street_id } }
            );
        }

        // update entities collection
        if (entitiesDiff.toAdd.length > 0) {
            await Entity.updateMany(
                { _id: { $in: entitiesDiff.toAdd } },
                { $addToSet: { ruas: street_id } }
            );
        }
        if (entitiesDiff.toRemove.length > 0) {
            await Entity.updateMany(
                { _id: { $in: entitiesDiff.toRemove } },
                { $pull: { ruas: street_id } }
            );
        }

        // update dates collection
        if (datesDiff.toAdd.length > 0) {
            await Date.updateMany(
                { _id: { $in: datesDiff.toAdd } },
                { $addToSet: { ruas: street_id } }
            );
        }
        
        if (datesDiff.toRemove.length > 0) {
            await Date.updateMany(
                { _id: { $in: datesDiff.toRemove } },
                { $pull: { ruas: street_id } }
            );
        }

        const updated = await Street.findOneAndUpdate({ _id: street_id }, updatedStreet, { new: true });

        return updated;
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

        // remove street from places collection
        if (street.places && street.places.length > 0) {
            await Place.updateMany(
                { _id: { $in: street.places } },
                { $pull: { ruas: id } }
            );
        }


        // remove street from entities collection
        if (street.entities && street.entities.length > 0) {
            await Entity.updateMany(
                { _id: { $in: street.entities } },
                { $pull: { ruas: id } }
            );
        }

        // remove street from dates collection
        if (street.dates && street.dates.length > 0) {
            await Date.updateMany(
                { _id: { $in: street.dates } },
                { $pull: { ruas: id } }
            );
        }

        // delete street entry
       return Street.findOneAndDelete({_id: id}).exec();

    } catch (error) {
        console.error(error);
        throw new Error("Error deleting street and related references");
    }
};