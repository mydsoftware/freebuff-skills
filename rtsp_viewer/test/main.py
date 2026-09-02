import hashlib
import os
import re
import threading
import time
import webbrowser

from flask import Flask, Response
import websocket


# =========================================================
# CONFIG
# =========================================================

CAMERA_IP = "37.202.152.217"
CAMERA_PORT = 8001

USERNAME = "admin"
PASSWORD = "Myd@5113115"

WS_PATH = "/media/flv/video2"

LOCAL_HOST = "127.0.0.1"
LOCAL_PORT = 5000


# =========================================================
# FLASK
# =========================================================

app = Flask(__name__)

clients = []
clients_lock = threading.Lock()


# =========================================================
# DIGEST AUTH
# =========================================================

def md5(value):
    return hashlib.md5(value.encode()).hexdigest()


def make_digest_authorization(
    username,
    password,
    realm,
    nonce,
    uri,
    method="GET",
    qop="auth",
    nc="00000001",
    cnonce=None
):
    if cnonce is None:
        cnonce = os.urandom(16).hex()

    ha1 = md5(
        f"{username}:{realm}:{password}"
    )

    ha2 = md5(
        f"{method}:{uri}"
    )

    response = md5(
        f"{ha1}:{nonce}:{nc}:{cnonce}:{qop}:{ha2}"
    )

    return (
        'Digest '
        f'username="{username}", '
        f'realm="{realm}", '
        f'nonce="{nonce}", '
        f'uri="{uri}", '
        f'response="{response}", '
        f'qop={qop}, '
        f'nc={nc}, '
        f'cnonce="{cnonce}"'
    )


def parse_digest_challenge(header):
    if not header:
        return None

    values = {}

    pattern = r'(\w+)=(".*?"|[^,]+)'

    for key, value in re.findall(pattern, header):
        value = value.strip()

        if value.startswith('"') and value.endswith('"'):
            value = value[1:-1]

        values[key] = value

    return values


# =========================================================
# CONNECT CAMERA
# =========================================================

def connect_camera():

    ws_url = (
        f"ws://{CAMERA_IP}:{CAMERA_PORT}"
        f"{WS_PATH}"
    )

    print()
    print("=" * 60)
    print("Connecting to camera...")
    print(ws_url)
    print("=" * 60)

    # -----------------------------------------------------
    # First connection - get Digest challenge
    # -----------------------------------------------------

    try:

        ws = websocket.create_connection(
            ws_url,
            timeout=10,
            origin=f"http://{CAMERA_IP}:{CAMERA_PORT}"
        )

    except websocket.WebSocketBadStatusException as e:

        print("Initial WebSocket response:")
        print(e)

        headers = getattr(e, "headers", {})

        www_authenticate = None

        for key, value in headers.items():

            if key.lower() == "www-authenticate":
                www_authenticate = value
                break

        if not www_authenticate:

            print("Digest challenge not found.")
            return

        print()
        print("Digest challenge:")
        print(www_authenticate)

        digest = parse_digest_challenge(
            www_authenticate
        )

        if not digest:

            print("Could not parse Digest.")
            return

        realm = digest.get("realm")
        nonce = digest.get("nonce")
        qop = digest.get("qop", "auth")

        cnonce = os.urandom(16).hex()

        nc = "00000001"

        authorization = make_digest_authorization(
            USERNAME,
            PASSWORD,
            realm,
            nonce,
            WS_PATH,
            "GET",
            qop,
            nc,
            cnonce
        )

        print()
        print("Retrying with Digest authentication...")

        headers = [
            f"Authorization: {authorization}",
            "Pragma: no-cache",
            "Cache-Control: no-cache",
            "User-Agent: Mozilla/5.0",
        ]

        ws = websocket.create_connection(
            ws_url,
            timeout=10,
            origin=f"http://{CAMERA_IP}:{CAMERA_PORT}",
            header=headers
        )

    except Exception as e:

        print("Connection error:")
        print(e)
        return

    print()
    print("======================================")
    print("CAMERA CONNECTED")
    print("======================================")

    try:

        while True:

            data = ws.recv()

            if data is None:
                break

            if isinstance(data, str):
                data = data.encode()

            # Send data to all browser clients
            with clients_lock:

                dead_clients = []

                for client in clients:

                    try:
                        client.put(data)

                    except Exception:
                        dead_clients.append(client)

                for client in dead_clients:

                    if client in clients:
                        clients.remove(client)

    except Exception as e:

        print("Camera stream stopped:")
        print(e)

    finally:

        try:
            ws.close()
        except:
            pass


# =========================================================
# STREAM BUFFER
# =========================================================

class ClientBuffer:

    def __init__(self):

        self.data = []

        self.condition = threading.Condition()

    def put(self, data):

        with self.condition:

            self.data.append(data)

            self.condition.notify()

    def get(self):

        with self.condition:

            while not self.data:

                self.condition.wait()

            return self.data.pop(0)


# =========================================================
# HTTP FLV STREAM
# =========================================================

@app.route("/video.flv")
def video_flv():

    client = ClientBuffer()

    with clients_lock:
        clients.append(client)

    def generate():

        try:

            while True:

                data = client.get()

                if data:
                    yield data

        except GeneratorExit:
            pass

        finally:

            with clients_lock:

                if client in clients:
                    clients.remove(client)

    return Response(
        generate(),
        mimetype="video/x-flv",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
        }
    )


# =========================================================
# WEB PAGE
# =========================================================

@app.route("/")
def index():

    return """
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Camera FLV Viewer</title>

<style>

html, body {
    margin: 0;
    padding: 0;
    background: #111;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

#video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: black;
}

#status {

    position: fixed;

    top: 15px;
    left: 15px;

    background: rgba(0,0,0,.7);

    color: white;

    padding: 10px 15px;

    border-radius: 6px;

    font-family: Arial;

    z-index: 10;
}

</style>

</head>

<body>

<div id="status">
Connecting...
</div>

<video
    id="video"
    controls
    autoplay
    muted
></video>

<script src="https://cdn.jsdelivr.net/npm/flv.js@latest/dist/flv.min.js"></script>

<script>

const video = document.getElementById("video");
const status = document.getElementById("status");

function startPlayer() {

    if (!flvjs.isSupported()) {

        status.innerText =
            "FLV is not supported by this browser";

        return;
    }

    status.innerText =
        "Starting camera...";

    const player = flvjs.createPlayer({

        type: "flv",

        url: "/video.flv",

        isLive: true,

        hasAudio: false,

        hasVideo: true

    });

    player.attachMediaElement(video);

    player.load();

    player.play().catch(function(error) {

        console.log(error);

        status.innerText =
            "Click Play to start video";

    });

    player.on(
        flvjs.Events.ERROR,
        function(errorType, errorDetail, errorInfo) {

            console.log(
                "FLV ERROR:",
                errorType,
                errorDetail,
                errorInfo
            );

            status.innerText =
                "Stream error";

        }
    );

    video.addEventListener(
        "playing",
        function() {

            status.innerText =
                "LIVE";

        }
    );
}

startPlayer();

</script>

</body>

</html>
"""


# =========================================================
# START CAMERA THREAD
# =========================================================

def camera_thread():

    while True:

        try:

            connect_camera()

        except Exception as e:

            print("Camera thread error:")
            print(e)

        print(
            "Reconnecting in 3 seconds..."
        )

        time.sleep(3)


# =========================================================
# START
# =========================================================

if __name__ == "__main__":

    thread = threading.Thread(
        target=camera_thread,
        daemon=True
    )

    thread.start()

    url = (
        f"http://{LOCAL_HOST}:{LOCAL_PORT}"
    )

    print()
    print("=" * 60)
    print("LOCAL CAMERA VIEWER")
    print("=" * 60)
    print()
    print("Chrome:")
    print(url)
    print()
    print("Camera WebSocket:")
    print(
        f"ws://{CAMERA_IP}:{CAMERA_PORT}{WS_PATH}"
    )
    print()
    print("=" * 60)

    webbrowser.open(url)

    app.run(
        host=LOCAL_HOST,
        port=LOCAL_PORT,
        threaded=True,
        debug=False
    )