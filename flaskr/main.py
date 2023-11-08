import logging
import threading
from flask import Flask, Response, jsonify, render_template, request
from scapy.all import sniff
from helpers.helper import get_windows_network_interfaces, process_packet

app = Flask(__name__)
app.logger.setLevel(logging.INFO)
app.logger.addHandler(logging.FileHandler('error.log'))

sniffing = False
interfaces = []
packets = []

@app.route("/")
def dashboard():
    return render_template("index.html")

@app.route("/get_interfaces")
def get_interfaces():
    return jsonify(get_windows_network_interfaces(app=app))

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
    sniff(prn=lambda packet: process_packet(packet=packet, packets=packets, app=app), iface=iface, stop_filter=lambda x: not sniffing or len(x)>20000)

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
    

if __name__ == "__main__":
    app.run(debug=True)