import threading
from flask import Flask, Response, jsonify, render_template, request
from scapy.all import sniff, Packet
from helpers.helper import get_windows_network_interfaces, packet_to_json
import json, time

app = Flask(__name__)

sniffing = False
interfaces = []
packets = []

@app.route("/")
def dashboard():
    return render_template("index.html")

@app.route("/set_target_interface", methods=["POST"])
def set_target_interface():
    data = request.form.getlist('checkbox')
    print(data)
    return Response(status=200)


@app.route("/get_interfaces")
def get_interfaces():
    return jsonify(get_windows_network_interfaces())

#return a stream of packets
@app.route('/stream_packets')
def stream_numbers():
    def generate():
        while True:
            while not packets and sniffing:
                pass
            
            if not sniffing:
                break

            packet_data = packets.pop(0)
            yield f"data: {packet_data}\n\n"

    return Response(generate(), content_type='text/event-stream')

def start_sniffing(iface):
    global sniffing
    sniffing = True
    global packets
    packets = [] 
    sniff(prn=process_packet, iface=iface, stop_filter=lambda x: not sniffing or len(x)>20000)

@app.route('/start_sniffing', methods=['POST'])
def start():
    interfaces = request.json

    for iface in interfaces:
        sniff_thread = threading.Thread(target=start_sniffing, args=(iface,))
        sniff_thread.start()

    return "Sniffing started."

@app.route('/stop_sniffing', methods=['POST'])
def stop_loop():
    global sniffing
    sniffing = False
    return "Sniff stopped."

def process_packet(packet: Packet):
    packet_data = packet_to_json(packet, packets=packets)
    
    if(packet_data is not None):
        packets.append(json.dumps(packet_data.to_json()))
        time.sleep(1)

if __name__ == "__main__":
    app.run(debug=True)