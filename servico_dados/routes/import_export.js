var express = require('express');
var router = express.Router();
var auth = require('../auth/auth')
const fs = require('fs');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const { spawn } = require('child_process');

const runScript = (name, args) => {

    return new Promise((resolve, reject) => {

		// bash <name> <args>
		const scriptArgs = [name].concat(args)

		const script = spawn('bash', scriptArgs);

        script.on('error', (error) => {
            console.error('Error executing script:', error);
            reject(error);
        });

		script.stdout.on('data', (data) => {
			console.log(data);
		});

		script.stderr.on('data', (data) => {
			console.error(data);
		});

        script.on('close', (code) => {
            if (code === 0){
                console.log('script process completed successfully.');
                resolve();
            }
            else{
				console.error('Script exited with code ', code);
                reject(new Error(`script process exited with code ${code}`));
            }
        });
    });
};

router.get('/exportar', auth.verificaAcesso(['ADMIN']),  function(req, res, next) {
	console.log("A executar export");

	runScript('export.sh', [])
	.then(coisa => {
		res.download('./export.tar', 'export.tar', (err) => {
			if (err) {
				res.status(500).jsonp(`Erro ao enviar ficheiro: ${err.message}`)
			}
		})
		console.log("executadissimo")
	})
	.catch(error => {
		console.log(error)
		res.status(500).jsonp(`Erro ao exportar: ${error}`)
	})
})

router.post('/importar', auth.verificaAcesso(['ADMIN']), upload.single('import_file'), function(req, res, next) {
	console.log("A executar import");

	// verificar se e tar????
	let filepath = req.file.path
	// console.log(req.file)

	runScript('import.sh', [filepath])
	.then(coisa => {
		res.status(201).jsonp("Dados importados com sucesso")
	})
	.catch(error => {
		console.log(error)
		res.status(500).jsonp(`Erro ao importar: ${error}`)
	})
})

module.exports = router;
