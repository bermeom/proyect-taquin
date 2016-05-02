$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $usersGUI=$("#users");
  var $name=$("#name");
  var $nameopponent=$("#nameopponent");
  var $steps=$("#steps");
  var $round=$("#round");
  var $stepsopponent=$("#stepsopponent");
  var $namevs=$("#namevs");
  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page
  var $game = $('.game.page'); // The chatroom page
  var $readyCheck=document.getElementById("checkbox-fa-3");
  // Prompt for setting a username
  var id;
  var id2;
  
  var idopponent;
  
  var username;
  var login =false;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();
  var inGame=false;
  var socket = io.connect();
  var users = new Map();
  var consecutive=0;
  
  // Sets the client's username
  function setUsername () {
    id = cleanInput($usernameInput.val().trim());
  // If the username is valid
    if (id) {
      console.log("Send id "+id);
      // Tell the server your username
      socket.emit('add-user-frontend', id);
    }
  }
  
  // Remove gui User
  function removeUser (id) {
    $('#user'+id).remove();
  }
  
   // Add gui User
  function addUser (data) {
  
    if (users.has(data.value.id)){
      console.log(data.value.points);
       $('#user'+(data.value.id)).find('#points').text(data.value.points);
       return; 
    }
    users.set(data.value.id,data.value.id);
    console.log(data.value.username+" "+data.value.id);
    var idUser="user"+data.value.id;
    var $el = $('<li>',{
        'id':idUser
    });
    var $a = $('<a>',{
      'data-toggle':"collapse"
    })
    var $span=$('<span>',{
        'class':"fa fa-user"
    })
    var $name_=$('<span>',{
        'class':"title",
        'text':data.value.username+'  '
    })

    var $spanPoints=$('<span>',{
        'id':'points',
        'class':'label label-primary',
        'text':data.value.points
    });
    $name_.append($spanPoints);
    $a.append($span);
    $a.append($name_);
    $el.append($a)
    $usersGUI.append($el);
    consecutive++;
  }
  
  $( "#checkbox-fa-3" ).click(function() {
      console.log("Ready "+$readyCheck.checked+" "+document.getElementById("size").value);
      if ($readyCheck.checked){
          console.log("checked")
          socket.emit('ready-frontend', {
              username: username,
              id:id,
              size:document.getElementById("size").value
            });
            inGame=true;
        $readyCheck.disabled =true;  
      }
      
  });
  
  
  //================================================

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }


  // Log a message
  
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }
  
  
  //===================================

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
        console.log(login);
        if (!login)  {
          setUsername();
        }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login-frontend', function (data) {
    console.log("Lisening Login");
    console.log(data)
    login=connected = data.login;
    if(login){
      username=data.value.username;
      id2=data.value.id;
      /*log(message, {
        prepend: true
      });*/
      // Display the welcome message
      $game.show();
      $loginPage.fadeOut();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();
      $name.text(username);
      $("#error-login").hide();
    }else{
      $("#error-login").show();
      //$("#error-login").text("Incorrect ID. Please try again. "+$usernameInput.val().trim());
    }
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    addUser(data);
  });
  

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
      console.log("user left "+data.username+" "+data.id);
      removeUser (data.id);
      if(id2==data.id){
        $game.hide();
        $usernameInput.val("");
        $loginPage.on('click');
        $loginPage.show();
        login=false;
        socket.emit('disconnect-frontend');
      }
  });
  
  //==========================================

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });
  
  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });
  //============================================
  
  socket.on('get-users-frontend-reply', function (data) {
      var d={value:1};
      //users.get(data.username)
      /*for (var v of users.keys()) {
          removeUser(v);
      }*/
      for (var v of data.score) {
          d.value=v;
          addUser(d);
      }
  });
  
  socket.on('timer-frontend', function (data) {
      document.getElementById("timer").innerHTML = "(00:"+data.seconds+")";
      messagePlusOne($textMsn, data.seconds,$pwidth,$pheight,15);
  });
  
  socket.on('start-frontend', function (data) {
      document.getElementById("timer").innerHTML ="";
      if (inGame){
          idopponent=-1;
          $round.text("Round: "+(data.round+1));
          messagePlusOne($textMsn,"Round "+(data.round+1),$pwidth,$pheight,50);
      }
  });
  
  socket.on('show-matriz', function (data) {
      if (inGame){
          console.log(data);
           var size_=parseInt(data.size);
           console.log(data.nameopponent)
           if(data.id==id){
              $stepsopponent.text("Steps: "+" ")
              var matriz_=convertoMatris(data.matriz,size_)
              idopponent=data.idopponent;
              generateBoardOpponent(size_,$pwidth,$pheight,matriz_);
              $nameopponent.text(data.nameopponent);
           }else if(data.idopponent==id){
              $steps.text("Steps: "+" ")
              var matriz_=convertoMatris(data.matriz,size_)
              generateBoard(size_,$pwidth,$pheight,matriz_);
             
           }
      }
  });
  
  socket.on('step-frontend', function (data) {
      if (inGame){
          console.log(data);
          if(data.id==id){
            $steps.text("Steps: "+data.nstep+" ");
            swapFileBoard($boardPlay,data.i,data.j,data.newi,data.newj);
            messagePlusOne($textMsn,"+1",$pwidth,$pheight,30);
          }else if(data.id==idopponent){
            $stepsopponent.text("Steps: "+data.nstep+" ");
            swapFileBoard($boardPlayOpponent,data.i,data.j,data.newi,data.newj);
            messagePlusOne($textMsnOpponent,"+1",$pwidth,$pheight,30);
          }
      }
  });
  
  socket.on('finished-frontend', function () {
      if (inGame){
          console.log("finished-frontend");
          $round.text("");
          idopponent=-1;
          $readyCheck.disabled =false;
          $readyCheck.checked =false;
          inGame=false;
      }
      socket.emit('get-users-frontend');
  });
  
  socket.emit('get-users-frontend');
  //$game.show();
});