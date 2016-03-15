var matriz;
var matriz_prueba = [[1, 2, 3], [4, 5, 6], [7, 8, '*']];

//objetos canvas, cv es el canvas que contiene los canvas, cx es para modificar las propiedades de los canvas
//objetosCanvas es un arreglo que contiene los canvas
var cv, cx, objetosCanvas, objetoActual=null, texto;

//cuando se cargue la página, se llama a la función main
$(document).ready(main);

//función main
function main() {

    matriz = matriz_prueba //asigna la matriz

    cv = document.getElementById('lienzo'); //lienzo es un canvas que contendrá los canvas
    cx = cv.getContext('2d');

    renderizarMatriz(matriz); //modifica la tabla del html, según la matriz

    cv.onmousedown = function (event) {
        //obtener las coordenadas del click y compararlas con las coordenadas de los canvas, para obtener el texto del canvas a mover
        for (var i = 0; i < objetosCanvas.length; i++) {
            if (objetosCanvas[i].x+8 < event.clientX && (objetosCanvas[i].width + objetosCanvas[i].x + 8 > event.clientX)
                && objetosCanvas[i].y+8 < event.clientY && (objetosCanvas[i].height + objetosCanvas[i].y + 8 > event.clientY)) {
                objetoActual = objetosCanvas[i];
                console.log(objetosCanvas[i].texto);
                texto = objetosCanvas[i].texto;
                break;
            }
        }
        mover(texto)
    }

    //movimento('arriba')
    //movimento('izquierda')
    //movimento('izquierda')
    //movimento('arriba')
    //movimento('derecha')
    //movimento('abajo')

}

//asigna una matriz
function llenarMatriz( m ){
    matriz = m;
}

//crea la matriz
function matrizPrueba( tam ){
    var matrix = [];
    for(var i=0; i<tam; i++) {
        matrix[i] = new Array(tam);
    }
}

//modifica la tabla del html, según la matriz
function renderizarMatriz(matriz) {

    objetosCanvas = []; //elimina los canvas del arreglo
    for (var i = 0; i < matriz.length; i++) {
        for (var j = 0; j < matriz[0].length; j++) {

            //llena el arreglo de canvas
            objetosCanvas.push({
                x: (i * 50), y: (j * 50),
                width: 46, height: 46,
                color: '#009688',
                texto: matriz[j][i]
            });

        }
    }

    //borra el cuadro de canvas y pone los canvas en el cuadro de canvas
    actualizarCanvas();
}


//borra el cuadro de canvas y pone los canvas en el cuadro de canvas
function actualizarCanvas() {

    cx.clearRect(0, 0, Math.sqrt(objetosCanvas.length) * 50+4, Math.sqrt(objetosCanvas.length) * 50+4);//limpia el
    cx.fillStyle = '#B2DFDB';//modifica el color del canvas padre, no funciona?????, además dibuja borde ??????
    cx.strokeRect(0, 0, Math.sqrt(objetosCanvas.length) * 50 + 4, Math.sqrt(objetosCanvas.length) * 50 + 4); //modifica el tamaño cavas adra de acuerdo al tam de la matriz

    for (var i = 0; i < objetosCanvas.length; i++) {

        cx.fillStyle = objetosCanvas[i].color;
        if (objetosCanvas[i].texto=='*') { //en caso de tener texto=*, utilizar otro color
            cx.fillStyle = '#B2DFDB';
        }
        cx.fillRect(objetosCanvas[i].x+4, objetosCanvas[i].y+4, objetosCanvas[i].width, objetosCanvas[i].height);
        //cx.strokeStyle = '#B2DFDB'; // Definimos el color para pintar el borde
        //cx.lineWidth = 5;
        //cx.strokeRect((objetosCanvas[i].x+2), (objetosCanvas[i].y+2), 50, 50);

        cx.font = "bold 10pt Helvetica";
        cx.fillStyle = '#B2DFDB';
        cx.textAlign = "center";
        cx.fillText(objetosCanvas[i].texto, (objetosCanvas[i].x+26), (objetosCanvas[i].y+29));
    }
}

function mover(texto) {

    var estado = 0;

    //Fila i+1
    for (var i = 0; i < matriz.length; i++) {
        //Columna j+1
        for (var j = 0; j < matriz[i].length; j++) {

            if (Boolean(estado) == true) {
                break;
            }

            if (matriz[i][j] == texto) {
                /*
                *   Tip: haciendo $('.'+matriz[i][j]) ya tiene el elemento que tiene que cambiar
                */

                var temp = '';
                if (i > 0 && matriz[i - 1][j] == '*') {
                    //la posición vacía cambia con el de debajo
                    console.log('mover arriba');
                    temp = matriz[i - 1][j]; //guarda el asterizco
                    matriz[i - 1][j] = matriz[i][j]; //reemplaza el asterizco
                    matriz[i][j] = temp; //asigna el asterizco

                    //animacionCanvas(matriz[i][j], ((i - 1)*50), (j*50), temp, (i*50), (j*50));

                    renderizarMatriz(matriz);
                    estado = 1;
                    break;
                } else if (j > 0 && matriz[i][j - 1] == '*') {
                    //la posición vacía cambia con el de la derecha
                    console.log('mover izquierda');
                    temp = matriz[i][j - 1];
                    matriz[i][j - 1] = matriz[i][j];
                    matriz[i][j] = temp;

                    //animacionCanvas(matriz[i][j], (i * 50), ((j - 1) * 50), temp, (i * 50), (j * 50));

                    renderizarMatriz(matriz);
                    estado = 1;
                    break;
                } else if (i+1 < matriz.length && matriz[i + 1][j] == '*') {
                    //la posición vacía cambia con el de encima
                    console.log('mover abajo');
                    temp = matriz[i + 1][j];
                    matriz[i + 1][j] = matriz[i][j];
                    matriz[i][j] = temp;

                    //animacionCanvas(matriz[i][j], ((i + 1) * 50), (j * 50), temp, (i * 50), (j * 50), 'abajo');

                    renderizarMatriz(matriz);
                    estado = 1;
                    break;
                } else if (j+1 < matriz.length && matriz[i][j + 1] == '*') {
                    //la posición vacía cambia con el de la izquierda
                    console.log('mover derecha');
                    temp = matriz[i][j + 1];
                    matriz[i][j + 1] = matriz[i][j];
                    matriz[i][j] = temp;

                    //animacionCanvas(matriz[i][j], (i * 50), ((j + 1) * 50), temp, (i * 50), (j * 50));

                    renderizarMatriz(matriz);
                    estado = 1;
                    break;
                } else {
                    //reproducir sonido de error
                    console.log('error');
                    estado = 1;
                    break;
                }
            }
        }
    }

}

//animación de movimiento del canvas
function animacionCanvas(texto1, x1, y1, texto2, x2, y2, movimiento) {

    if (movimiento == 'abajo') {
        console.log('canvas abajo');
        for (var i = 0; i < 5; i++) {

            var tiempo = new Date().getTime();

            function sleep() {
                var currentTime = new Date().getTime();
                currentTime = currentTime + 2000;
                console.log(tiempo);
                console.log(currentTime);
                while (currentTime > tiempo) {
                    tiempo = new Date().getTime();
                    console.log(tiempo);
                }
            }
            console.log(i);
            cx.strokeRect(x1, y1, 50, 100);
            cx.fillStyle = '#B2DFDB';

            cx.strokeRect(x1, (y1*(i*25)), 50, 50);
            cx.fillStyle = '#009688';
            cx.fillText(texto1, (x1 + 26), (y1 + 29));
        }
    }

    /*
    for (var i = 0; i < objetosCanvas.length; i++) {

        if (texto1 == objetosCanvas[i].texto) {
            cx.clearRect(0,0,600,200);

            cx.strokeRect(x1, y1, 50, 50);
        }

    }

    for (var i = 0; i < objetosCanvas.length; i++) {

        if (texto2 == objetosCanvas[i].texto) {
            //cx.empty

            cx.strokeRect(x2, y2, 50, 50);
        }

    }*/

}

function mover_numero(numero){
    mover(numero);
}

//llega dirección de movimiento -> número
function mover_direccion(direccion){
    var i, j;
    for (i = 0; i < matriz.length; i++) {
        for (j = 0; j < matriz.length; j++) {
            if( matriz[i][j] == '*' ){
                switch(direccion) {
                    case 'arriba':
                        if( i-1 >= 0)
                            mover(matriz[i-1][j], matriz);
                        break;
                    case 'abajo':
                        if( i+1 < matriz.length)
                            mover(matriz[i+1][j], matriz);
                        break;
                    case 'derecha':
                        if( j+1 < matriz.length)
                            mover(matriz[i][j+1], matriz);
                        break;
                    case 'izquierda':
                        if( j-1 >= 0)
                            mover(matriz[i][j-1], matriz);
                        break;
                    default:
                        console.log('error');
                }
                return;
            }
        }
    }
}
