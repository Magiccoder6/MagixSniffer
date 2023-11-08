from datetime import datetime
import json
from flask import Flask
import psutil
from scapy.all import *
from scapy.layers.inet import IP, TCP, UDP, ICMP
from models.models import PacketData


def get_windows_network_interfaces(app: Flask):
    try:
        interfaces = []
        for interface, addrs in psutil.net_if_addrs().items():
            for addr in addrs:
                if addr.family == psutil.AF_LINK:
                    interfaces.append(interface)
        return interfaces
    except Exception as e:
        app.log_exception(e)

def process_packet(packet: Packet, packets: list, app:Flask):
    try:
        packet_data = packet_to_json(packet, app=app)
    
        if(packet_data is not None):
            packets.append(json.dumps(packet_data.to_json()))
            time.sleep(1)
    except Exception as e:
        app.log_exception(exc_info=e)
    
        
def packet_to_json(packet:Packet, app:Flask)->PacketData | None:
    try:
        packet_data = PacketData()
        packet_data.time = datetime.now().strftime("%H:%M:%S")

        if packet.haslayer("TCP"):
            packet_data.source_port = packet[TCP].sport
            packet_data.destination_port = packet[TCP].dport
            packet_data.color = "table-primary"
        elif packet.haslayer("UDP"):
            packet_data.source_port = packet[UDP].sport
            packet_data.destination_port = packet[UDP].dport
            packet_data.color = "table-danger"
        elif packet.haslayer("ICMP"):
            packet_data.destination_port = packet[ICMP].dport
            packet_data.source_port = packet[ICMP].sport
            packet_data.color = "table-info"
        else:
            return None
            
        if packet.haslayer(Raw):
            packet_data.data = packet[Raw].load.decode('utf-8', errors='ignore')
        packet_data.length = len(packet)
        packet_data.protocol = packet.sprintf("%IP.proto%")
        if packet.haslayer("IP"):
            packet_data.destination_ip = packet[IP].dst
            packet_data.source_ip = packet[IP].src
        return packet_data
    except Exception as e:
        app.log_exception(e)
    

