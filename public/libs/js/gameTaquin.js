var $pwidth=500;
var $pheight=500;
var $delta=5;
var $width;
var $height;
var $boardPlayOpponent;
var $stageOpponent;
var $boardOpponent;
var $textMsnOpponent;
var $boardPlay;
var $stage ;
var $board;
var $textMsn;
var $queueFileM;
var finished=false;
function init() {
  console.log("INI");
  $stage = new createjs.Stage("myTaquin");
  $board = new createjs.Container();
  $textMsn = new createjs.Text("", "bold 40px sans-serif", "#FFFFFF");
  $textMsnOpponent = new createjs.Text("", "bold 40px sans-serif", "#FFFFFF");
  $stageOpponent = new createjs.Stage("taquinOpponent");
  $boardOpponent = new createjs.Container();
  //generateBoard(10,$pwidth,$pheight);
  //generateBoardOpponent(10,$pwidth,$pheight);
  $textMsn.alpha=0;
  $textMsnOpponent.alpha=0;
  $stage.addChild($textMsn);
  //messagePlusOne($textMsn,"+1",$pwidth,$pheight,30);
  //messageResult($textMsnOpponent,"LOSE !!",$pwidth,$pheight,0);
  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", $stage);
  createjs.Ticker.addEventListener("tick", $stageOpponent);
  console.log("end INI");
  /*
  swapFileBoard(0,1,0,0);
  swapFileBoard(1,1,0,1);
  swapFileBoard(1,0,1,1);
  //swapFileBoard(0,0,1,0);
  swapFileBoardOpponent(1,0,0,0);
  */

}


function messagePlusOne(textMsn,text,pwidth,pheight,delta){
  textMsn.text=text

  textMsn.x=pwidth/2-delta;
  textMsn.y=pheight/2-50;
  textMsn.alpha=0;
  createjs.Tween.get(textMsn, { loop: false })
  //.to({ alpha: 1, y: 225 ,font:"bold 40px sans-serif"}, 500, createjs.Ease.getPowInOut(2))
  .to({ alpha: 0, y: textMsn.y+25 }, 100, createjs.Ease.getPowInOut(2))
  .to({ alpha: 1, y: textMsn.y+50 ,font:"bold 40px sans-serif"}, 100, createjs.Ease.getPowInOut(2))
  .to({ alpha: 0}, textMsn.y+75, createjs.Ease.getPowInOut(2));
}

function messageResult(textMsn,text,pwidth,pheight,delta){
  textMsn.text=text
  textMsn.x=pwidth/2-delta;
  textMsn.y=pheight/2-50;
  textMsn.alpha=0;
  createjs.Tween.get(textMsn, { loop: false })
  //.to({ alpha: 1, y: 225 ,font:"bold 40px sans-serif"}, 500, createjs.Ease.getPowInOut(2))
  .to({ alpha: 0, y: textMsn.y+25 }, 100, createjs.Ease.getPowInOut(2))
  .to({ alpha: 1, y: textMsn.y+50 ,font:"bold 40px sans-serif"}, 100, createjs.Ease.getPowInOut(2))
  //.to({ alpha: 0}, textMsn.y+75, createjs.Ease.getPowInOut(2));
}

function generateBoardOpponent(n,pwidth,pheight,m){
    var offsetX=$delta;
    var offsetY=$delta;
    $width=(pwidth-(n)*$delta)/n;
    $height=$width;
    $boardPlayOpponent={gui:(new Array(n*n)),board:[]};
    $boardOpponent.removeAllChildren();
    $stageOpponent.removeAllChildren();
    $board = new createjs.Container();
    var element,x,y;
    for (var i=0;i<n;i++){
        $boardPlayOpponent.board.push([]);
        for (var j=0;j<n;j++){
            var text="";
             if(m[i][j]!=0){
              text=m[i][j];
              //console.log(i+" "+j+" "+offsetY+" "+text);
              $boardPlayOpponent.gui[m[i][j]]=(creatContainerRect($width,$height,text,"Crimson"));
              $boardPlayOpponent.gui[m[i][j]].x=offsetX;
              $boardPlayOpponent.gui[m[i][j]].y=offsetY;
              $boardPlayOpponent.board[i].push({id:m[i][j],x:offsetX,y:offsetY});
              $boardOpponent.addChild($boardPlayOpponent.gui[$boardPlayOpponent.board[i][j].id]);

            }else{
              $boardPlayOpponent.board[i].push({id:m[i][j],x:offsetX,y:offsetY});
              $boardPlayOpponent.gui[m[i][j]]=m[i][j];
            }
            offsetX+=$width+$delta;
        }
        offsetY+=$height+$delta;
        offsetX=$delta;
    }
    $stageOpponent.addChild($boardOpponent);
    $stageOpponent.addChild($textMsnOpponent);
}

function generateBoard(n,pwidth,pheight,m){
    var offsetX=$delta;
    var offsetY=$delta;
    $width=(pwidth-(n)*$delta)/n;
    $height=$width;
    $queueFileM=[];
    $boardPlay={gui:(new Array(n*n)),board:[]};
    $board.removeAllChildren();
    $stage.removeAllChildren();
    $board = new createjs.Container();
    var element,x,y;
    for (var i=0;i<n;i++){
        $boardPlay.board.push([]);
        for (var j=0;j<n;j++){
            var text="";
            if(m[i][j]!="0"){
              text=m[i][j];
              $boardPlay.gui[m[i][j]]=(creatContainerRect($width,$height,text,"Crimson"));
              $boardPlay.gui[m[i][j]].x=offsetX;
              $boardPlay.gui[m[i][j]].y=offsetY;
              $boardPlay.board[i].push({id:(m[i][j]),x:offsetX,y:offsetY});
              $board.addChild($boardPlay.gui[$boardPlay.board[i][j].id]);
              
            }else{
              $boardPlay.board[i].push({id:m[i][j],x:offsetX,y:offsetY});
              $boardPlay.gui[m[i][j]]=m[i][j];
            }
            offsetX+=$width+$delta;
        }
        offsetY+=$height+$delta;
        offsetX=$delta;
    }
    $stage.addChild($board);
     $stage.addChild($textMsn);
}


function creatContainerRect(width,height,text_,color){
  var container = new createjs.Container();
  var rect = new createjs.Shape();
  var text = new createjs.Text(text_, "bold 20px sans-serif", "#FFFFFF");
  text.x = width/2-5;
  text.y = height/2+5;
  if(text_.length>1){
    text.x -= 5;
  }
  text.textBaseline = "alphabetic";
  rect.graphics.beginFill(color).drawRoundRect(0, 0, width,height,3);
  container.addChild(rect,text);
  return container;
}


function moveContainer(container,x_,y_){
  console.log("X: "+x_+" Y: "+y_);
  createjs.Tween.get(container, {loop: false})
    .to({x:x_,y:y_}, 200).call(handleComplete);
}

function handleComplete() {
    //swapFileBoard($boardPlay,$boardPlayGUI,0,0,0,1);
}

function validatePostFile(file,x,y){
  return file.x==x&&file.y==y;
}

function moveContainer(container,x_,y_){
  console.log("X: "+x_+" Y: "+y_);
  createjs.Tween.get(container, {loop: false})
    .to({x:x_,y:y_}, 300).call(handleComplete);
}

function handleComplete() {
    //swapFileBoard($boardPlay,$boardPlayGUI,0,0,0,1);
    //console.log("Termino");
    if($queueFileM.length>0){
      //$queueFileM=[];
      for(var i=0;i<$queueFileM.length;i++){
        var tem=$queueFileM[i];
        $queueFileM.splice( i, 1 );
        var sw=swapFileBoard(tem.bp,tem.i,tem.j,tem.newi,tem.newj);
        if(!sw){
          break;
        }
        //console.log("length "+$queueFileM.length);
      }
    }
}

function validatePostFile(file,x,y){
  return file.x==x&&file.y==y;
}
function swapFileBoard(bp,i,j,newi,newj){
  console.log(bp.board[i][j].id);
  if(!validatePostFile(bp.gui[bp.board[i][j].id],bp.board[i][j].x,bp.board[i][j].y)){
    $queueFileM.push({bp:bp,i:i,j:j,newi:newi,newj:newj});
    return false;
  }
  moveContainer(bp.gui[bp.board[i][j].id],bp.board[newi][newj].x,bp.board[newi][newj].y);
  var temp=bp.board[newi][newj].id;
  bp.board[newi][newj].id=bp.board[i][j].id;
  bp.board[i][j].id=temp;
  return true;
}


function convertoMatris(matriText,n) {
    var s=matriText.split(" ");
    var m=new Array(n);
    var k=0;
    for(var i=0;i<n;i++){
      m[i]=new Array(n);
      for(var j=0;j<n;j++){
        m[i][j]=s[k];
        console.log(m[i][j]);
        k++;
      }  
    }
    return m;
}