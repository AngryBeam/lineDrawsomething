var socket = io();
var isLineUser = false;
// Configuration
var line_thickness = 7;
var line_colour = "blue";

// Variables
var canvas = $('#paper');
var ctx = canvas[0].getContext('2d');
var id = Math.round($.now() * Math.random()); // Generate a unique ID
var drawing = false; // A flag for drawing activity
var touchUsed = false; // A flag to figure out if touch was used
var deleting = false;
var clients = {};
var cursors = {};
var prev = {}; // Previous coordinates container
var lastEmit = $.now();
var replayData = [];
var userData = [];

window.onload = function (e) {
    liff.init(function (data) {
        initializeApp(data);
    });
};

function initializeApp(data) {
    
    let profile = liff.getProfile().then(function (profile) {
        var lineUserData = data.context;
        isLineUser = true;
        userData = { 
            'isLineUser': isLineUser,
            'userData': lineUserData,
            'userProfile': profile
        };

        //socket.emit('debug', userData);
        socket.emit('lineRegister', userData, function (msg){
            alert(msg);
        });
    }).catch(function (error) {
        window.alert("Error getting profile: " + error);
    });
    
    document.getElementById('submit-drawing-data').addEventListener('click', function () {
        var drawKeyword =  document.getElementById('drawKeyword').value;
        socket.emit('submitData', userData, drawKeyword, replayData, function (msg){
            replayData = [];
            alert(msg);
        });
    });

    document.getElementById('delete').addEventListener('click', function () {
        line_thickness = 20;
        line_colour = "white";
        deleting = true;
    });
    
    document.getElementById('openwindowbutton').addEventListener('click', function () {
        liff.openWindow({
            url: 'https://line.me'
        });
    });

    document.getElementById('getUserList').addEventListener('click', function () {
        alert('getuserlist');
        socket.emit('requestUserList', userData);
    });

    // closeWindow call
    document.getElementById('closewindowbutton').addEventListener('click', function () {
        liff.closeWindow();
    });

    // sendMessages call
    document.getElementById('sendmessagebutton').addEventListener('click', function () {
        liff.sendMessages([{
            type: 'text',
            text: "You've successfully sent a message! Hooray!"
        }, {
            type: 'sticker',
            packageId: '2',
            stickerId: '144'
        }]).then(function () {
            //window.alert("Message sent");
        }).catch(function (error) {
            window.alert("Error sending message: " + error);
        });
    });

}




    

    $('#doReplay').click(function (e){
        e.preventDefault;
        socket.emit('replay', true);
    });
    $('#debug').click(function (e){
        e.preventDefault;
        socket.emit('debug', true);
    });



    // Drawing helper function
    function drawLine(fromx, fromy, tox, toy)
    {
        ctx.lineWidth = line_thickness;
        ctx.strokeStyle = line_colour;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
    }
    
    // On mouse down
    canvas.on('mousedown', function(e) {
        replayData.push({
            'x': e.pageX,
            'y': e.pageY,
            'touch': false,
            'drawing': drawing,
            'id': id
        });
        e.preventDefault();
        drawing = true;
        prev.x = e.pageX;
        prev.y = e.pageY;
    });

    // On touch start
    canvas.on('touchstart', function(e) {
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        drawing = true;
        prev.x = touch.pageX;
        prev.y = touch.pageY;
    });

    // On mouse move
    canvas.on('mousemove', function(e) {
        // Emit the event to the server
        if ($.now() - lastEmit > 30)
        {
            replayData.push({
                'x': e.pageX,
                'y': e.pageY,
                'touch': false,
                'drawing': drawing,
                'id': id          
            });
            lastEmit = $.now();
        }
        
        // Draw a line for the current user's movement
        if (drawing)
        {
            drawLine(prev.x, prev.y, e.pageX, e.pageY);
            prev.x = e.pageX;
            prev.y = e.pageY;
        }
    });

    // On touch move
    canvas.on('touchmove', function(e) {
        e.preventDefault();
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];

        // Emit the event to the server
        if ($.now() - lastEmit > 10)
        {
            /* socket.emit('mousemove', {
                'x': touch.pageX,
                'y': touch.pageY,
                'startX': prev.x,
                'startY': prev.y,
                'touch': true,
                'drawing': drawing,
                'id': id,
                'userData': userData,
                'isLineUser': isLineUser
            }); */
            replayData.push({
                'x': touch.pageX,
                'y': touch.pageY,
                'startX': prev.x,
                'startY': prev.y,
                'touch': true,
                'drawing': drawing,
                'id': id,
                'userData': userData,
                'isLineUser': isLineUser
            });
            lastEmit = $.now();
        }
        
        // Draw a line for the current user's movement
        if (drawing)
        {
            drawLine(prev.x, prev.y, touch.pageX, touch.pageY);
            prev.x = touch.pageX;
            prev.y = touch.pageY;
        }
    });

    // On mouse up
    canvas.on('mouseup mouseleave', function(e) {
        drawing = false;
        if(deleting){
            line_thickness = 7;
            line_colour = "blue";
            deleting = false;
        }
    });

    // On touch end
    canvas.on('touchend touchleave touchcancel', function(e) {
        drawing = false;
        if(deleting){
            line_thickness = 7;
            line_colour = "blue";
            deleting = false;
        }
    });

    // Keep users screen up to date with other users cursors & lines
    socket.on('moving', function (data) {
        console.log(data);
        // Create cursor
        if ( !(data.id in clients) )
        {
            cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
        }
        
        // Move cursor
        cursors[data.id].css({
            'left' : data.x,
            'top' : data.y
        });
        
        // Set the starting point to where the user first touched
        if (data.drawing && clients[data.id] && data.touch)
        {
            clients[data.id].x = data.startX;
            clients[data.id].y = data.startY;
        }

        // Show drawing
        if (data.drawing && clients[data.id])
        {
            // clients[data.id] holds the previous position of this user's mouse pointer
            drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
        }
        
        // Save state
        clients[data.id] = data;
        clients[data.id].updated = $.now();
    });

    socket.on('replay', function (data) {
        console.log('Replay data received.');
        console.log(data);
        (function theLoop (data, i) {
            setTimeout(function () {
            rePlay(data[i]);
            --i;
            if (i >= 0) {          // If i > 0, keep going
                theLoop(data,i);       // Call the loop again, and pass it the current value of i
            }
            }, 70);
        })(data.reverse(), data.length-1);
    });

    socket.on('debug', function (data){
        console.log(data);
    });
