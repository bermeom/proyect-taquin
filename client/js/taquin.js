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

function taquin(elemento, lado, matriz ){
    // Creates canvas 320 × 200 at 10, 50
    var canvas = Raphael(elemento, lado, lado);

    var element, id, texto, attr;
    var cuadros = new Array();
    var tam = 0;
    for (var i = 0; i < matriz.length; i++) {
        for (var j = 0; j < matriz.length; j++){
            var elements = canvas.set();
            var element = canvas.rect(i*50,j*50,50,50);
            elements.push(element);
            if( matriz[i][j] == '*' ){
                id = "cuadro_vacio";
                texto = canvas.text(i*50+25, j*50+25, "" ).attr({"fill": "black"});
                elements.attr("fill","blue");
            }else{
                id = "cuadro_"+matriz[i][j];
                texto = canvas.text(i*50+25, j*50+25, matriz[i][j] ).attr({"fill": "black"});
                elements.attr("fill","purple");
            }
            elements.push(texto);
            elements.click(clickHandler);
            tam++;
        }
    }
}

/*var eltext = paper.set();
el = paper.ellipse(0, 0, 30, 20);
text = paper.text(0, 0, "ellipse").attr({fill: '#ff0000'})
eltext.push(el);
eltext.push(text);
eltext.translate(100,100)*/

function clickHandler(){
    this.attr("fill","yellow");
    console.log('id = ' + this.id);
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
