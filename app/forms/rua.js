var axios = require('axios');   
const fs = require('fs');
const FormData = require('form-data');


const postImagem = async (multerFile,subst,rota) => {

    try {
        const data = fs.readFileSync(multerFile.path)
        const formData = new FormData()

        formData.append('imagem', data, multerFile.originalname)
        formData.append('subst', subst);

        const response = await axios.post(`http://localhost:3000/${rota}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }})

        fs.unlinkSync(multerFile.path)
        return response.data
    }

    catch (err){
        console.trace()
        return -1
    }
};


module.exports.postImagensAntigas = async (req) => {

    var ids = []

    if (req.files.oldImageFiles){

        if (req.body.oldImageSubst && !Array.isArray(req.body.oldImageSubst)){
            req.body.oldImageSubst = [req.body.oldImageSubst]
        }

        for (let index = 0; index < req.files.oldImageFiles.length; index++){
            let id = await postImagem(
                req.files.oldImageFiles[index],
                req.body.oldImageSubst[index],
                'antigo')
            ids.push({_id: id['_id']})
        }
    }

    return ids
}


module.exports.postImagensAtuais = async (req) => {

    var ids = []

    if (req.files.newImageFiles){

        if (req.body.newImageSubst && !Array.isArray(req.body.newImageSubst)){
            req.body.newImageSubst = [req.body.newImageSubst]
        }

        for (let index = 0; index < req.files.newImageFiles.length; index++){
            let id = await postImagem(
                req.files.newImageFiles[index],
                req.body.newImageSubst[index],
                'atual')
            ids.push({_id: id['_id']})
        }

    }

    return ids
}



module.exports.getRuaForm = (req) => {
    
    var formData = {
        name: req.body.name,
        description: req.body.description.split('\r\n'),
        dates: [],
        places: [],
        entities: [],
        houses: [],
        old_images: [],
        new_images: []
    }

    if (req.body.dates)
        formData.dates = (Array.isArray(req.body.dates))
            ? req.body.dates : [req.body.dates]; 

    if (req.body.places)
        formData.places = (Array.isArray(req.body.places))
            ? req.body.places : [req.body.places]; 

    if (req.body.entities)
        formData.entities = (Array.isArray(req.body.entities))
            ? req.body.entities : [req.body.entities];

    if (Array.isArray(req.body.enfiteuta)){
        for (let index = 0; index < req.body.enfiteuta.length; index++){
            formData.houses.push({
                enfiteuta: req.body.enfiteuta[index],
                subst: req.body.subst[index],
                vista: req.body.vista[index],
                desc: req.body.desc[index].split('\r\n')
            })
        }
    }

    if (req.body.enfiteuta && !Array.isArray(req.body.enfiteuta)){
        formData.houses.push({
            enfiteuta: req.body.enfiteuta,
            subst: req.body.subst,
            vista: req.body.vista,
            desc: req.body.desc.split('\r\n')
        })
    }

    return formData
}