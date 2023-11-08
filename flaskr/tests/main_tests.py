import json
import unittest
from unittest.mock import patch
from main import app
from helpers.helper import get_windows_network_interfaces, packet_to_json
from scapy.layers.inet import IP, TCP


class UnitTest(unittest.TestCase):
    def test_get_interfaces(self):
        interfaces = get_windows_network_interfaces()
        self.assertTrue(isinstance(interfaces, list))

    def test_packet_to_json(self):
        ip_packet = IP(dst="192.168.1.1", src="192.168.1.2")
        tcp_packet = TCP(sport=12345, dport=80)
        combined = ip_packet / tcp_packet
        data = packet_to_json(packet=combined, packets=[])
        self.assertEqual("192.168.1.1", data.destination_ip)
        self.assertEqual("192.168.1.2", data.source_ip)
        self.assertEqual(12345, data.source_port)
        self.assertEqual(80, data.destination_port)


class IntegrationTest(unittest.TestCase):
    def setUp(self):
        app.testing = True
        self.app = app.test_client()

    def tearDown(self):
        pass

    def test_index_page(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'<html>', response.data)

    def test_get_interfaces(self):
        response = self.app.get('/get_interfaces')
        self.assertEqual(response.status_code, 200)

    @patch('main.start_sniffing') #mock threaded function
    def test_start_sniffing(self, start_sniffing):
        start_sniffing.return_value = None

        data = json.loads(self.app.get('/get_interfaces').data)
        response = self.app.post('/start_sniffing', data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual("Sniffing started.", response.data.decode('utf-8'))

    def test_stop_sniffing(self):
        response = self.app.post('/stop_sniffing')
        self.assertEqual(response.status_code, 200)
        self.assertEqual("Sniff stopped.", response.data.decode('utf-8'))

if __name__ == '__main__':
    unittest.main()