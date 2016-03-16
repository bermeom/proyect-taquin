var matriz;
var matriz_prueba = [[1,2,3],[4,5,6],[7,8,'*']];


var tam;
$( document ).ready(function() {
    matriz = matriz_prueba
    renderizarMatriz(matriz);
    tam = 3;
    taquin(document.getElementById('azul'),150, matriz);
    taquin(document.getElementById('rojo'),150, matriz);
});

var cuadros = new Array();
function taquin(elemento, lado, matriz ){
    // Creates canvas 320 × 200 at 10, 50
    var canvas = Raphael(elemento, lado, lado);

    var element, id, texto, attr;
    var tam = 0;
    for (var i = 0; i < matriz.length; i++) {
        for (var j = 0; j < matriz.length; j++){
            cuadros[i]=canvas.rect(i*50, j*50, 50, 50);
            cuadros[i].attr("fill","blue");
            if( matriz[i][j] == '*' )
                texto = canvas.text(i*50+25,j*50+25,"");
            else
                texto = canvas.text(i*50+25,j*50+25,matriz[i][j]);
            cuadros[i].attr({"text":texto});
            cuadros[i].id="cuadro_"+matriz[i][j];
            cuadros[i].click(clickHandler);
        }
    }
}

function clickHandler(){
    var x = this.getBBox().x;
    var y = this.getBBox().y;
    var texto = this.attr('text');
    console.log(cuadros[0].attr['text']);
    this.animate({x:x+50}, 300);
    texto = canvas.text(i*50+25,j*50+25,matriz[i][j]);

    /*console.log(this);
    console.log(cuadros[3]);
    cuadros[3].animate({x:x+50}, 300);
    /*for( var i = 0; i<tam*tam; i++ ){
        if(cuadros[i].id == this.id){
            cuadros[i].animate({x:x+50, y:y+50}, 1000);
        }
    }*/
}

function mover( elemento ){
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
