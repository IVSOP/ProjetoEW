var Place = require("../models/place")
var Street = require("../models/street");

module.exports.list = async () => {
    try {
        let places = await Place.find().sort({ name: 1 }).exec();
        // tentei usar "populate" do mongoose, mas não funciona para _ids String
        // acrescentar em cada entrada os dados adicionais de rua para mostrar
        for (let i = 0; i < places.length; i++) {
            let place = places[i].toObject(); // converter mongoose document para JS para ser modificável

            place.ruas = await Promise.all(place.ruas.map(async (ruaId) => {
                const street = await Street.findOne({ _id: ruaId }, { _id: 1, name: 1 }).exec();
                return street;
            }));

            places[i] = place; // precisar das assign explicitamente para array original ser modificado
        }

        return places;
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching places");
    }
}

module.exports.findById = async (id) => {
    try {
        let place = await Place.findOne({ _id: id }).exec();
        place = place.toObject() // preciso converter de mongoose document para javascript para poder modificar!!

        // tentei usar "populate" do mongoose, mas não funciona para _ids String
        // acrescentar dados adicionais de rua para mostrar
        if (place) {
            place.ruas = await Promise.all(place.ruas.map(async ruaId => {
                return Street.findOne({ _id: ruaId }, {_id: 1, name:1}).exec();
            }));
        }
        return place;
        
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching place");
    }
};

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