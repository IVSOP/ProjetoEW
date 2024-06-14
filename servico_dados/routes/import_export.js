var express = require('express');
var router = express.Router();
var auth = require('../auth/auth')
const fs = require('fs');
const mime = require('mime-types');
var Antigo = require('../controllers/antigo');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/antigo' })
// const { execSync } = require('child_process');
const { spawn } = require('child_process');

const runScript = (name, args) => {

    return new Promise((resolve, reject) => {

		console.log("A executar export v2");

		// bash <name> <args>
		const scriptArgs = [name].concat(args)

		const script = spawn('bash', scriptArgs);

        script.on('error', (error) => {
            console.error('Error executing script:', error);
            reject(error);
        });

		script.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});

		script.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
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

router.get('/exportar', auth.verificaAcesso(['ADMIN']), function(req, res, next) {
	console.log("A executar export");

	runScript('export.sh', [])
	.then(coisa => {
		res.download('./export.tar', 'export.tar', (err) => {
			if (err) {
				res.status(500).send(`Erro ao enviar ficheiro: ${err.message}`)
			}
		})
	})
	.catch(error => {
		console.log(error)
	})

	// exec('./export.sh', (error, stdout, stderr) => {
	// 	console.log(`stdout: ${stdout}`)
	// 	console.log(`stderr: ${stderr}`)
	// 	if (error) {
	// 	  console.error(`Erro ao exportar: ${error}`);
	// 	  res.status(500).jsonp(`Erro ao exportar: ${error.message}`)
	// 	} else {
	// 		res.download('./export.tar', 'export.tar', (err) => {
	// 			if (err) {
	// 				res.status(500).send(`Erro ao enviar ficheiro: ${err.message}`)
	// 			}
	// 		})
	// 		console.log("funcionou")
	// 	}
	// 	// if (stderr) {
	// 	//   console.error(`Script stderr: ${stderr}`);
	// 	//   return res.status(500).send(`Script stderr: ${stderr}`);
	// 	// }
	// });
	console.log("executadissimo")
})

module.exports = router;

	// try {
	// 	const output = execSync('./export.sh');
	// 	console.log(`output: ${output.toString()}`);
	// 	res.download('./export.tar', 'export.tar', (err) => {
	// 		if (err) {
	// 			res.status(500).send(`Erro ao enviar ficheiro: ${err.message}`)
	// 		}
	// 	})
	// } catch (erro) {
	// 	res.status(500).jsonp(erro);
	// }

