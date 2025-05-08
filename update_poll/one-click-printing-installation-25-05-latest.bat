@echo off
setlocal EnableDelayedExpansion

set version=16.13.0
    
set downloadFolder=C:\Downloads
set "fullPath=C:\Users\%USERNAME%\Downloads\"
set "fullPathDocument=C:\Users\%USERNAME%\Documents\"  


    echo ........................................Download Node Setup................................................. 

    :: Download the Node.js setup file using PowerShell
    powershell -Command "(New-Object System.Net.WebClient).DownloadFile('https://nodejs.org/dist/v%version%/node-v%version%-x64.msi', '%fullPath%node-v%version%-x64.msi')"


    echo Node.js %version% setup file downloaded successfully.

    echo Installing Node.js %version%... 
    msiexec /i %fullPath%node-v%version%-x64.msi /passive

    echo Node.js %version% installation completed.

    del %fullPath%node-v%version%-x64.msi

    echo ........................................Downloading Zip................................................... 
    
	powershell -Command "try { (New-Object System.Net.WebClient).DownloadFile('https://pos.mikronexus.com/pos-installation/pos-printing-server.zip','%fullPathDocument%pos-printing-server.zip') } catch { Write-Host 'Download failed. Attempting to disable SSL/TLS certificate checks.'; [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}; (New-Object System.Net.WebClient).DownloadFile('https://pos.mikronexus.com/pos-installation/pos-printing-server.zip','%fullPathDocument%pos-printing-server.zip') }"

    REM Move the zip file to the Documents folder
    move "%fullPath%pos-printing-server.zip" "%fullPathDocument%"

    echo Zip file moved to Documents folder.

    echo ........................................Download Zip Successfully...................................... %fullPathDocument%

    powershell -Command "Expand-Archive -Path '%fullPathDocument%pos-printing-server.zip' -DestinationPath '%fullPathDocument%pos-printing-server'  -Force"
    
    echo  ........................................Files unzipped successfully........................................


    echo Changing directory to ...
    cd "%fullPathDocument%pos-printing-server"




    
    
    set PATH=%PATH%;C:\Program Files\nodejs
    
    echo ........................................Installing Node.js packages.........................................
    call     "C:\Program Files\nodejs\npm" install 


    echo ........................................Installing Pm2......................................................
    call  "C:\Program Files\nodejs\npm" install -g pm2  



    cd startup_files
    call   "C:\Users\%USERNAME%\AppData\Roaming\npm\pm2" start processes.json
    echo ........................................Pos is Running.......................................................   

    call   "C:\Users\%USERNAME%\AppData\Roaming\npm\pm2" save
    echo ........................................pm2 save.............................................................



    COPY resurrect-server.bat C:\Users\%USERNAME%\Desktop
    COPY reload-pos-server.bat C:\Users\%USERNAME%\Desktop
    COPY pos-server-monitor.bat C:\Users\%USERNAME%\Desktop

    COPY resurrect-server.bat "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"



    echo ........................................Downloading AnyDesk installer........................................
    powershell -Command "(New-Object System.Net.WebClient).DownloadFile('https://download.anydesk.com/AnyDesk.exe', 'AnyDesk.exe')"

    if %errorlevel% equ 0 (
        echo AnyDesk installer downloaded successfully.

        echo Installing AnyDesk...
        msiexec /i ".\AnyDesk.exe" /passive
        echo AnyDesk installation finished.

    ) else (
        echo Failed to download AnyDesk installer.
        exit /b
    )


    COPY AnyDesk.exe C:\Users\%USERNAME%\Desktop

    move AnyDesk.exe "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

    echo ............................. Start Downloading Google Chrome .............................

    powershell -Command "try { (New-Object System.Net.WebClient).DownloadFile('https://dl.google.com/chrome/install/latest/chrome_installer.exe','%fullPath%chrome_installer.exe') } catch { Write-Host 'Download failed. Attempting to disable SSL/TLS certificate checks.'; [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}; (New-Object System.Net.WebClient).DownloadFile('https://dl.google.com/chrome/install/latest/chrome_installer.exe','%fullPath%/chrome_installer.exe') }"

    echo ............................. Download Successfull ........................................    
    :: Install Google Chrome silently
    echo ............................. Installing Google Chrome ....................................
    start /wait "" "%fullPath%\chrome_installer.exe" /silent /install

    :: Check if the installation was successful
    if %errorlevel% equ 0 (
        echo Google Chrome has been installed successfully.
    ) else (
        echo Google Chrome installation failed with error code %errorlevel%.
    )

    set "url=https://web.whatsapp.com/"
    set "shortcut_name=Pos"

    :: Define the directory where the shortcut will be created
    set "shortcut_directory=C:\Users\%USERNAME%\Desktop"

    :: Define the icon file path
    set "icon_path=C:\Users\%USERNAME%\whatsapp.ico"

    :: Create the .url file
    echo [InternetShortcut] > "%shortcut_directory%\%shortcut_name%.url"
    echo URL=%url% >> "%shortcut_directory%\%shortcut_name%.url"
    echo IconFile=%icon_path% >> "%shortcut_directory%\%shortcut_name%.url"
    echo Shortcut created successfully.
