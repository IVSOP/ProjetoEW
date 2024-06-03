var Atual = require("../models/atual")


module.exports.findById = async (id) => {
    try {
        let atual = await Atual.findOne({ _id: id }).exec();

        return atual;
	} catch (error) {
        console.error(error);
        throw new Error("Error fetching atual");
    }
};

module.exports.deleteById = async (id) => {
    try {
        let atual = await Atual.findOneAndDelete({_id: id}).exec();
		if (!atual) {
			throw new Error("Atual not found");
		}

        return atual
	} catch (error) {
        console.error(error);
        throw new Error("Error fetching atual");
    }
};

module.exports.insert = atual => {
    return Atual.create(atual)
}
