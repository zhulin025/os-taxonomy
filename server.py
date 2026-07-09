import http.server
import socketserver
import os
import sys

PORT = 8000

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)
    
    socketserver.TCPServer.allow_reuse_address = True
    
    httpd = None
    for port_attempt in range(PORT, PORT + 100):
        try:
            httpd = socketserver.TCPServer(("", port_attempt), MyHandler)
            PORT = port_attempt
            break
        except OSError as e:
            # 兼容不同系统的端口被占用错误码
            continue
                
    if not httpd:
        print("无法绑定任何可用端口（尝试了 8000-8099）。")
        sys.exit(1)
        
    print(f"正在启动 Marble Taxonomy 可视化本地服务器...")
    print(f"请在浏览器中访问: http://localhost:{PORT}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止。")
        sys.exit(0)
