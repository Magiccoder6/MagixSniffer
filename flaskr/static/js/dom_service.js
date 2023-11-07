
class DOMService{
    constructor(){
        this.packets = []
        this.tempPackets = []
        this.packet_count = 0
        this.targetInterfaces = []
    }

    displayInterfaces(data){
        for(var i=0;i<data.length;i++){
            var interfacesContainer = document.getElementById("inf_container")
        
            var checkBoxContainer = document.createElement("div")
            checkBoxContainer.classList.add("form-check")
            checkBoxContainer.classList.add("form-check-inline")
            var checkBox = document.createElement('input')
            checkBox.type = "checkbox"
            checkBox.id = data[i]
            checkBox.classList.add("form-check-input")
            checkBoxContainer.appendChild(checkBox)
            var label = document.createElement('label')
            label.classList.add("form-check-label")
            label.innerHTML = data[i]
            checkBoxContainer.appendChild(label)
            interfacesContainer.appendChild(checkBoxContainer)

            checkBox.addEventListener("change", (event)=>{
                const id = event.target.id

                if(event.target.checked){
                    this.targetInterfaces.push(id)
                }else{
                    this.targetInterfaces.splice(this.targetInterfaces.indexOf(id), 1)
                }
            })
        }
       
    }

    setStatusMessage(message, colorClass){
        let status = document.getElementById("status")
        status.innerHTML = message
        status.classList = []
        status.classList.add(colorClass)
    }

    addRowToTable(data, tempArray){
        this.packet_count += 1

        var table = document.getElementById('table')
        
        var newRow = table.insertRow();

        var number = newRow.insertCell(0);
        number.innerHTML = this.packet_count

        var time = newRow.insertCell(1);
        time.innerHTML = data.time

        var source = newRow.insertCell(2);
        source.innerHTML = (data.source_ip ?? "No IP") + ':' + (data.source_port ?? "")

        var destination = newRow.insertCell(3);
        destination.innerHTML = (data.destination_ip ?? "No IP") + ':' + (data.destination_port ?? "")

        var protocol = newRow.insertCell(4);
        protocol.innerHTML = (data.protocol ?? "No Protocol")

        var length = newRow.insertCell(5);
        length.innerHTML = (data.length ?? "No Length")

        var info = newRow.insertCell(6);
        info.innerHTML = (data.data ?? "No Info").slice(0, 40)

        newRow.classList.add(data.color??'')

        newRow.addEventListener("click", ()=> {
            const rowIndex = newRow.rowIndex -1; 
            document.getElementById("content_view").innerHTML = tempArray ? tempArray[rowIndex].data : this.packets[rowIndex].data
        });
    }

    clearTable(){
        var table = document.getElementById('table')

        while (table.rows.length > 0) {
            table.deleteRow(0);
        }
        this.packet_count = 0;
        this.packets = []
    }

    downloadPackets(){
        if(this.packet_count > 0){
            const csvContent = convertArrayOfObjectsToCSV(this.packets);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = "packets-"+new Date().getTime();
        a.style.display = 'none';
        document.body.appendChild(a);
        
        a.click();
        
        window.URL.revokeObjectURL(url);
        }
    }

    clearTableForFiltering(){
        var table = document.getElementById('table')

        while (table.rows.length > 0) {
            table.deleteRow(0);
        }
        this.packet_count = 0
    }

    filterTable(value){
        this.clearTableForFiltering()
        
        if(value.length > 0){
            
            const filteredData = this.packets.filter(obj => 
                obj.protocol.toLowerCase().includes(value) || 
                (obj.destination_ip??"").toLowerCase().includes(value) || 
                (obj.source_ip??"").toLowerCase().includes(value) ||
                (obj.destination_port??"").toString().toLowerCase().includes(value) ||
                (obj.source_port??"").toString().toLowerCase().includes(value));
                
            for(var x=0; x < filteredData.length;x++){
                this.addRowToTable(filteredData[x], filteredData)
            }
        }else{
            for(var j=0;j<this.packets.length;j++){
                this.addRowToTable(this.packets[j])
            }
        }
    }

    showErrorMessage(message){
        Swal.fire({
            position: "center",
            icon: "info",
            title: message,
            showConfirmButton: false,
            timer: 2000
        });
    }

    startLoader(){

    }

    stopLoader(){

    }

}

function convertArrayOfObjectsToCSV(array) {
    const separator = ','; // Change this to a different separator if needed
    const keys = Object.keys(array[0]);

    const csv = array.map(item => {
        return keys.map(key => {
            const escaped = String(item[key]).replace(/"/g, '""');
            return `"${escaped}"`;
        }).join(separator);
    });

    csv.unshift(keys.join(separator)); // Add the header row

    return csv.join('\n');
}

