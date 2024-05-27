var Skeleton = require('../models/skeleton')

module.exports.list = () => {
	return Skeleton
		.find()
		.sort({nome: 1})
		.exec()
}

module.exports.findByName = name => {
	return Skeleton
	// .findOne({id: _id})
		.find({nome: name}) // assim devolve lista
		.exec()
	// erro??????
}

module.exports.insert = skeleton => {
	if (( Skeleton.find( {nome: skeleton.nome} )
		.exec()).length != 1) // se o id ja existe, nao podemos inserir
	{
		var newSkeleton = new Skeleton(skeleton)
		return newSkeleton.save()
	}
	// else erro???????
}

module.exports.update = (nome, skeleton) => {
	if (nome == skeleton.nome) {
		return Skeleton.updateOne({nome: nome}, skeleton)
	}
	// erro?????
}

module.exports.deleteByName = (nome) => {
	return Skeleton.deleteOne({nome: nome})
	// erro?????
}
