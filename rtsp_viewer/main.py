import subprocess
import threading
import time

from kivy.app import App
from kivy.clock import Clock
from kivy.core.text import LabelBase
from kivy.graphics.texture import Texture
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.image import Image
from kivy.uix.label import Label
from kivy.uix.popup import Popup
from kivy.uix.textinput import TextInput


# ============================================================
# DEFAULT CAMERA SETTINGS
# ============================================================

DEFAULT_CAMERA_1 = (
    "rtsp://admin:Myd%405113115@37.202.152.217:8554/"
    "Streaming/Channels/1"
)

DEFAULT_CAMERA_2 = (
    "rtsp://admin:Myd%405113115@37.202.152.217:8552/"
    "Streaming/Channels/1"
)


# ============================================================
# VIDEO SETTINGS
# ============================================================

VIDEO_WIDTH = 1920
VIDEO_HEIGHT = 1080

VIDEO_FPS = 12

FRAME_SIZE = (
    VIDEO_WIDTH *
    VIDEO_HEIGHT *
    3
)

RECONNECT_DELAY = 2

IMAGE_LOSS_TIMEOUT = 4

READ_SIZE = 1024 * 1024


# ============================================================
# FONT
# ============================================================

LabelBase.register(
    name="TimesNewRoman",
    fn_regular="assets/fonts/times.ttf"
)


# ============================================================
# CAMERA THREAD
# ============================================================

class CameraThread(threading.Thread):

    def __init__(
        self,
        url,
        frame_callback,
        status_callback
    ):

        super().__init__(daemon=True)

        self.url = url

        self.frame_callback = frame_callback

        self.status_callback = status_callback

        self.running = True

        self.process = None

        self.process_lock = threading.Lock()

        self.frame_counter = 0

    # ========================================================
    # RUN
    # ========================================================

    def run(self):

        while self.running:

            try:

                self.status_callback(
                    "Status: Connecting..."
                )

                self.start_ffmpeg()

                if not self.running:
                    break

                if self.process is None:
                    self.wait_before_reconnect()
                    continue

                self.status_callback(
                    "Status: Connected"
                )

                self.read_frames()

            except Exception as e:

                if self.running:

                    self.status_callback(
                        f"Status: Error - {e}"
                    )

            finally:

                self.stop_ffmpeg()

            if self.running:

                self.status_callback(
                    "Status: Reconnecting..."
                )

                self.wait_before_reconnect()

    # ========================================================
    # START FFMPEG
    # ========================================================

    def start_ffmpeg(self):

        self.stop_ffmpeg()

        command = [

            "ffmpeg",

            # ------------------------------------------------
            # RTSP
            # ------------------------------------------------

            "-rtsp_transport",
            "tcp",

            "-rtsp_flags",
            "prefer_tcp",

            # ------------------------------------------------
            # LOW LATENCY
            # ------------------------------------------------

            "-fflags",
            "nobuffer",

            "-flags",
            "low_delay",

            "-probesize",
            "32",

            "-analyzeduration",
            "0",

            # ------------------------------------------------
            # INPUT
            # ------------------------------------------------

            "-i",
            self.url,

            # ------------------------------------------------
            # VIDEO ONLY
            # ------------------------------------------------

            "-map",
            "0:v:0",

            "-an",

            # ------------------------------------------------
            # OUTPUT
            # ------------------------------------------------

            "-pix_fmt",
            "rgb24",

            "-f",
            "rawvideo",

            "pipe:1"
        ]

        self.process = subprocess.Popen(

            command,

            stdout=subprocess.PIPE,

            stderr=subprocess.DEVNULL,

            stdin=subprocess.DEVNULL,

            bufsize=0
        )

    # ========================================================
    # READ RAW FRAMES
    # ========================================================

    def read_frames(self):

        buffer = bytearray()

        while self.running:

            process = self.process

            if process is None:
                break

            try:

                chunk = process.stdout.read(
                    READ_SIZE
                )

            except Exception:

                break

            if not chunk:

                break

            buffer.extend(chunk)

            # ------------------------------------------------
            # Extract complete frames
            # ------------------------------------------------

            while (
                len(buffer)
                >=
                FRAME_SIZE
            ):

                frame_bytes = bytes(
                    buffer[
                        :FRAME_SIZE
                    ]
                )

                del buffer[
                    :FRAME_SIZE
                ]

                self.frame_counter += 1

                self.frame_callback(
                    frame_bytes
                )

    # ========================================================
    # WAIT
    # ========================================================

    def wait_before_reconnect(self):

        for _ in range(
            int(RECONNECT_DELAY * 10)
        ):

            if not self.running:
                return

            time.sleep(0.1)

    # ========================================================
    # STOP FFMPEG
    # ========================================================

    def stop_ffmpeg(self):

        with self.process_lock:

            process = self.process

            self.process = None

            if process is None:
                return

            try:
                process.kill()
            except Exception:
                pass

            try:
                process.wait(
                    timeout=2
                )
            except Exception:
                pass

    # ========================================================
    # STOP THREAD
    # ========================================================

    def stop(self):

        self.running = False

        self.stop_ffmpeg()


# ============================================================
# MAIN APPLICATION
# ============================================================

class RTSPViewerApp(App):

    # ========================================================
    # BUILD
    # ========================================================

    def build(self):

        self.title = "RTSP Camera Viewer"

        # ----------------------------------------------------
        # CAMERA STATE
        # ----------------------------------------------------

        self.camera_thread = None

        self.current_camera = "Camera 1"

        self.latest_frame = None

        self.frame_lock = threading.Lock()

        self.last_frame_time = 0

        self.video_lost = False

        self.connecting = False

        # ----------------------------------------------------
        # CAMERAS
        # ----------------------------------------------------

        self.cameras = {

            "Camera 1":
                DEFAULT_CAMERA_1,

            "Camera 2":
                DEFAULT_CAMERA_2
        }

        # ====================================================
        # ROOT
        # ====================================================

        root = BoxLayout(

            orientation="vertical",

            padding=10,

            spacing=10
        )

        # ====================================================
        # TOP MENU
        # ====================================================

        menu = BoxLayout(

            size_hint_y=None,

            height=55,

            spacing=10
        )

        # ----------------------------------------------------
        # CAMERA 1
        # ----------------------------------------------------

        camera1_button = Button(

            text="Camera 1",

            font_name="TimesNewRoman",

            font_size=18
        )

        camera1_button.bind(

            on_press=lambda x:
            self.select_camera(
                "Camera 1"
            )
        )

        # ----------------------------------------------------
        # CAMERA 2
        # ----------------------------------------------------

        camera2_button = Button(

            text="Camera 2",

            font_name="TimesNewRoman",

            font_size=18
        )

        camera2_button.bind(

            on_press=lambda x:
            self.select_camera(
                "Camera 2"
            )
        )

        # ----------------------------------------------------
        # SETTINGS
        # ----------------------------------------------------

        settings_button = Button(

            text="Settings",

            font_name="TimesNewRoman",

            font_size=18
        )

        settings_button.bind(

            on_press=self.open_settings
        )

        menu.add_widget(
            camera1_button
        )

        menu.add_widget(
            camera2_button
        )

        menu.add_widget(
            settings_button
        )

        root.add_widget(
            menu
        )

        # ====================================================
        # CAMERA NAME
        # ====================================================

        self.camera_name = Label(

            text="Camera 1",

            font_name="TimesNewRoman",

            font_size=20,

            size_hint_y=None,

            height=40
        )

        root.add_widget(
            self.camera_name
        )

        # ====================================================
        # STATUS
        # ====================================================

        self.status = Label(

            text="Status: Ready",

            font_name="TimesNewRoman",

            font_size=18,

            size_hint_y=None,

            height=40
        )

        root.add_widget(
            self.status
        )

        # ====================================================
        # VIDEO
        # ====================================================

        self.video = Image(

            allow_stretch=True,

            keep_ratio=True
        )

        root.add_widget(
            self.video
        )

        # ====================================================
        # CONTROLS
        # ====================================================

        controls = BoxLayout(

            size_hint_y=None,

            height=55,

            spacing=10
        )

        # ----------------------------------------------------
        # CONNECT
        # ----------------------------------------------------

        connect_button = Button(

            text="Connect",

            font_name="TimesNewRoman",

            font_size=18
        )

        connect_button.bind(
            on_press=self.connect_camera
        )

        # ----------------------------------------------------
        # STOP
        # ----------------------------------------------------

        stop_button = Button(

            text="Stop",

            font_name="TimesNewRoman",

            font_size=18
        )

        stop_button.bind(
            on_press=self.stop_camera
        )

        controls.add_widget(
            connect_button
        )

        controls.add_widget(
            stop_button
        )

        root.add_widget(
            controls
        )

        # ====================================================
        # FRAME UPDATE
        # ====================================================

        Clock.schedule_interval(

            self.update_frame,

            1 / 30
        )

        # ====================================================
        # IMAGE WATCHDOG
        # ====================================================

        Clock.schedule_interval(

            self.check_image_loss,

            1
        )

        return root

    # ========================================================
    # SELECT CAMERA
    # ========================================================

    def select_camera(
        self,
        camera_name
    ):

        self.stop_camera()

        self.current_camera = camera_name

        self.camera_name.text = camera_name

        self.status.text = (
            "Status: Ready"
        )

        url = self.cameras.get(
            camera_name,
            ""
        )

        if not url:

            self.status.text = (
                "Status: No RTSP URL configured"
            )

            return

        self.start_camera(url)

    # ========================================================
    # CONNECT CAMERA
    # ========================================================

    def connect_camera(
        self,
        instance=None
    ):

        url = self.cameras.get(

            self.current_camera,

            ""
        )

        if not url:

            self.status.text = (
                "Status: RTSP URL is empty"
            )

            return

        self.stop_camera()

        Clock.schedule_once(

            lambda dt:
            self.start_camera(url),

            0.2
        )

    # ========================================================
    # START CAMERA
    # ========================================================

    def start_camera(
        self,
        url
    ):

        if not url:

            self.status.text = (
                "Status: RTSP URL is empty"
            )

            return

        with self.frame_lock:

            self.latest_frame = None

        self.last_frame_time = time.time()

        self.video_lost = False

        self.connecting = True

        self.status.text = (
            "Status: Connecting..."
        )

        self.camera_thread = CameraThread(

            url,

            self.on_new_frame,

            self.on_status
        )

        self.camera_thread.start()

    # ========================================================
    # NEW FRAME
    # ========================================================

    def on_new_frame(
        self,
        frame
    ):

        thread = self.camera_thread

        if thread is None:
            return

        if not thread.running:
            return

        with self.frame_lock:

            self.latest_frame = frame

            self.last_frame_time = time.time()

            self.video_lost = False

    # ========================================================
    # STATUS
    # ========================================================

    def on_status(
        self,
        message
    ):

        Clock.schedule_once(

            lambda dt:
            self.set_status(message)
        )

    # ========================================================
    # SET STATUS
    # ========================================================

    def set_status(
        self,
        message
    ):

        if self.camera_thread is None:
            return

        self.status.text = message

    # ========================================================
    # IMAGE LOSS
    # ========================================================

    def check_image_loss(
        self,
        dt
    ):

        thread = self.camera_thread

        if not thread:
            return

        if not thread.running:
            return

        elapsed = (

            time.time()
            -
            self.last_frame_time
        )

        if elapsed >= IMAGE_LOSS_TIMEOUT:

            if not self.video_lost:

                self.video_lost = True

                self.status.text = (
                    "Status: Video Lost - Reconnecting..."
                )

    # ========================================================
    # UPDATE VIDEO
    # ========================================================

    def update_frame(
        self,
        dt
    ):

        with self.frame_lock:

            frame = self.latest_frame

        if frame is None:
            return

        try:

            texture = Texture.create(

                size=(
                    VIDEO_WIDTH,
                    VIDEO_HEIGHT
                ),

                colorfmt="rgb"
            )

            texture.blit_buffer(

                frame,

                colorfmt="rgb",

                bufferfmt="ubyte"
            )

            texture.flip_vertical()

            self.video.texture = texture

        except Exception:

            pass

    # ========================================================
    # STOP CAMERA
    # ========================================================

    def stop_camera(
        self,
        instance=None
    ):

        thread = self.camera_thread

        self.camera_thread = None

        if thread:

            thread.stop()

            if (

                thread.is_alive()

                and

                threading.current_thread()
                != thread

            ):

                thread.join(
                    timeout=2
                )

        with self.frame_lock:

            self.latest_frame = None

        self.video.texture = None

        self.video_lost = False

        self.connecting = False

        self.status.text = (
            "Status: Stopped"
        )

    # ========================================================
    # SETTINGS
    # ========================================================

    def open_settings(
        self,
        instance
    ):

        layout = BoxLayout(

            orientation="vertical",

            padding=10,

            spacing=10
        )

        # ----------------------------------------------------
        # CAMERA 1
        # ----------------------------------------------------

        camera1_input = TextInput(

            text=self.cameras[
                "Camera 1"
            ],

            font_name="TimesNewRoman",

            font_size=16,

            multiline=False
        )

        # ----------------------------------------------------
        # CAMERA 2
        # ----------------------------------------------------

        camera2_input = TextInput(

            text=self.cameras[
                "Camera 2"
            ],

            font_name="TimesNewRoman",

            font_size=16,

            multiline=False
        )

        # ----------------------------------------------------
        # LABEL CAMERA 1
        # ----------------------------------------------------

        layout.add_widget(

            Label(

                text="Camera 1 RTSP URL",

                font_name="TimesNewRoman"
            )
        )

        layout.add_widget(
            camera1_input
        )

        # ----------------------------------------------------
        # LABEL CAMERA 2
        # ----------------------------------------------------

        layout.add_widget(

            Label(

                text="Camera 2 RTSP URL",

                font_name="TimesNewRoman"
            )
        )

        layout.add_widget(
            camera2_input
        )

        # ----------------------------------------------------
        # SAVE
        # ----------------------------------------------------

        save_button = Button(

            text="Save",

            font_name="TimesNewRoman",

            font_size=18,

            size_hint_y=None,

            height=50
        )

        layout.add_widget(
            save_button
        )

        # ----------------------------------------------------
        # POPUP
        # ----------------------------------------------------

        popup = Popup(

            title="Camera Settings",

            content=layout,

            size_hint=(0.9, 0.7)
        )

        # ----------------------------------------------------
        # SAVE SETTINGS
        # ----------------------------------------------------

        def save_settings(
            instance
        ):

            self.cameras[
                "Camera 1"
            ] = camera1_input.text.strip()

            self.cameras[
                "Camera 2"
            ] = camera2_input.text.strip()

            popup.dismiss()

            self.status.text = (
                "Status: Settings Saved"
            )

        save_button.bind(
            on_press=save_settings
        )

        popup.open()

    # ========================================================
    # APPLICATION STOP
    # ========================================================

    def on_stop(self):

        self.stop_camera()


# ============================================================
# START
# ============================================================

if __name__ == "__main__":

    RTSPViewerApp().run()