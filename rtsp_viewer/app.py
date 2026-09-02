from flask import Flask, Response, render_template, request
import subprocess
import threading
import re

app = Flask(__name__)

ffmpeg_process = None
process_lock = threading.Lock()


def stop_camera():
    global ffmpeg_process

    with process_lock:
        if ffmpeg_process is not None:
            try:
                ffmpeg_process.kill()
                ffmpeg_process.wait(timeout=2)
            except Exception:
                pass

            ffmpeg_process = None


def start_camera(rtsp_url):
    global ffmpeg_process

    stop_camera()

    command = [
        "ffmpeg",

        "-rtsp_transport",
        "tcp",

        "-i",
        rtsp_url,

        "-an",

        "-c:v",
        "mjpeg",

        "-q:v",
        "5",

        "-f",
        "mpjpeg",

        "pipe:1"
    ]

    ffmpeg_process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        bufsize=0
    )


def generate_frames():

    global ffmpeg_process

    buffer = b""

    while True:

        if ffmpeg_process is None:
            break

        chunk = ffmpeg_process.stdout.read(4096)

        if not chunk:
            break

        buffer += chunk

        while True:

            start = buffer.find(b"\xff\xd8")

            if start == -1:
                break

            end = buffer.find(
                b"\xff\xd9",
                start + 2
            )

            if end == -1:
                break

            frame = buffer[
                start:end + 2
            ]

            buffer = buffer[
                end + 2:
            ]

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n"
                b"Content-Length: "
                + str(len(frame)).encode()
                + b"\r\n\r\n"
                + frame
                + b"\r\n"
            )


@app.route("/", methods=["GET", "POST"])
def index():

    rtsp_url = ""
    status = "آماده"

    if request.method == "POST":

        rtsp_url = request.form.get(
            "rtsp_url",
            ""
        ).strip()

        if rtsp_url:

            try:

                start_camera(rtsp_url)

                status = "🟢 در حال دریافت تصویر"

            except Exception as e:

                status = f"🔴 خطا: {e}"

    return render_template(
        "index.html",
        rtsp_url=rtsp_url,
        status=status
    )


@app.route("/video")
def video():

    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@app.route("/stop")
def stop():

    stop_camera()

    return "Camera stopped"


@app.route("/health")
def health():

    if ffmpeg_process is not None:
        return {
            "status": "connected"
        }

    return {
        "status": "disconnected"
    }


if __name__ == "__main__":

    print()
    print("==============================")
    print("       RTSP VIEWER")
    print("==============================")
    print()
    print("Browser:")
    print("http://127.0.0.1:5000")
    print()

    app.run(
        host="0.0.0.0",
        port=5000,
        threaded=True
    )