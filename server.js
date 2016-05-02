// Setup basic express server
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');


var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

app.use(express.static(path.resolve(__dirname, 'public')));

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});


var usersMap = new Map();
var game;
var consecutive=0;
var numUsers = 0;
var gameInProgress=false;
var isReady=true;
var n;
var round;
var tournament;
var ids ;
var finished=0;
              
io.on('connection', function (socket) {
  var addedUser = false;
  
  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;
    // we store the username in the socket session for this client
    socket.username = username;
    console.log(username);
    ++numUsers;
    addedUser = true;
    var id = uniqueNumber();
    id=id.toString(10)+"";
    var value={id:consecutive,username:username,points:0};
    consecutive++;
    usersMap.set(id,value);
    socket.emit('login', {
      numUsers: numUsers,
      id: id
    });
    
    socket.id = id;
    socket.gui=false;
    // echo globally (all clients) that a person has connected
  
    socket.broadcast.emit('user joined', {
      value: value,
      numUsers: numUsers
    });
    
  });


  // when the client emits 'add user-frontend', this listens and executes
  socket.on('add-user-frontend', function (id) {
    if (addedUser) return;
    // we store the username in the socket session for this client
    var value;
    if(usersMap.has(id)){
      addedUser = true;
      value=usersMap.get(id);
      socket.id = id;
      socket.username = value.username;
      socket.gui=true;
      console.log("Login-frontend "+"Request user "+id)
    }
    socket.emit('login-frontend', {
      value: value,
      login:addedUser
    });
  });
  
  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      if(!socket.gui){
        --numUsers;
          console.log("disconnect => "+socket.id+" ")
          //console.log("Disconnect ->"+socket.id);
          var value=usersMap.get(socket.id);
          // echo globally that this client has left
          socket.broadcast.emit('user left', {
              username: socket.username,
              id: value.id,
              value:value,
              numUsers: numUsers
              });
          usersMap.delete(socket.id);
      }
    }
  });
  socket.on('disconnect-frontend', function () {
      addedUser=false;
  });
  
  // Loading all users
  socket.on('get-users-frontend', function () {
    var score = new Array();
    for (var v of usersMap) {
        score.push(v[1]);
      }
    socket.emit('get-users-frontend-reply', {
          score: score
          });
  });
  
  // User frontend is ready
  socket.on('ready-frontend', function (data) {
      console.log("ready-frontend ->");
      if(isReady){
        if(!gameInProgress){
            game = new Map();
            gameInProgress=true;
            ready();
        }
        data.matriz="";
        game.set(data.id+"",data);
      }
    
  });
  
  // Algorithms strat request
  socket.on('start-request', function (data) {
      console.log("start-request");
      //console.log(game.get(socket.id+"").idgame);
      if (gameInProgress&&game.has(socket.id+"") && tournament[round][game.get(socket.id+"").idgame] != -1){
          socket.emit('get-matriz', {
                  n_size: n
                  });
      }
      
  });
  
  socket.on('get-matriz-reply', function (matriz) {
      console.log("get-matriz-reply");
      if (gameInProgress&&game.has(socket.id+"")){
        var d=game.get(socket.id);
        var dopponent=game.get(ids[tournament[round][d.idgame]].id);
        dopponent.matriz=convertoMatris(matriz,n);
        dopponent.step=0;
        game.set(ids[tournament[round][d.idgame]].id,dopponent);
        //console.log("Send reply -> "+n+" id "+socket.id+" idopponent "+ids[tournament[round][d.idgame]].id+" "+usersMap.get(ids[tournament[round][d.idgame]].id).username)
        socket.broadcast.emit('solve', {
                id: ids[tournament[round][d.idgame]].id,
                matriz:matriz
                });
        socket.broadcast.emit('show-matriz', {
                id: socket.id,
                idopponent: ids[tournament[round][d.idgame]].id,
                nameopponent:usersMap.get(ids[tournament[round][d.idgame]].id).username,
                matriz:matriz,
                size:n
                });
    }        
  });
  
  socket.on('step', function (data) {
      //console.log("stept -> "+socket.id);
      if (gameInProgress&&game.has(socket.id+"")){
        var d=data.split(" ");
        if (d.length==3 && !ids[game.get(socket.id).idgame].finished&&game.get(socket.id).step+1==parseInt(d[0])){
            var nstep=parseInt(d[0]);
            var i=parseInt(d[1]);
            var j=parseInt(d[2]);
            var r=validateMovement(game.get(socket.id).matriz,i,j);
            if (r.validate){
              game.get(socket.id).matriz=r.matriz;
              game.get(socket.id).step++;
              socket.broadcast.emit('step-frontend', {
                    id: socket.id,
                    i:i,
                    j:j,
                    newi:r.newi,
                    newj:r.newj,
                    nstep:nstep
              });
              sleep(300);
              if(validateBoard(r.matriz)){
                finished++;
                console.log("finished => "+socket.id+" "+finished+" "+tournament[round][idgame_]);
                var gamer=game.get(socket.id);
                var idgame_=gamer.idgame;
                //
                ids[idgame_].finished=true;
                if(ids[tournament[round][idgame_]].finished){
                  //both they ended
                  var gamer1=usersMap.get(socket.id);
                  var gamer2=usersMap.get(ids[tournament[round][idgame_]].id);
                  if(gamer.step>game.get(ids[tournament[round][idgame_]].id).step){
                     gamer1.points=gamer1.points+3;
                  } else if(gamer.step<game.get(ids[tournament[round][idgame_]].id).step){
                           gamer2.points=gamer2.points+3;
                        }else{
                             gamer1.points=gamer1.points+1;
                             gamer2.points=gamer2.points+1;
                        } 
                  usersMap.set(socket.id,gamer1);
                  usersMap.set(ids[tournament[round][idgame_]].id,gamer2);
                }

                
                if((game.size%2==0&&finished>=game.size)||(!(game.size%2==0)&&finished>=game.size-1)){
                    
                    round++;
                    console.log("finished all participants round "+round+" "+(game.size));
                    if((game.size%2==0&&round<game.size-1)||(game.size%2!=0&&round<game.size)){
                      for(var i=0;i<ids.length;i++){
                        ids[i].finished=false;
                      }
                      finished=0;
                      socket.broadcast.emit('start-frontend',{
                          round:round
                      });
                      sleep(800);
                      socket.broadcast.emit('start');
                    }else{
                      console.log("finished game");
                      //round=0;
                      socket.broadcast.emit('finished-frontend');
                      gameInProgress=false;
                      isReady=true;
                    }
                }
                //socket.emit('ack-solve-finished');
              }else{
                  socket.emit('ack-solve');
                }
            }else{
             socket.emit('error-solve');
            }
        }else{
             socket.emit('error-solve');
            }
     } 
  });
  
  function ready(){
      var seconds=5;
      var intervalCall = setInterval(timer, 1000);

        function timer() {
            if(seconds<=-1){
              isReady=false;
              clearInterval(intervalCall);
              if(game.size<=1){
                socket.broadcast.emit('finished-frontend');
                //socket.emit('ack-solve-finished');
                gameInProgress=false;
                return;
              }
              n=winnerSize(game);
              console.log(game.size);
              ids = [];
              finished=0;
              var m=0;
              if(game.size%2==0){
                m=-1;
              }
              console.log("Create tournament");
              tournament = new Array(game.size+m);
              var q=0;
              var vv;
              for(var v of game){
                  ids.push({id:v[0],finished:false});
                  vv=v[1];
                  vv.idgame=q;
                  game.set(v[0],vv);
                  q++;
              }
              for (var i=0;i<tournament.length;i++){
                  tournament[i]=new Array();
                   for (var j=0;j<game.size;j++){
                     tournament[i].push(0);
                   }
              }
              console.log("Calculate play ");
              console.log("===>"+tournament.length+" "+game.size)
              generatorBoard(game.size,0,0);
              printBoard(tournament);
              console.log(tournament);
              round=0;
              //----------------------------------------------
              socket.broadcast.emit('start-frontend',{
                  round:round
              });
              sleep(800);
              socket.broadcast.emit('start');
              return;
            }
            //document.getElementById("timer").innerHTML = "(00:"+second+")";
            socket.broadcast.emit('timer-frontend', {
                  seconds: seconds
                  });
            seconds--;

        }
        
  }
  
  function sleep(milliseconds) {
      var start = new Date().getTime();
      while((new Date().getTime() - start) < milliseconds);
  }
  
  
});




function convertoMatris(matriText,n) {
    var s=matriText.split(" ");
    var m=new Array(n);
    var k=0;
    //console.log("convertoMatris")
    for(var i=0;i<n;i++){
      m[i]=new Array(n);
      for(var j=0;j<n;j++){
        m[i][j]=parseInt(s[k]);
        //console.log(m[i][j]);
        k++;
      }  
    }
    return m;
}


function validateBoard(matriz){
    //console.log("Validate board");
    for (var i=0;i<matriz.length;i++){
        for (var j=0;j<matriz.length;j++){
          if(i==matriz.length-1&&j==matriz.length-1){
            break;
          }
          //console.log( matriz[i][j]+" !="+((i*matriz.length+j)+1));
          if(matriz[i][j]!=(i*matriz.length+j)+1){
            return false;
          }
        
      }
    }
    return true
  }

function validateMovement(matriz,i,j) {
    var x=[1,0, 0,-1];
    var y=[0,1,-1, 0];
    var r={validate:false,matriz:matriz,newi:i,newj:j};
    //console.log("validateMovement");
    //console.log(" -------------> "+i+" "+j);
    
    for(var q=0;q<4;q++){
      //console.log((i+x[q])+" "+(j+y[q]));
      if(i+x[q]>=0  && j+y[q]>=0 &&i+x[q]<matriz.length  && j+y[q]<matriz.length && matriz[ i+x[q] ][ j+y[q] ]==0){
        r.validate=true;
        matriz[i+x[q]][j+y[q]]=matriz[i][j];
        matriz[i][j]=0;
        r.newi=i+x[q];
        r.newj=j+y[q];
        r.matriz=matriz;
        return r;  
      }
    }
    return r;
}


function uniqueNumber() {
    var date = Date.now();

    // If created at same millisecond as previous
    if (date <= uniqueNumber.previous) {
        date = ++uniqueNumber.previous;
    } else {
        uniqueNumber.previous = date;
    }

    return date;
}

uniqueNumber.previous = 0;

function winnerSize(game) {
    var sizes=new Map();
    var a;
    for (var v of game) {
        a=1;
        if(sizes.has(v[1].size)){
          a+=sizes.get(v[1].size);
        }
        sizes.set(v[1].size,a);
    }
    var winner=-1,votes=-1;
    for (var v of sizes) {
        if(winner==-1||votes<v[1]){
          votes=v[1];
          winner=v[0];
        }
    }    
    return winner;  
}



function printBoard(tournamentBoard){
    var print_board="";
    for (var i=0;i<tournamentBoard.length;i++){
        for (var j=0;j<tournamentBoard[i].length;j++){
            print_board+=tournamentBoard[i][j]+" ";
        }
        print_board+="\n";
    }
    console.log(print_board);
}

function generatorBoard(players,i,j){
        var m=players;
        if(m%2==0){
          m--;
        }
        if (i>=m){
            return true; 
        }
        if (j>=players){
            return generatorBoard(players,i+1,0);
        }
        var possible=new Array();
        for(var k=0;k<m+1;k++){
          possible.push(true);
        }
        possible[j]=false;
        for(var k=0;k<i;k++){
            if(tournament[k][j]==-1){
                possible[players]=false;
            }else{
                possible[tournament[k][j]]=false;    
            }
        }
        for(var k=0;k<j;k++){
            if(tournament[i][k]==-1){
                possible[players]=false;
            }else{
                possible[tournament[i][k]]=false;    
            }
        }
        for(var k=0;k<players;k++){
            if(possible[k]){
                tournament[i][j]=k;
                if(generatorBoard(players,i,j+1)){
                   return true; 
                }
            }
        }
        if(m==players&&possible[players]){
            tournament[i][j]=-1;
            return generatorBoard(players,i,j+1);
        }
     return false;
}
