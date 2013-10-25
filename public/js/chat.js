function ChatController($scope) {

    // Audio files
    var msgReceived = new Audio("/sounds/Received Message.mp3");
    var msgSent = new Audio("/sounds/Sent Message.mp3");
    var loggedIn = new Audio("/sounds/Logged In.mp3");
    var buddyIn = new Audio("/sounds/Buddy Logging In.mp3");
    var buddyOut = new Audio("/sounds/Buddy Logging Out.mp3");

    var lastSentMsg = "";
    var isStarted = false;

    var socket = io.connect();

    $scope.messages = [];
    $scope.roster = [];
    $scope.name = '';
    $scope.text = '';

    socket.on('connect', function () {
      $scope.setName();
      loggedIn.play();
      window.setTimeout(function(){isStarted = true;}, 2000);
    });

    socket.on('message', function (msg) {
      $scope.messages.push(msg);
      $scope.$apply();
      if(lastSentMsg != msg.text && isStarted){
        msgReceived.play();
      }
    });

    socket.on('roster', function (names) {

      if(isStarted){
        if($scope.roster.length > names.length){
          buddyOut.play();
        } else if($scope.roster.length < names.length) {
          buddyIn.play();
        }
      }

      $scope.roster = names;
      $scope.$apply();
    });

    $scope.send = function send() {
      console.log('Sending message:', $scope.text);
      msgSent.play();
      lastSentMsg = $scope.text;
      socket.emit('message', $scope.text);
      $scope.text = '';
    };

    $scope.setName = function setName() {
      socket.emit('identify', $scope.name);
    };
}