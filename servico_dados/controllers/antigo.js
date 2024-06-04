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

module.exports.list = async () => { // query 
    try {
        let lista = await Antigo.find().sort({ _id: 1 }).exec();

		return lista;
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching dates");
    }
}

module.exports.update = async (id,antigo) => {
    try {
        let updatedAntigo = await Antigo.findOneAndUpdate({_id: id}, antigo, {new: true});
        if (!updatedAntigo) {
            throw new Error('antigo not found (update)');
        }
    
        return updatedAntigo;
    
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching antigo");
    }
}