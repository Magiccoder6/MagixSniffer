const STATUS = {
	SNIFFING: "Sniffing",
	INACTIVE: "Inactive",
	STOPED: "Stoped",
}

let httpService = new HttpService()
let domService = new DOMService()

let eventSource;
let sniffingStatus = STATUS.INACTIVE;

function setPacketStreamListener(){
    eventSource = new EventSource('/stream_packets');
    eventSource.onmessage = (event) => {
        domService.addRowToTable(JSON.parse(event.data))
        domService.packets.push(JSON.parse(event.data))
        domService.filterTable(document.getElementById("filter").value??"")
    };
}

async function getInterfaces(){
    try {
        let response = await httpService.getInterfaces()
        const json = await response.json();
        domService.displayInterfaces(json)
    } catch (error) {
        console.log(error)
    }
}

function setActionListeners(){
    document.getElementById("start").addEventListener('click', ()=>{
        if(!(domService.targetInterfaces.length > 0)){
            domService.showErrorMessage("Please select an interface")
            return 
        }

        if((sniffingStatus == STATUS.INACTIVE || sniffingStatus == STATUS.STOPED)){
            httpService.startSniffing(domService.targetInterfaces).then(()=>{
                sniffingStatus = STATUS.SNIFFING
                domService.setStatusMessage(sniffingStatus, "text-success")
                setPacketStreamListener()
            }).catch((error)=>{
                domService.showErrorMessage("error")
            })
        }else{
            domService.showErrorMessage("Already Sniffing")
        }
    })

    document.getElementById("stop").addEventListener('click', ()=>{
        if(sniffingStatus == STATUS.SNIFFING){
            if (eventSource) {
                eventSource.close();
            }

           httpService.stopSniffing().then(()=>{
                sniffingStatus = STATUS.STOPED
                domService.setStatusMessage(sniffingStatus, "text-danger")
           }).catch((error)=>{
                domService.showErrorMessage(error)
           })
        }else{
            domService.showErrorMessage("Already stopped!!")
        }
        
    })

    document.getElementById("download").addEventListener('click', ()=>{
        if(sniffingStatus == STATUS.STOPED || STATUS.INACTIVE){
            domService.downloadPackets()
        }else{
            domService.showErrorMessage("Please stop sniffer before downloading packets.")
        }
    })

    document.getElementById("restart").addEventListener('click', ()=>{
        if(!(domService.targetInterfaces.length > 0)){
            domService.showErrorMessage("Please select an interface")
            return 
        }

        sniffingStatus = STATUS.STOPED
        domService.setStatusMessage(sniffingStatus, "text-danger")
        if (eventSource) {
            eventSource.close();
        }

        domService.clearTable()

        httpService.stopSniffing().then(()=>{
            httpService.startSniffing(domService.targetInterfaces).then(()=>{
                sniffingStatus = STATUS.SNIFFING
                domService.setStatusMessage(sniffingStatus, "text-success")
                setPacketStreamListener()
            }).catch((error)=>{
                domService.showErrorMessage(error)
           })
        }).catch((error)=>{
            domService.showErrorMessage(error)
       })
        
    })

    document.getElementById("filter").addEventListener('input', (event)=> {
        const filter = event.target.value.toLowerCase();

        domService.filterTable(filter)
    });

}

getInterfaces()
setActionListeners()

