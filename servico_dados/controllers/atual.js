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
