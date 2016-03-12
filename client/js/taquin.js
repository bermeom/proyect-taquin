var matriz;
var matriz_prueba = [[1,2,3],[4,5,6],[7,8,'*']];

$( document ).ready(function() {
    matriz = matriz_prueba
    renderizarMatriz(matriz);
});

/*
* esta función maneja los eventos de clic de una celda de la tabla
*
* hasta este momento hay un eror y es sí los mueve, pero los vuelve a mover al estado inicial
* ver la consola del navegador.
*/
$(document).on('click', 'td', function(e) {
    var vacio;
    for (var i = 0; i < matriz.length; i++) {
        for (var j = 0; j < matriz[i].length; j++) {
            var text = $(this).text();
            if( matriz[i][j] == text ){
                /*
                *   Tip: haciendo $('.'+matriz[i][j]) ya tiene el elemento que tiene que cambiar
                */
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
});

function llenarMatriz( m ){
    matriz = m;
}

function matrizPrueba( tam ){
    var matrix = [];
    for(var i=0; i<tam; i++) {
        matrix[i] = new Array(tam);
    }
}

function renderizarMatriz( matriz ){
    $('table').empty();
    for (var i = 0; i < matriz.length; i++) {
        var fila = $('<tr>');
        for (var j = 0; j < matriz[0].length; j++) {
            var celda = $('<td>', {
                'text': matriz[i][j],
                'class': matriz[i][j]
            });
            fila.append(celda);
        }
        $('table').append(fila);
    }
}
