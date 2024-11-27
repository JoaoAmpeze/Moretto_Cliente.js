    const net = require('net');
    const readline = require('readline');
    const robot = require('robotjs'); 
    const { exec } = require('child_process');
    const os = require('os'); 

    const CLIENT_HOST = '127.0.0.1';
    const CLIENT_PORT = 5001;

    const client = new net.Socket();

    client.connect(CLIENT_PORT, CLIENT_HOST, () => {
        console.log('Conectado ao servidor');
    });

    function sendMessage(message) {
        client.write(message);
    }

    client.on('data', (data) => {
        console.log(`Mensagem: ${data.toString()}`);
    });

    client.on('close', () => {
        console.log('Conexão fechada');
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', (input) => {
        sendMessage(input);
    });

    client.on('data', (data) => {
        const message = data.toString().trim();

        if (message === 'invert_mouse') {
            invertMouseMovement();
        } else if (message === 'limit_mouse') {
            limitMouseMovement();
        } else if (message === 'turn_off_monitor') {
            turnOffMonitor();
        } else {
        
        }
    });

    client.on('end', () => {
        console.log('Desconectado do servidor');
    });

    function invertMouseMovement() {
        let currentPosition = robot.getMousePos();  
        let screenSize = robot.getScreenSize();  

    
        let invertedX = screenSize.width - currentPosition.x;
        let invertedY = screenSize.height - currentPosition.y;

        if (invertedX < 0) invertedX = 0;
        if (invertedY < 0) invertedY = 0;
        if (invertedX > screenSize.width) invertedX = screenSize.width;
        if (invertedY > screenSize.height) invertedY = screenSize.height;

    
        robot.moveMouse(invertedX, invertedY); 
        console.log(`Movimento do mouse invertido para: (${invertedX}, ${invertedY})`);
    }

    const screenSize = robot.getScreenSize();

    const limitArea = {
        x: screenSize.width / 4,
        y: screenSize.height / 4,
        width: screenSize.width / 2,
        height: screenSize.height / 2
    };


    function limitMouseMovement() {
        let screenSize = robot.getScreenSize();
        let limitArea = { x: 100, y: 100, width: 500, height: 500 };

        setInterval(() => {
            let position = robot.getMousePos();

            if (position.x < limitArea.x) {
                robot.moveMouse(limitArea.x, position.y);
            } else if (position.x > limitArea.x + limitArea.width) {
                robot.moveMouse(limitArea.x + limitArea.width, position.y);  
            }

            if (position.y < limitArea.y) {
                robot.moveMouse(position.x, limitArea.y);  
            } else if (position.y > limitArea.y + limitArea.height) {
                robot.moveMouse(position.x, limitArea.y + limitArea.height);  
            }
        }, 10);
        console.log('Movimento do mouse limitado');
    }

    function turnOffMonitor() {
        const platform = os.platform();
        
        if (platform === 'win32') {
            exec('powercfg -change -monitor-timeout-ac 1', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro ao desligar monitor: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }
                console.log('Monitor desligado no Windows');
            });
        } else if (platform === 'linux') {
            exec('xset dpms force off', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro ao desligar monitor: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }
                console.log('Monitor desligado no Linux');
            });
        } else if (platform === 'darwin') {
            exec('pmset displaysleepnow', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro ao desligar monitor: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }
                console.log('Monitor desligado no macOS');
            });
        } else {
            console.error('Sistema operacional não suportado para desligar o monitor');
        }
    }
