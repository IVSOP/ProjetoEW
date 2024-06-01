var Date = require("../models/date")
var Street = require("../models/street");

module.exports.list = async () => { // query 
    try {
        let dates = await Date.find().sort({ name: 1 }).exec();
        // tentei usar "populate" do mongoose, mas não funciona para _ids String
        // acrescentar em cada entrada os dados adicionais de rua para mostrar
        for (let i = 0; i < dates.length; i++) {
            let date = dates[i].toObject(); // converter mongoose document para JS para ser modificável

            date.ruas = await Promise.all(date.ruas.map(async (ruaId) => {
                const street = await Street.findOne({ _id: ruaId }, { _id: 1, name: 1 }).exec();
                return street;
            }));

            dates[i] = date; // precisar das assign explicitamente para array original ser modificado
        }

        return dates;
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching dates");
    }
}

module.exports.findById = async (id) => {
    try {
        let date = await Date.findOne({ _id: id }).exec();
        date = date.toObject() // preciso converter de mongoose document para javascript para poder modificar!!

        // tentei usar "populate" do mongoose, mas não funciona para _ids String
        // acrescentar dados adicionais de rua para mostrar
        if (date) {
            date.ruas = await Promise.all(date.ruas.map(async ruaId => {
                return Street.findOne({ _id: ruaId }, {_id: 1, name:1}).exec();
            }));
        }
        return date;
        
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching date");
    }
}

module.exports.insert = date => {
    return Date.create(date)
}

module.exports.updateDate = (date_id, date) => {
    return Date.findOneAndUpdate({_id: date_id}, date, {new: true})
}

module.exports.deleteDateById = async (id) => {
    try {
        const date = await Date.findOne({_id: id}).exec();
        if (!date) {
            throw new Error("Date not found");
        }

        if (date.ruas && date.ruas.length > 0) {
            throw new Error("Cant delete date because it has associated streets")
        }

        return Date.findOneAndDelete({_id: id}).exec();
    }
    catch (error) {
        console.error(error)
        throw new Error("Error deleting date")
    }
}