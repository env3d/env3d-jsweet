
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/java");

var code = [`import env3d.Env;`,
            ``,
            `public class Ball {`,
            `    private float x = 5;`,
            `    private float y = 5;`,
            `    private float z = 5;`,
            `    private String texture = "textures/doty.png";`,
            `}`,
            ``,
            `public class Game {`,
            `    public void start() {`,            
            `        Env env = new Env();`,
            `        env.setCameraXYZ(5,5,25);`,
            `        env.addObject(new Ball());`,
            `        env.start();`,
            `    }`,
            `}`].join('\n');

editor.setValue(code, -1);

function sendToTranspile() {    
    status.innerHTML = 'transpiling...';
    document.getElementById('run').disabled = true;
    console.log('transpile: started');    
    transpile(editor.getValue()).then( js => {
        jsCode = js;
        f.contentWindow.location.reload();
        console.log('transpile: finished');
        status.innerHTML = 'ready';
        document.getElementById('run').disabled = false;
    }).catch( e => {
        console.log(e);
        alert(e);
        status.innerHTML = 'ready';
        document.getElementById('run').disabled = false;        
    });;    
}

var jsCode;
let f = document.querySelector('iframe');
let status = document.getElementById('status');

/*
var editTimeout = null;
editor.on('change', () => {
    if (status.innerHTML == 'typing...') {
        console.log('clearing '+editTimeout);
        clearTimeout(editTimeout);
    }
    status.innerHTML = 'typing...';
    editTimeout = setTimeout( sendToTranspile, 3000);        
});
*/

document.getElementById('run').addEventListener('click', sendToTranspile);

f.addEventListener('load', () => {
    let scriptElement = document.createElement('script');

    let launchCode = ['env3d.Env.baseAssetsUrl = "https://env3d.github.io/env3d-js/dist/";',
                      'let game = new Game();',
                      'game.start();',
                      'window.setInterval(game.loop.bind(game), 32);'].join('\n');
    
    let emptyCode = ['env3d.Env.baseAssetsUrl = "https://env3d.github.io/env3d-js/dist/";',
                     'let env = new env3d.Env()',
                     'env.start();'].join('\n');

    let code = ''
    if (!jsCode || jsCode.length == 0) {
        code = emptyCode;
    } else {
        code = jsCode + launchCode;
    }
  
    
    scriptElement.innerHTML = code;

    f.contentDocument.body.append(scriptElement);
});

sendToTranspile();
window['editor'] = editor;
