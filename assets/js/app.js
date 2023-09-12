var socket = io.connect();
var chatIntroCard = document.getElementsByClassName('chat-intro')[0];
var form = document.getElementsByClassName('chat-form')[0];
var input = document.getElementsByClassName('chat-input')[0];
var messages = document.getElementsByClassName('chat-messages')[0];
var chatContainer = document.getElementsByClassName('chat-container')[0];
var chatBtn = document.getElementsByClassName('chat-btn');
var chatStopBtn = document.getElementsByClassName('chat-stop')[0];
var _click = 'ontouchstart' in window ? 'touchend' : 'click';

each(chatBtn, function(elem){
    elem.addEventListener(_click, function(){
        elem.innerText = 'Looking...';
        connect();
    });
});

form.addEventListener('submit', onSubmit);

document.addEventListener(_click, onStop);

socket.on('room:created', function(data){
    chatInit();
    sendMessage(data.message, true);
    input.removeAttribute('readonly', true);
});

socket.on('receive-message', function(data){
    sendMessage(data.message);
});

socket.on('matched', function(data){
    sendMessage(data.message);
});

socket.on('chat:disconnected', function(){
    disconnect(true);
});

function chatInit(){
    each(chatBtn, function(elem){
        elem.innerText = 'Chat!';
        elem.style.display = 'none';
    });

    chatContainer.style.display = 'block';
    messages.innerHTML = '';
    chatIntroCard.style.display = 'none';
    chatStopBtn.style.display = 'inline-block';
}

function onSubmit(e){
    var message = input.value.trim();
    
    if(message){
        sendMessage();
        
        socket.emit('send-message', {
            message: message
        });
    }
    
    e.preventDefault();
}

function onStop(e){
    var elem = e.target;

    if(elem.classList.contains('chat-stop')){
        if(!elem.classList.contains('warning')){
            elem.classList.add('warning');
            elem.innerText = 'Are You Sure?';
        }else{
            socket.disconnect(true);
            sendMessage('<div class="disconnect">You left in the chat.</div>', true);
            disconnect();
            elem.classList.remove('warning');
            elem.innerText = 'Stop :(';
            chatStopBtn.style.display = 'none';
            input.setAttribute('readonly', true);
        }
    }else{
        
    }
}

function connect(){
    socket.connect();
    socket.emit('chat:matching');
}

function each(nodes, fn){
    Array.prototype.forEach.call(nodes, fn);
}

function sendMessage(message, ispromptMsg){
    var li = document.createElement('li');
    var person = message ? 'Stranger' : 'You';
    var messageContent = ispromptMsg
        ? message
        : '<span class="'+ (message ? 'stranger' : 'you') +'">' + person +'</span>: ' + (message || input.value);

    li.innerHTML = messageContent;
    messages.appendChild(li);
    window.scrollTo(0, document.body.scrollHeight);
    input.value = '';
}

function disconnect(hasMessage){
    if(hasMessage){
        sendMessage('<div class="disconnect">Stranger has left.</div>', true);
    }

    document.querySelector('.chat-body .chat-btn').style.display = 'inline-block';
    chatStopBtn.style.display = 'none';
}