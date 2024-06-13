var Street = require("../models/street")
var Place = require("../models/place");
var Entity = require("../models/entity");
var Date = require("../models/date");
var Comment = require("../controllers/comment")
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

module.exports.isOwner = async (object_id, user_id, objectModel) => {
    try {
        const object = await objectModel.findOne({_id: object_id}, { owner: 1 }).exec();
        if (!object) {
            throw new Error("Street not found");
        }
        
        if (!object.owner) {a
            return false
        }
        
        return object.owner === user_id;
    } catch (error) {
        console.error("Error checking ownership:", error);
        throw error;
    }
};

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

module.exports.addComment = async (street_id, comment_id) => {
    try {

        const street = await Street.findOne({ _id: street_id }).exec();
        if (!street) {
            throw new Error("Street not found");
        }

        const comments =  await Street.update(
            { _id: street_id},
            { $push: {comments: comment_id}},
            done
        );
        
        return comments[comments.length - 1]

    } catch (error) {
        console.error(error);
        throw new Error("Error adding comment to street" + error);
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

        await Comment.deleteAllFromStreet(id)

        // delete street entry
       return Street.findOneAndDelete({_id: id}).exec();

    } catch (error) {
        console.error(error);
        throw new Error("Error deleting street and related references");
    }
};

module.exports.addFavorite = async (street_id, user_id) => {
    try{
        return await Street.findByIdAndUpdate(
            { _id: street_id },
            { $addToSet: { favorites: user_id }},
            { new: true });
    }
    catch (error){
        console.error( error);
        throw new Error("Error adding favorite", error);
    }
};

module.exports.removeFavorite = async (street_id, user_id) => {
    try {
        return await Street.findByIdAndUpdate(
            { _id: street_id },
            { $pull: { favorites: user_id } },
            { new: true });
    }
    catch (error){
        console.error( error);
        throw new Error("Error removing favorite", error);
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