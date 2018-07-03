$(function(){

    // Configuration
    //var url = 'http://127.0.0.1'; // URL of your webserver
    var line_thickness = 7;
    var line_colour = "blue";

    // Variables
    var canvas = $('#paper');
    var ctx = canvas[0].getContext('2d');
    //var id = Math.round($.now() * Math.random()); // Generate a unique ID
    //var drawing = false; // A flag for drawing activity
    //var touchUsed = false; // A flag to figure out if touch was used
    var clients = {};
    var cursors = {};
    var prev = {}; // Previous coordinates container
    
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
    
    // Keep users screen up to date with other users cursors & lines
    function rePlay(data) {
        console.log('Render Replay');
        //console.log(data);
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
    }

    /* socket.on('replay', function (data) {
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
    }); */
});