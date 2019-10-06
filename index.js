let ob = require('javascript-obfuscator');
const fs = require('fs')
const random = require('random');
let fileExtension = require('file-extension');
let mkdirp = require('mkdirp');

let inputAddress = null;
let outputAddress = `${__dirname}-${random.int(1000,100000000)}/`;

if(process.argv[2] != undefined)
{
	inputAddress = process.argv[2];
}
if(process.argv[3] != undefined)
{
	outputAddress = process.argv[3];
}
if(inputAddress == null)
{
	console.log('You need to specify the folder address');
	process.exit(0);
}
let excludeList = ['node_modules', '.vscode'];

async function obf()
{
	await mkdirp.sync(outputAddress);
	let filesList = DLR(inputAddress, []);
	console.log(filesList);
	filesList.forEach(element =>
	{
		if(fileExtension(element) == 'js')
		{
			fs.readFile(element,'utf8',function (err, data)
			{
				obResult = ob.obfuscate(data);
				let obfCode = obResult.getObfuscatedCode();
				fs.writeFileSync(outputAddress+element, obfCode);
			})
		}
		else
		{
			// copy file
		}
	});
}
obf()

// const JavaScriptObfuscator = require('javascript-obfuscator');
// const fs = require('fs');
// const obfuscate = (fileName) => {
//   fs.readFile(fileName,'utf8', function(err, data) {
//     if (err) {console.log(err)};
//     let obfuscationResult = JavaScriptObfuscator.obfuscate(data);
//     let uglyCode = obfuscationResult.getObfuscatedCode();
//     fs.writeFile('ugly.js', uglyCode, function (err) {
//       if (err) throw err;
//       console.log(`${fileName} has been obfuscated at ugly.js`);
//       });
//     })
// };


function DLR(dir, fileList)
{
	if(dir[dir.length-1] != '/')
	{
		dir += '/';
	}
	let files = fs.readdirSync(dir);
	fileList = fileList || [];
	files.forEach(function (file)
	{
		if(fs.statSync(dir + file).isDirectory())
		{
			let excluded = false;
			for (let index = 0; index < excludeList.length; index++)
			{
				const element = excludeList[index];
				// console.log(element , dir + file);
				if((dir + file).includes(element))
				{
					excluded = true;
					break;
				}	
			}
			if(excluded)
			{
				// console.log('Exclude List', dir);
			}
			else
			{
				fileList = DLR(dir + file + '/', fileList);
			}
		}
		else
		{
			fileList.push(dir+file);
		}
	});
	return fileList;
}