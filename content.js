console.log('evaina');
var recorder = null;
var isPaused = false;

function createRecordingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'recordingOverlay';
  overlay.innerHTML = `
  <div id="cameraOn">
  </div>
  <div id="timer">
  <p>00:00:00</p>
  <span>.</span>
  </div>
  <div id="pause">
  <svg id="pauseButton" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>Pause</span>
  </div>
  <div id="stop">
  <svg id="stopButton" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
</svg>
<span>Stop</span>
</div>
  <div id="camera">
  <svg id="cameraButton" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
</svg>
<span>Camera</span>
</div>
  <div id="mic">
  <svg id="micButton" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
</svg>
<span>Mic</span>
  </div>
  <div id="delete">
  <svg id="deleteButton" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
</svg>
  </div>
    `;
  document.body.appendChild(overlay);

  const startButton = document.getElementById('startButton');
  const pauseButton = document.getElementById('pauseButton');
  const resumeButton = document.getElementById('resumeButton');
  const stopButton = document.getElementById('stopButton');

  pauseButton.addEventListener('click', () => {
    // Your code to pause or resume recording
  });

  stopButton.addEventListener('click', () => {
    startButton.disabled = false;
    pauseButton.disabled = true;
    resumeButton.disabled = true;
    stopButton.disabled = true;

    // Your code to stop recording
  });
}

function onAccessApproved(stream) {
  recorder = new MediaRecorder(stream);
  let recordedChunks = [];

  recorder.start();
  createRecordingOverlay();
  recorder.ondataavailable = function (event) {
    recordedChunks.push(event.data);
  };

  recorder.onstop = function () {
    stream.getTracks().forEach(function (track) {
      if (track.readyState === 'live') {
        track.stop();
      }
    });

    // Combine the recorded chunks into a single Blob
    let recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
    console.log(recordedBlob);

    // Send the Blob data to your endpoint using the Fetch API
    fetch('https://johnpauljpc.pythonanywhere.com/video-transcription/', {
      method: 'POST',
      body: recordedBlob,
    })
      .then((response) => {
        if (response.ok) {
          console.log('Video sent to the endpoint successfully');
        } else {
          console.error('Failed to send video to the endpoint');
        }
      })
      .catch((error) => {
        console.error('Error sending video to the endpoint:', error);
      });
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'request_record') {
    console.log('request posted');
    sendResponse(`processed ${message.action}`);

    navigator.mediaDevices
      .getDisplayMedia({
        audio: true,
        video: {
          width: 9999999999,
          height: 9999999999,
        },
      })
      .then((stream) => {
        onAccessApproved(stream);
      });
  }

  if (message.action === 'stop_record') {
    console.log('stopping Video');
    sendResponse(`precessed: ${message.action}`);
    if (!recorder) return console.log('no recorder');

    recorder.stop();

    if (typeof sendResponse === 'function') {
      sendResponse(`processed: ${message.action}`);
    }
  }
});

// function onAccessApproved(stream){
// recorder = new MediaRecorder(stream);

// recorder.start();

// recorder.onstop = function(){
//     stream.getTracks().forEach(function(track){
//         if(track.readyState === "live"){
//             track.stop()
//         }
//     })
// }

// recorder.ondataavailable = function(event){
//     let recordedBlob = event.data;
//     let url = URL.createObjectURL(recordedBlob)

//     let a = document.createElement("a");

//     a.style.display = "none";
//     a.href = url;
//     a.download = "screen-recording.webm"
//     document.body.appendChild(a)
//     a.click();

//     document.body.removeChild(a);
//     URL.revokeObjectURL(url)
// }
// }

// chrome.runtime.onMessage.addListener( (message, sender, sendResponse)=>{
//     if(message.action === "request_record"){
//         console.log("request posted")

//         sendResponse(`processed ${message.action}`)

//         navigator.mediaDevices.getDisplayMedia({
//             audio: true,
//             video:{
//                 width: 9999999999,
//                 height: 9999999999
//             }
//         }).then((stream)=>{
//             onAccessApproved(stream)
//         })
//     }

//     if(message.action === "stop_record"){
//         console.log("stopping Video");
//         sendResponse(`precessed: ${message.action}`)
//         if(!recorder) return console.log("no recorder")

//         recorder.stop();

//          if (typeof sendResponse === 'function') {
//             sendResponse(`processed: ${message.action}`);
//         }
//     }
// })
