let ob = require('javascript-obfuscator');
const fs = require('fs')
const random = require('random');
let fileExtension = require('file-extension');
let mkdirp = require('mkdirp');
let cpfile = require('cp-file');

let inputAddress = null;
let outputAddress = `JPO-${random.int(1000,100000000)}/`;

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
	console.log('You need to specify the input folder address');
	process.exit(0);
}

let excludeList = ['node_modules', '.vscode', '.git','chromData'];
let obOptions = 
{
	identifierNamesGenerator: 'mangled',
	stringArray: false,
	target: 'node',
	selfDefending: true,
	rotateStringArray: true,
	renameGlobals: true,
	compact: true
}

console.log('Configurations:');
console.log(excludeList);
console.log(obOptions);
console.log("Output address" , outputAddress);

async function obf()
{
	mkdirp.sync(outputAddress);
	let filesList = DLR(inputAddress, []);
	filesList.forEach(async function(element)
	{
		if(fileExtension(element) == 'js')
		{
			let data = fs.readFileSync(element,'utf8');
			try
			{
				obResult = ob.obfuscate(data, obOptions);
			}
			catch (error)
			{
				console.log("Obfuscatation error" , error, inputAddress+element);
			}
			let obfCode = obResult.getObfuscatedCode();
			await createFile(outputAddress + element.replace(inputAddress , ''), obfCode);
			// fs.writeFileSync(outputAddress + element, obfCode);
		}
		else
		{
			await cpfile(element, outputAddress+element.replace(inputAddress , ''))
		}
	});
}
obf();

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

async function createFile(fullFileAddress, data)
{
	fs.writeFile(fullFileAddress , data, function (err)
	{
		if(err)
		{
			if(err.code == 'ENOENT')
			{
				// console.error( new Error(`#Space. Can not save file. message: ${err}`) );
				// console.log(fullFileAddress);
			}
			let sliced_address = fullFileAddress.slice(0, fullFileAddress.lastIndexOf('/'));
			mkdirp(sliced_address, (err) =>
			{
				createFile(fullFileAddress, data)
			});
		}
		else
		{
			console.log(fullFileAddress);
		}
	});
}