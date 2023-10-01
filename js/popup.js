document.addEventListener("DOMContentLoaded", ()=>{
    const record = document.querySelector("button#record")
    const stop = document.querySelector("#stop")

    record.addEventListener('click', ()=>{
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {action: "request_record"}, function(response){
                if(!chrome.runtime.lastError){
                    console.log(response)
                }else{
                    console.log(chrome.runtime.lastError)
                }
            })
        })
    })

    stop.addEventListener('click', ()=>{
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {action: "stop_record"}, function(response){
                if(!chrome.runtime.lastError){
                    console.log(response)
                }else{
                    console.log(chrome.runtime.lastError)
                }
            })
        })
    })

})