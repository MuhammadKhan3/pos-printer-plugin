@echo off
set version=16.3.0

color 0A
echo ............................................Download Node Setup...............................................
:: Download the Node.js setup file using PowerShell

powershell -Command "(New-Object System.Net.WebClient).DownloadFile('https://nodejs.org/dist/v%version%/node-v%version%-x64.msi', 'node-v%version%-x64.msi')"

    echo ........................................Node.js %version% setup file downloaded successfully..............

    echo ........................................Installing Node.js %version%......................................

    msiexec /i node-v%version%-x64.msi /passive

    echo ........................................Node.js %version% installation completed..........................

    del node-v%version%-x64.msi

    echo ........................................Downloading zip...................................................
	
    powershell -Command "(New-Object System.Net.WebClient).DownloadFile('https://pos.mikronexus.com/pos-installation/pos-printing-server.zip','pos-printing-server.zip')"

    echo ........................................File downloaded successfully...................................... 

    powershell -Command "Expand-Archive -Path 'pos-printing-server.zip'  -Force"
    
    echo ...................................Files unzipped successfully.......................................


    echo ...................................Changing directory to.............................................
    cd  /D  "pos-printing-server"

    


    
    
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

        echo ........................................Installing AnyDesk...................................................
        msiexec /i ".\AnyDesk.exe" /passive
        echo ........................................AnyDesk installation finished........................................

    ) else (
        echo Failed to download AnyDesk installer.
        exit /b
    )


    COPY AnyDesk.exe C:\Users\%USERNAME%\Desktop

    echo ........................................Move AnyDesk In Startup........................................

    move AnyDesk.exe "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

    echo ........................................Successfully Installed........................................
    pause