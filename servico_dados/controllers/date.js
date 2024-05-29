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

module.exports.deleteDateById = id => {
    return Date.findOneAndDelete({
        _id: id
    });
}