
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/java");

if (localStorage && (!localStorage.getItem('code') || localStorage.getItem('code').length == 0)) {
    let code = {

        'Room.java': [`public class Room {`,
            `   private double width, depth, height;`,
            `   private String textureTop,  textureBottom, textureEast, textureWest, textureSouth, textureNorth;`,
            ``,
            `   public Room() {`,
            `       width = 10;`,
            `       depth = 10;`,
            `       height = 10;`,
            `       textureBottom = "";`,
            `       textureTop = "";`,
            `       textureEast = "";`,
            `       textureWest = "";`,
            `       textureSouth = "";`,
            `       textureNorth = "";`,
            `   }`,
            `}`].join('\n'),

        'Planet.java': [`public class Planet {`,
            `    private double x = 5;`,
            `    private double y = 3;`,
            `    private double z = 5;`,
            `    private double scale = 2;`,
            `    private String model = "https://models.c3d.io/ap_Tutorial/assets/planet2.json";`,
            `}`].join('\n'),

        'Game.java': [`import env3d.Env;`,
            ``,
            `public class Game {`,
            `    private Env env;`,
            `    public void start() {`,
            `        env = new Env();`,
            `        env.setCameraXYZ(5, 5, 35);`,
            `        env.setRoom(new Room());`,
            `        env.addObject(new Planet());`,
            `        env.start();`,
            `    }`,
            `}`].join('\n'),
    };

    localStorage.setItem('code', JSON.stringify(code));
}

let markers = [];
function sendToTranspile() {
    for (i in markers) {	
        editor.session.removeMarker(markers[i]);	
    }
    let finalCode = Object.keys(sessions).map(fileName => {
        return {
            name: fileName,
            code: sessions[fileName].getDocument().getValue()
        }
    });
    finalCode = JSON.stringify(finalCode);

    document.getElementById('run').disabled = true;
    //console.log('transpile: started', finalCode);
    status.innerHTML = 'transpiling...';
    transpile(finalCode).then(js => {
        jsCode = js;
        f.contentWindow.location.reload();
        //console.log('transpile: finished');
        document.getElementById('run').disabled = false;
    }).catch(e => {
        console.log(e);
        alert(e);
        document.getElementById('run').disabled = false;

        //Get all the line numbers and class Names
        let errors = e;
        let numOfErrors = errors.length;
        for (let i = 0; i < numOfErrors; i++) {
            errorDescArr = errors[i].split("\n");
            //console.log(errorDescArr);
            if (errorDescArr.length >= 3) {
                let errorDescArrLength = errorDescArr;
                let errorDescArrClass = errorDescArr;
                let errorLineNumber = "";
                let errorClassName = "";
                for (j in errorDescArr) {
                    if ((errorDescArrLength[j]).split(" ").includes("Line")) {
                        errorLineNumber = errorDescArrLength[j].split(":")[0].split(" ")[1];
                    }
                    if ((errorDescArrClass[j]).split(" ").includes("location:")) {
                        errorClassName = errorDescArrClass[j].split(" ")[(errorDescArrClass[j].split(" ").indexOf("class")) + 1];
                    } else if ((errorDescArrClass[j]).split(" ").includes("class")) {
                        // errorClassName = errorDescArrClass[j].split(" ")[(errorDescArrClass[j].split(" ").indexOf("class")) + 1];
                        errorClassName = "Game";
                    }
                }
                //console.log(errorClassName);
                //Highlight the line number
                document.querySelectorAll('.file').forEach(f => f.classList.remove('selected'));
                let tab = document.getElementById(errorClassName + ".java");
                tab.classList.add('selected');

                var Range = ace.require('ace/range').Range;
                editor.setSession(sessions[errorClassName + '.java']);

                let marker = editor.session.addMarker(
                    new Range(errorLineNumber - 1, 0, errorLineNumber, 0), "highlightError", "line",
                );
                markers.push(marker);
            }
            // console error message
            let message = document.createElement('div');
            message.innerHTML = `<b>${Date().toString().slice(0, 24)}:</b> <span style="color:red"><i><b>${errors[i]}</b></i></span> <br>`;
            document.getElementById('console').prepend(message);
        }
    }).finally(e => {
        document.getElementById('loader').style.display = 'none';
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
            //console.log('clearing ' + editTimeout);
            clearTimeout(editTimeout);
        }
        status.innerHTML = 'typing...';
        editTimeout = setTimeout(sendToTranspile, delay);
    });
}



const launchCode = ['env3d.Env.baseAssetsUrl = "https://env3d.github.io/env3d-js/dist/";',
    'var game = new Game();',
    'parent.window["game"] = game;',
    // This following line is a hack to add some basic lighting
    //    -- really need to rethink this technically as well as pedagogically
    'game.env && game.env.scene ',
    '         && game.env.scene.add(new THREE.HemisphereLight( 0x7f7f7f, 0x000000, 5 ));',
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
    //This is a temporary fix to add some lighting
    addLightAfterTranspile();
});

//Temp Fix to add lighting 
function addLightAfterTranspile() {

    setTimeout(function () {
        window.game.env.scene.add(new f.contentWindow.THREE.HemisphereLight(0x7f7f7f, 0x000000, 4)
        );
    }, 2000);
}

window.addEventListener('message', function (evt) {	
    // if receive message from env3d.html, add to console	
    if (document.location.origin === evt.origin && evt.data && evt.data != "applet onload hook") {	
        let message = document.createElement('div');	
        message.innerHTML = `<b>${Date().toString().slice(0, 24)}:</b> ${evt.data} <br>`;	
        document.getElementById('console').prepend(message);	
    }	
});

function switchSession(tab) {
    let file = tab.innerHTML;
    return () => {
        document.querySelectorAll('.file').forEach(f => f.classList.remove('selected'));
        tab.classList.add('selected');
        editor.setSession(sessions[file]);
    };
}

function createNewTab(file, callback) {
    let tab = document.createElement('div');
    tab.id = file;
    tab.classList.add('file');
    tab.innerHTML = file;
    tab.addEventListener('click', switchSession(tab));
    document.querySelector('#tabs').append(tab);
    switchSession(tab)();
    callback ? callback.call() : null;
}

function addFile(fileName) {
    if (!fileName || fileName.length == 0) return;
    !fileName.endsWith('.java') ? fileName += '.java' : null;
    let className = fileName.slice(0, -5);
    let session = new ace.EditSession('', 'ace/mode/java');
    sessions[fileName] = session;
    session.setValue(`public class ${className} {\n\n}`);
    createNewTab(fileName, () => {
        editor.gotoLine(2, 0);
    });
}

function deleteFile(file) {
    delete sessions[file];
    document.getElementById('tabs')
        .removeChild(document.getElementById(file));
    saveFile();
    let files = Object.keys(sessions);
    editor.setSession(sessions[files[files.length - 1]]);
    document.getElementById(files[files.length - 1]).classList.add('selected');
}

function saveFile() {
    let code = {};
    for (file in sessions) {
        code[file] = sessions[file].getDocument().getValue();
    }
    localStorage.setItem('code', JSON.stringify(code));
}

var sessions = {};
function initSessions() {
    // iterate over all sessions and create tabs for them
    let code = JSON.parse(localStorage.getItem('code'));

    for (file in code) {
        sessions[file] = ace.createEditSession(code[file], 'ace/mode/java');
    }

    for (file in sessions) {
        createNewTab(file);
    }
}

window.addEventListener('keydown', function (evt) {
    if (evt.keyCode == 13 && evt.metaKey) {
        sendToTranspile();
    }
});

document.getElementById('share').addEventListener('click', shareCode);
function shareCode() {
    const shareURL = window.location.origin
        + window.location.pathname
        + '?code='
        + btoa(localStorage.code).replace(/\+/g, '.').replace(/\=/g, '-').replace(/\//g, '_');
    
    var response = $.get('https://share.c3d.io/api.php', {
        action: "shorturl",
        format: "json",
        url: shareURL
    }, function(data) {
        // callback function that will deal with the server response
        // now do something with the data, for instance show new short URL:
        navigator.clipboard.writeText(data.shorturl).then(() => {
            alert(`Sharable URL ${data.shorturl} copied to clipboard`);
        });
    });

    // just in case the shortener is not working
    response.fail( () => {
        navigator.clipboard.writeText(shareURL).then(() => {
            alert('Sharable URL copied to clipboard');
        });        
    });
}

window.addEventListener('load', function (evt) {

    // Check if the files are included in the URL
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const inputCode = urlParams.get("code");
    if (inputCode) {
        // need to decode the base64 url	
        // console.log(inputCode);
        localStorage.setItem('code', atob(inputCode.replace(/\./g, '+').replace(/-/g, '=').replace(/_/g, '/')));
	// strip the code parameter from the url
	history.pushState(null, "", window.location.origin+window.location.pathname);
    }

    initSessions();

    // Send to transpile when first load
    sendToTranspile();

    editor.on('change', () => {
        // save file as we type        
        saveFile();

        // tell user they need to recompile their code
        status.innerHTML = 'source changed, click run (command-enter) to see changes in 3D window';
        run.style.animationName = 'run-required';
    });

    // Experimental: enable transpile as changes are made?
    // transpileAsYouType(3000);    

    function refreshFileList() {
        let filesPanel = document.getElementById('files');
        filesPanel.style.display = 'block';

        let fileListDiv = filesPanel.querySelector('ul');
        fileListDiv.innerHTML = '';

        Object.keys(sessions).forEach(sess => {
            let div = document.createElement('li');
            div.id = 'javaClassName';
            let deleteButton = document.createElement('button');
            deleteButton.innerHTML = 'delete';
            deleteButton.classList.add('delete');
            deleteButton.addEventListener('click', (evt) => {
                if (confirm(`Are you sure you want to delete ${sess}?`)) {
                    deleteFile(sess);
                }

                document.getElementById('files').style.display = 'none';
            });

            div.innerHTML = sess;
            div.append(deleteButton);

            fileListDiv.append(div);
        });

        document.querySelector('#files .delete')
    }

    document.querySelector('.addJavaFile').addEventListener('click', () => {
        refreshFileList();
        document.getElementById('filename').focus();
    });

    document.querySelector('#files .close').addEventListener('click', () => {
        document.getElementById('files').style.display = 'none';
    });

    document.querySelector('#files .add').addEventListener('click', () => {
        addFile(document.getElementById('filename').value);
        document.getElementById('filename').value;
        document.getElementById('files').style.display = 'none';
    });

    document.querySelector('#filename').addEventListener('keyup', evt => {
        if (evt.key == 'Enter') {
            addFile(evt.target.value);
            evt.target.value = '';
            document.getElementById('files').style.display = 'none';
        }
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
    }).then(response => {
        return response.json();
    }).then(json => {
        //console.log(json);
        if (json.applink) {
            window.open().document.location = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&`
                + `data=${host.production}/${json.applink}`;
        }
    });
}

window['editor'] = editor;

// Toggle Console
let consoleToggle = () => {
    let consoleArrows = document.getElementById("consoleArrows");
    document.getElementById("console").classList.toggle("displayConsole");
    if (consoleArrows.className == "fa fa-angle-double-up")
        consoleArrows.className = "fa fa-angle-double-down";
    else
        consoleArrows.className = "fa fa-angle-double-up";
    //resizeEditor();
}

//Expand Output
let expandOutputToggle = () => {
    let outputIframe = document.getElementById("outputIframe");
    let outputContainer = document.getElementById("outputContainer");
    let runBtn = document.getElementById("run");

    if (outputIframe.classList.contains('expandOutputIframe')) {
        runBtn.style.display = "block";
        outputIframe.classList.remove('expandOutputIframe');
        outputContainer.classList.remove('outputContainerPop');
    } else {
        runBtn.style.display = "none";
        outputIframe.classList.add('expandOutputIframe');
        outputContainer.classList.add('outputContainerPop');
    }
}

// Make the editor draggable
$(function () {
    $('#editor').resizable();
});

// var p = document.getElementById('editor');

// function resizeEditor() {
//     p.className = p.className + ' resizable';
//     var resizer = document.createElement('div');
//     resizer.className = 'resizer';
//     p.appendChild(resizer);
//     resizer.addEventListener('mousedown', initDrag, false);
// }

// var startX, startY, startWidth, startHeight;

// function initDrag(e) {
//     startX = e.clientX;
//     startY = e.clientY;
//     startWidth = parseInt(document.defaultView.getComputedStyle(p).width, 10);
//     startHeight = parseInt(document.defaultView.getComputedStyle(p).height, 10);
//     document.documentElement.addEventListener('mousemove', doDrag, false);
//     document.documentElement.addEventListener('mouseup', stopDrag, false);
// }

// function doDrag(e) {
//     p.style.width = (startWidth + e.clientX - startX) + 'px';
//     p.style.height = (startHeight + e.clientY - startY) + 'px';
// }

// function stopDrag(e) {
//     document.documentElement.removeEventListener('mousemove', doDrag, false); 
//     document.documentElement.removeEventListener('mouseup', stopDrag, false);
// }
