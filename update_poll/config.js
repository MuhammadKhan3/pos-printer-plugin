const fs = require('fs');
const path = require('path');
const fileSys = require('fs-extra');
const directories=require(path.join(__dirname,'directories_path.json'))


async function configurationFiles(directory,source,destination){
    
    isExistFile(directory,source,destination);
    
    for (const file of directory) {
            
            const sourcePath=path.join(source,file)
            const destinationPath=path.join(destination,file)
            
        
            const sourceFile=await readConfig(sourcePath);
            const destinationFile=await readConfig(destinationPath);

            compareConfigs(destinationPath,sourceFile,destinationFile)        
        

    };    

}



async function isExistFile(directory,source,destination){

    let sourceFolder = path.dirname(path.join(source,directory[0]));
    let destinationFolder = path.dirname(path.join(destination,directory[0]));
   
    const sourceFiles=await listFiles(sourceFolder);
    const destinationFiles=await listFiles(destinationFolder);

    sourceFiles.forEach((sourceFile)=>{        

        if (!destinationFiles.includes(sourceFile)) {
            fileSys.copySync(path.join(sourceFolder,sourceFile), path.join(destinationFolder,sourceFile), { overwrite: true });
            directoryUpdate(directories,sourceFile)
        }
    
    })

}


function directoryUpdate(directories,sourceFile){    
    const file=`/config/${sourceFile}`;

    if(!directories['config_version'].find(data=>data==file))
      directories['config_version']?.push(file)
 
    fs.writeFile(path.join(__dirname,'directories_path.json'), JSON.stringify(directories), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to the file:', err);
            return;
        }
        console.log('JSON file has been updated successfully!');
    });

}


async function listFiles(folderPath) {
    const files = await fs.readdirSync(folderPath);
    return files
}

function compareConfigs(destinationPath,remoteConfig, localConfig) {
    try {
        
        const newColumns = [];

        if(Array.isArray(remoteConfig) && Array.isArray(localConfig)){
            
            remoteConfig.forEach((config,index)=>{
                
                for (const [key, value] of Object.entries(config)) {
                    
                    if (!(key in localConfig[index])) {
                        newColumns.push({ key, value });
                    }

                }
            })

        }else{

            for (const [key, value] of Object.entries(remoteConfig)) {
                    
                if (!(key in localConfig)) {
                    newColumns.push({ key, value });
                }

            }

        }
        

        if(Array.isArray(remoteConfig) && Array.isArray(localConfig)){            

            localConfig.forEach(dataObject => {
                newColumns.forEach((column)=>{
                    dataObject[column.key] = column.value;
                })
            });
    
        }else{

            newColumns.forEach(column => {
                localConfig[column.key] = column.value;
            });
        }


        
        fs.writeFileSync(destinationPath, JSON.stringify(localConfig, null, 2), 'utf8', (err) => {});

    } catch (error) {
        console.log("compare Configs Error:",error);
                
    }
    
}


function readConfig(path) {
    return new Promise(async (resolve, reject) => {
        await fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                const jsonData = data ? JSON.parse(data) : {}; // Default to an empty object
                resolve(jsonData);
            }
        });
    });
}

module.exports={configurationFiles}
