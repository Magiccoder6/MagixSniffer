
class PacketData():
    def __init__(self):
        self.protocol: str | None = None
        self.source_ip: str | None = None
        self.destination_ip: str | None = None
        self.data: str | None = None
        self.source_port: int | None = None
        self.destination_port: int | None = None
        self.time: str | None = None
        self.number: int | None = None
        self.length: int | None = None
        self.color: str | None = None
        
    def to_json(self):
        return {
            "protocol": self.protocol,
            "source_ip": self.source_ip,
            "destination_ip": self.destination_ip,
            "data": self.data,
            "source_port": self.source_port,
            "destination_port": self.destination_port,
            "time": self.time,
            "number": self.number,
            "length": self.length,
            "color": self.color
        }