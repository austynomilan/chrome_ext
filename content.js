console.log('evaina')

var recorder = null
var recorder = null;

function onAccessApproved(stream) {
    recorder = new MediaRecorder(stream);
    let recordedChunks = [];

    recorder.start();

    recorder.ondataavailable = function (event) {
        recordedChunks.push(event.data);
    };

    recorder.onstop = function () {
        stream.getTracks().forEach(function (track) {
            if (track.readyState === "live") {
                track.stop();
            }
        });

        // Combine the recorded chunks into a single Blob
        let recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
        console.log(recordedBlob)

        // Send the Blob data to your endpoint using the Fetch API
        fetch('your_endpoint_url', {
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
    if (message.action === "request_record") {
        console.log("request posted");
        sendResponse(`processed ${message.action}`);

        navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: {
                width: 9999999999,
                height: 9999999999,
            },
        }).then((stream) => {
            onAccessApproved(stream);
        });
    }

    if (message.action === "stop_record") {
        console.log("stopping Video");
        sendResponse(`precessed: ${message.action}`);
        if (!recorder) return console.log("no recorder");

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