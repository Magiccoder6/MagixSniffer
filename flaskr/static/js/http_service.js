class HttpService{

    async getInterfaces(){
        var interfaces = await fetch(window.location.origin+"/get_interfaces")
        return interfaces
    }

    async startSniffing(data){
        await fetch('/start_sniffing', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)})
    }

    async stopSniffing(){
        await fetch('/stop_sniffing', { method: 'POST' })
    }
}