// wheel.js

// Get canvas element and context
var canvas = document.getElementById('wheelCanvas');
var ctx = canvas.getContext('2d');

// Variables for the wheel
var names = [];
var startAngle = 0;
var arc = 0;
var spinTimeout = null;
var spinTime = 0;
var spinTimeTotal = 0;

// Variables for spinning animation
var totalRotation = 0;
var initialStartAngle = 0;

// Rigged winner variables
var isRigging = false;
var riggedWinner = '';
var riggedInput = '';

// Preload sounds
var spinSound = new Audio('spin.mp3'); // Replace with your actual spin sound file
var stopSound = new Audio('stop.mp3'); // Replace with your actual stop sound file


document.getElementById('updateWheelBtn').addEventListener('click', updateWheel);
document.getElementById('spinBtn').addEventListener('click', spin);

// Event listener for detecting spacebar and capturing rigged winner name
document.addEventListener('keydown', function (event) {
  // If focus is on an input field, ignore
  if (document.activeElement.tagName.toLowerCase() === 'textarea' || document.activeElement.tagName.toLowerCase() === 'input') {
    return;
  }

  if (event.code === 'ControlLeft') {
    // Left Ctrl: ControlLeft
    // Right Ctrl: ControlRight
    // Left Alt: AltLeft
    // Right Alt: AltRight
    // '1': Digit1
    event.preventDefault(); // Prevent default spacebar scrolling
    if (!isRigging) {
      // Start rigging mode
      isRigging = true;
      riggedInput = '';
      console.log('Enter the rigged winner\'s name and press LeftCtrl to confirm.');
    } else {
      // Confirm rigged winner
      isRigging = false;
      riggedWinner = riggedInput.trim();
      if (riggedWinner !== '') {
        console.log('Rigged winner set to: ' + riggedWinner);
      } else {
        console.log('Rigged winner cleared.');
      }
    }
  } else if (isRigging) {
    // Capture only printable characters
    if (event.key.length === 1) {
      riggedInput += event.key;
    }
  }
});


// Set canvas dimensions based on viewport
function setCanvasSize() {
  var containerWidth = canvas.parentElement.clientWidth;
  var containerHeight = window.innerHeight;

  var size = Math.min(containerWidth * 0.9, containerHeight * 0.5); // Adjusted size

  canvas.width = size;
  canvas.height = size;
}

// Function to update the wheel with names
function updateWheel() {
  var input = document.getElementById('namesInput').value;
  names = input.split(',').map(function (name) {
    return name.trim();
  }).filter(function (name) {
    return name !== '';
  });
  startAngle = 0; // Reset the start angle
  setCanvasSize(); // Update canvas size
  drawWheel();

  // Save names to localStorage
  localStorage.setItem('wheelNames', JSON.stringify(names));
}

// Function to determine the contrasting text color
function getContrastingTextColor(backgroundColor) {
  // Extract HSL values from the background color string
  var hslRegex = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/;
  var result = hslRegex.exec(backgroundColor);

  // Check if result is null
  if (!result) {
    console.error("Background color is not in HSL format:", backgroundColor);
    return 'black'; // Default color if parsing fails
  }

  var h = parseInt(result[1]);
  var s = parseInt(result[2]);
  var l = parseInt(result[3]);

  // Convert HSL to RGB
  var rgb = hslToRgb(h / 360, s / 100, l / 100);

  // Calculate luminance
  var luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b);

  // Return black for light backgrounds and white for dark backgrounds
  return luminance > 0.6 ? 'black' : 'white';
}

// Function to generate colors for the wheel segments
function getColor(item, maxitem) {
  var hue = item * (360 / maxitem);
  return 'hsl(' + hue + ', 100%, 50%)'; // Ensure this is returned in HSL format
}

// Function to draw the wheel
function drawWheel() {
  // Adjusted to use dynamic canvas size
  var outsideRadius = canvas.width / 2 - 20;
  var textRadius = outsideRadius - (outsideRadius / 2); // Adjusted for middle positioning between center and arc
  var insideRadius = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (names.length === 0) {
    // If no names are available, display a message
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('No names available!', canvas.width / 2 - ctx.measureText('No names available!').width / 2, canvas.height / 2);
    return;
  }

  var numSegments = names.length;
  arc = 2 * Math.PI / numSegments;

  for (var i = 0; i < numSegments; i++) {
    var angle = startAngle + i * arc;
    var color = getColor(i, numSegments);

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, outsideRadius, angle, angle + arc, false);
    ctx.lineTo(canvas.width / 2, canvas.height / 2);
    ctx.fill();

    // Determine the text color based on the background color
    var textColor = getContrastingTextColor(color);

    ctx.save();
    ctx.fillStyle = textColor;

    // Translate and rotate the canvas for proper text alignment
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle + arc / 2);

    // Draw text exactly between the diameter and arc
    ctx.font = 'bold ' + Math.max(12, outsideRadius / 15) + 'px Arial';
    ctx.textAlign = 'center'; // Center the text horizontally
    ctx.fillText(names[i], textRadius, 0); // Center the text vertically

    // Restore the original state
    ctx.restore();
  }

  // Draw arrow pointing down at the top of the wheel
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 10, canvas.height / 2 - (outsideRadius + 20));
  ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2 - (outsideRadius + 20));
  ctx.lineTo(canvas.width / 2, canvas.height / 2 - (outsideRadius + 10));
  ctx.closePath();
  ctx.fill();
}



// Function to convert HSL to RGB
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: r,
    g: g,
    b: b
  };
}

// Function to start spinning the wheel
// Function to start spinning the wheel
function spin() {
  if (names.length === 0) {
    alert("No names available to spin!");
    return;
  }

  spinTime = 0;
  spinTimeTotal = 5000; // Total spin time in milliseconds
  initialStartAngle = startAngle;

  var rotations = Math.floor(Math.random() * 3) + 3; // 3 to 5 rotations

  if (riggedWinner) {
    var winnerIndex = names.indexOf(riggedWinner);
    if (winnerIndex === -1) {
      alert('An unexpected error has occurred.');
      riggedWinner = ''; // Clear the rigged winner
      return;
    } else {
      var desiredAngle = (names.length - winnerIndex) * arc - (arc / 2);
      desiredAngle = desiredAngle % (2 * Math.PI);

      var currentAngle = (startAngle + Math.PI / 2) % (2 * Math.PI); // Adjust for arrow at 90 degrees

      var angleDifference = (desiredAngle - currentAngle + 2 * Math.PI) % (2 * Math.PI);

      totalRotation = rotations * 2 * Math.PI + angleDifference;
    }
  } else {
    totalRotation = rotations * 2 * Math.PI + Math.random() * 2 * Math.PI;
  }

  // Disable spin button
  document.getElementById('spinBtn').disabled = true;
  document.getElementById('result').classList.remove('show');

  // Play spinning sound
  spinSound.loop = true; // Loop the spinning sound
  spinSound.play();

  rotateWheel();
}

// Easing function for smooth animation (ease-out effect)
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);  // Cubic easing-out
}

// Function to rotate the wheel
function rotateWheel() {
  spinTime += 30;
  if (spinTime >= spinTimeTotal) {
    startAngle = initialStartAngle + totalRotation;
    startAngle = startAngle % (2 * Math.PI); // Normalize the angle
    stopRotateWheel();
    return;
  }

  var t = spinTime / spinTimeTotal;
  var easedT = easeOut(t);

  startAngle = initialStartAngle + easedT * totalRotation;

  drawWheel();
  spinTimeout = setTimeout(rotateWheel, 30);
}

// Function to stop the wheel and display the selected name
function stopRotateWheel() {
  clearTimeout(spinTimeout);

  var degrees = startAngle * 180 / Math.PI + 90; // Adjust for arrow at 90 degrees
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - (degrees % 360)) / arcd) % names.length;

  var text = names[index];
  var resultText = "Congratulations! The winner is " + text + "!";
  var removalNotice = "The name has been automatically removed."; // New message

  // Stop spinning sound and play stop sound
  spinSound.pause();  // Stop spinning sound
  spinSound.currentTime = 0; // Reset to the beginning for next spin
  stopSound.play();  // Play stop sound

  // Display winner and removal notice
  document.getElementById('result').innerHTML = resultText + "<br><small>" + removalNotice + "</small>";
  document.getElementById('result').classList.add('show');

  // Remove the selected name from the list
  names.splice(index, 1);

  // Update the names input field and save to localStorage
  document.getElementById('namesInput').value = names.join(', ');
  localStorage.setItem('wheelNames', JSON.stringify(names));

  // Re-draw the wheel with the updated names list
  drawWheel();

  // Clear the rigged winner after spinning
  riggedWinner = '';

  // Enable spin button
  document.getElementById('spinBtn').disabled = false;
}



// Adjust canvas size on window resize
window.addEventListener('resize', function () {
  setCanvasSize();
  drawWheel();
});
