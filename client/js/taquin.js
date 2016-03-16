var matriz;
var matriz_prueba = [[1,2,3],[4,5,6],[7,8,'*']];


var tam;
$( document ).ready(function() {
    matriz = matriz_prueba
    renderizarMatriz(matriz);
    tam = 3;
    taquin(150,150);
});

function taquin(elemento, lado ){
    // Creates canvas 320 × 200 at 10, 50
    var canvas = Raphael(elemento, lado, lado);

    var element;
    for (var i = 0; i < matriz.length; i++) {
        for (var j = 0; j < matriz.length; j++) {
            canvas.rect(i*50,j*50,50,50);
        }
    }
}

function controladorMatriz( elemento ){
    for (var i = 0; i < matriz.length; i++) {
        for (var j = 0; j < matriz[i].length; j++) {
            if( matriz[i][j] == elemento ){
                var temp='';
                if( i-1>0 && matriz[i-1][j]=='*'){
                    //la posición vacía cambia con el de debajo
                    console.log('mover arriba');
                    temp = matriz[i-1][j];
                    matriz[i-1][j] = matriz[i][j];
                    matriz[i][j] = temp;
                    renderizarMatriz(matriz);
                }else if (j-1>0 && matriz[i][j-1]=='*'){
                    //la posición vacía cambia con el de la derecha
                    console.log('mover izquierda');
                    temp = matriz[i][j-1];
                    matriz[i][j-1] = matriz[i][j];
                    matriz[i][j] = temp;
                    renderizarMatriz(matriz);
                }else if (i+1<matriz.length && matriz[i+1][j]=='*'){
                    //la posición vacía cambia con el de encima
                    console.log('mover abajo');
                    temp = matriz[i+1][j];
                    matriz[i+1][j] = matriz[i][j];
                    matriz[i][j] = temp;
                    renderizarMatriz(matriz);
                }else if (j+1<matriz.length && matriz[i][j+1]=='*'){
                    //la posición vacía cambia con el de la izquierda
                    console.log('mover derecha');
                    temp = matriz[i][j+1];
                    matriz[i][j+1] = matriz[i][j];
                    matriz[i][j] = temp;
                    renderizarMatriz(matriz);
                }else{
                    //reproducir sonido de error
                    console.log('error');
                }
            }
        }
    }
}

function matrizPrueba( tam ){
    var matrix = [];
    for(var i=0; i<tam; i++) {
        matrix[i] = new Array(tam);
    }
}

function renderizarMatriz( matriz ){

}
