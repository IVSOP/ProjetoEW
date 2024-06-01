var Date = require("../models/date")

module.exports.list = () => { // query 
    return Date
        .find()
        .sort({_id:1})
        .exec()
}

module.exports.findById = id => {
    return Date
        .findOne({_id: id})
        .exec()
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