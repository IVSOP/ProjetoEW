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
