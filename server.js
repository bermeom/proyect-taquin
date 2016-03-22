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
    
    //++numUsers;
    var value;
    console.log("llegoo "+usersMap.size);
    console.log("Login-frontend "+"Request user "+id+" "+usersMap.get(id));
    if(usersMap.has(id)){
      addedUser = true;
      value=usersMap.get(id);
      socket.id = id;
      socket.username = value.username;
      socket.gui=true;
      console.log("->>>>>>> LOGIN")
    }
    socket.emit('login-frontend', {
      value: value,
      login:addedUser
    });
  });

  //======================================
  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });
  
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });
  
  //======================================
  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      if(!socket.gui){
        --numUsers;
          //console.log("Disconnect ->"+socket.id);
          var value=usersMap.get(socket.id);
          usersMap.delete(socket.id);
          // echo globally that this client has left
          socket.broadcast.emit('user left', {
          username: socket.username,
          value:value,
          numUsers: numUsers
          });
      }
    }
  });
  // Loading all users
  socket.on('get-users-frontend', function () {
    var score = new Array();
    for (var v of usersMap) {
        console.log(v[1]);
        score.push(v[1]);
      }
    console.log("request -> get-users-frontend")
    socket.emit('get-users-frontend-reply', {
          score: score
          });
  });
  
  // User frontend is ready
  socket.on('ready-frontend', function (data) {
      console.log("ready-frontend ->");
      console.log(data);
      if(!gameInProgress){
          ready();
          gameInProgress=true;
          game = new Map();
      }
      data.matriz="";
      game.set(data.id+"",data);
  });
  
  // Algorithms strat request
  socket.on('start-request', function (data) {
      console.log("start-request");
      console.log(data);
      if (game.has(data+"")){
          console.log("Send reply -> "+n)
          socket.emit('get-matriz', {
                  n_size: n
                  });
        
      }
      
  });
  
  socket.on('get-matriz-reply', function (matriz) {
      console.log("get-matriz-reply");
      console.log(matriz);
      var d=game.get(socket.id);
      //d.matriz=convertoMatris(matriz);
      game.set(socket.id,d);
      var dopponent=game.get(ids[tournament[round][d.idgame]].id);
      dopponent.matriz=convertoMatris(matriz,n);
      game.set(ids[tournament[round][d.idgame]].id,dopponent);
      
      console.log("Send reply -> "+n+" id "+socket.id+" idopponent "+ids[tournament[round][d.idgame]].id+" "+usersMap.get(ids[tournament[round][d.idgame]].id).username)
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
  });
  
  socket.on('step', function (data) {
      console.log("stept -> "+socket.id);
      console.log(data);
      var d=data.split(" ");
      if (d.length==3 && !ids[game.get(socket.id).idgame].finished){
          var nstep=parseInt(d[0]);
          var i=parseInt(d[1]);
          var j=parseInt(d[2]);
          console.log(i+" "+j)
          var r=validateMovement(game.get(socket.id).matriz,i,j);
          console.log(r);
          if (r.validate){
            game.get(socket.id).matriz=r.matriz;
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
              console.log("finished => "+socket.id);
              finished++;
              ids[game.get(socket.id).idgame].finished=true;
              if(finished>=game.size){
                  console.log("finished all participants")
                  round++;
                  console.log("round "+round+" "+(game.size-1));
                  if(round<game.size-1){
                    for(var i=0;i<ids.length;i++){
                      ids[i].finished=false;
                    }
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
                  }
              }
              socket.emit('ack-solve-finished');
            }else{
                socket.emit('ack-solve');
              }
          }else{
           socket.emit('error-solve');
          }
      }else{
           socket.emit('error-solve');
          }
     
  });
  

  
  function ready(){
      var seconds=5;
      var intervalCall = setInterval(timer, 1000);

        function timer() {
            if(seconds<=-1){
              clearInterval(intervalCall);
              if(game.size<=1){
                socket.broadcast.emit('finished-frontend');
                socket.emit('ack-solve-finished');
                return;
              }
              n=winnerSize(game);
              console.log(game.size);
              tournament = new Array(game.size-1);
              ids = [];
              finished=0;
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
                  tournament[i]=new Array(game.size);
                   for (var j=0;j<game.size;j++){
                     tournament[i][j]=1;
                   }
              }
              for (var i=0;i<tournament.length;i++){
                  tournament[i]=new Array(game.size);
                   for (var j=0;j<game.length;j++){
                     console.log(i+" "+j+" "+tournament[i][j]);
                   }
              }
              console.log(tournament);
              console.log(tournament.size);
              //console.log(tournament[0].size);
              
              for (var i=0;i<game.size;i++){
                  q=0;
                  for (var j=0;j<game.size;j++){
                      if(j!=i){
                        //console.log(i+" "+j+" "+tournament.size+" "+tournament[i].size)
                        tournament[q][i]=j;
                        q++;
                      }    
                    
                  }  
              }
              console.log(tournament);
              round=0;
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
    console.log("convertoMatris")
    for(var i=0;i<n;i++){
      m[i]=new Array(n);
      for(var j=0;j<n;j++){
        m[i][j]=parseInt(s[k]);
        console.log(m[i][j]);
        k++;
      }  
    }
    return m;
}


function validateBoard(matriz){
    console.log("Valodate board");
    for (var i=0;i<matriz.length;i++){
        for (var j=0;j<matriz.length;j++){
          if(i==matriz.length-1&&j==matriz.length-1){
            break;
          }
          console.log( matriz[i][j]+" !="+((i*matriz.length+j)+1));
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
    console.log("validateMovement");
    console.log(" -------------> "+i+" "+j);
    
    for(var q=0;q<4;q++){
      console.log((i+x[q])+" "+(j+y[q]));
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