var Antigo = require("../models/antigo")


module.exports.findById = async (id) => {
    try {
        let antigo = await Antigo.findOne({ _id: id }).exec();

        return antigo;
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching antigo");
    }
};

module.exports.deleteById = async (id) => {
    try {
        let antigo = await Antigo.findOneAndDelete({_id: id}).exec();
		if (!antigo) {
			throw new Error("Antigo not found");
		}

        return antigo
	} catch (error) {
        console.error(error);
        throw new Error("Error fetching antigo");
    }
};

module.exports.insert = antigo => {
    return Antigo.create(antigo)
}
