
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/java");

if (localStorage && (!localStorage.getItem('code') || localStorage.getItem('code').length == 0)) {
    let code = {
        'Ball.java': [`public class Ball {`,
                      `    private double x = 5;`,
                      `    private double y = 5;`,
                      `    private double z = 5;`,
                      `    private String texture = "textures/doty.png";`,
                      `}`].join('\n'),
        'Game.java' : [`import env3d.Env;`,
                       ``,
                       `public class Game {`,
                       `    public void start() {`,            
                       `        Env env = new Env();`,
                       `        env.setCameraXYZ(5,5,25);`,
                       `        env.addObject(new Ball());`,
                       `        env.start();`,
                       `    }`,
                       `}`].join('\n')
    };
    
    localStorage.setItem('code', JSON.stringify(code));
}

function sendToTranspile() {    

    let finalCode = Object.keys(sessions).map( fileName => {
        return {
            name: fileName,
            code: sessions[fileName].getDocument().getValue()
        }
    });
    finalCode = JSON.stringify(finalCode);    

    document.getElementById('run').disabled = true;    
    console.log('transpile: started', finalCode);
    status.innerHTML = 'transpiling...';
    transpile(finalCode).then( js => {
        jsCode = js;
        f.contentWindow.location.reload();
        console.log('transpile: finished');
        document.getElementById('run').disabled = false;
    }).catch( e => {
        console.log(e);
        alert(e);
        document.getElementById('run').disabled = false;        
    }).finally( e => {
        status.innerHTML = 'ready';
        run.style.animationName = '';
    });
}

var jsCode;
var tsCode;

let f = document.querySelector('iframe');
let status = document.getElementById('status');
let runButton = document.getElementById('run');

function transpileAsYouType(delay) {
    let editTimeout = null;
    editor.on('change', () => {
        if (status.innerHTML == 'typing...') {
            console.log('clearing '+editTimeout);
            clearTimeout(editTimeout);
        }
        status.innerHTML = 'typing...';
        editTimeout = setTimeout( sendToTranspile, delay);
    });
}



const launchCode = ['env3d.Env.baseAssetsUrl = "https://env3d.github.io/env3d-js/dist/";',
                    'var game = new Game();',
                    'parent.window["game"] = game;',
                    // This following line is a hack to add some basic lighting
                    //    -- really need to rethink this technically as well as pedagogically
                    'game.env && game.env.scene ',
                    '         && game.env.scene.add(new THREE.HemisphereLight( 0x7f7f7f, 0x000000, 2 ));',
                    'game.start();',
                    'window.setInterval(game.loop.bind(game), 32);'].join('\n');

const emptyCode = ['env3d.Env.baseAssetsUrl = "https://env3d.github.io/env3d-js/dist/";',
                   'let env = new env3d.Env()',
                   'env.start();'].join('\n');

document.getElementById('run').addEventListener('click', sendToTranspile);
document.getElementById('makeApp').addEventListener('click', makeApp);

f.addEventListener('load', () => {
    let scriptElement = document.createElement('script');

    let code = ''
    if (!jsCode || jsCode.length == 0) {
        code = emptyCode;
    } else {
        code = jsCode + launchCode;
    }
    
    scriptElement.innerHTML = code;

    f.contentDocument.body.append(scriptElement);
});

window.addEventListener('message', function(evt) {
    // if receive message from env3d.html, add to console
    if (document.location.origin === evt.origin && evt.data) {
        let message = document.createElement('div');
        message.innerHTML = `${Date()}: ${evt.data} <br>`;
        document.getElementById('console').prepend(message);
    }
});

function switchSession(tab) {
    let file = tab.innerHTML;
    return () => {
        document.querySelectorAll('.file').forEach( f => f.classList.remove('selected') );
        tab.classList.add('selected');
        editor.setSession(sessions[file])        
    };
}

function createNewTab(file, callback) {
    let tab = document.createElement('div');
    tab.classList.add('file');
    tab.innerHTML = file;
    tab.addEventListener('click', switchSession(tab));
    document.querySelector('#tabs').append(tab);
    switchSession(tab)();
    callback ? callback.call() : null;
}

var sessions = {};
function initSessions() {
    // iterate over all sessions and create tabs for them
    let code = JSON.parse(localStorage.getItem('code'));
    
    for (file in code) {
        sessions[file] = new ace.EditSession(code[file], 'ace/mode/java');
    }
    
    for (file in sessions) {
        createNewTab(file);
    }
}

window.addEventListener('keydown', function(evt) {
    if (evt.keyCode == 13 && evt.metaKey) {
        sendToTranspile();
    }    
});

window.addEventListener('load', function(evt) {

    initSessions();

    // Send to transpile when first load
    sendToTranspile();


    editor.on('change', () => {
        // save file as we type        
        let code = {};
        for (file in sessions) {
            code[file] = sessions[file].getDocument().getValue();
        }
        localStorage.setItem('code', JSON.stringify(code));

        // tell user they need to recompile their code
        status.innerHTML = 'source changed, click run (command-enter) to see changes in 3D window';
        run.style.animationName = 'run-required';
    });

    // Experimental: enable transpile as changes are made?
    // transpileAsYouType(3000);    
    
    document.querySelector('.addJavaFile').addEventListener('click', () => {
        let fileName = prompt('What is the name of your class?');
        if (!fileName || fileName.length == 0) return;
        
        !fileName.endsWith('.java') ? fileName += '.java' : null;
        let className = fileName.slice(0, -5);
        let session = new ace.EditSession('','ace/mode/java');
        sessions[fileName] = session;
        session.setValue(`public class ${className} {\n\n}`);
        createNewTab(fileName, () => {
            editor.gotoLine(2, 0);
        });
    });
});

// Experimental: Send to app making service 
function makeApp() {
    var host = {
        test: 'http://192.168.0.24:3000/cordova',
        production: 'https://transpile.c3d.io/cordova'
    }
    fetch(host.production, {
        method: 'POST', body: jsCode + launchCode, headers: { 'Content-type': 'text/plain' }        
    }).then( response => {        
        return response.json();
    }).then( json => {
        console.log(json);
        if (json.applink) {
            window.open().document.location = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&`
                                             +`data=${host.production}/${json.applink}`;
        }
    });
}

window['editor'] = editor;
