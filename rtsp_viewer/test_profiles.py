from onvif import ONVIFCamera
import subprocess


CAMERA_IP = "37.202.152.217"
ONVIF_PORT = 8001

USERNAME = "admin"
PASSWORD = "Myd@5113115"


print("=" * 70)
print("ONVIF PROFILE STREAM TEST")
print("=" * 70)


camera = ONVIFCamera(
    CAMERA_IP,
    ONVIF_PORT,
    USERNAME,
    PASSWORD
)

media = camera.create_media_service()
profiles = media.GetProfiles()


for index, profile in enumerate(profiles, 1):

    print("\n" + "=" * 70)
    print(f"PROFILE {index}: {profile.Name}")
    print("=" * 70)

    request = {
        "StreamSetup": {
            "Stream": "RTP-Unicast",
            "Transport": {
                "Protocol": "RTSP"
            }
        },
        "ProfileToken": profile.token
    }

    result = media.GetStreamUri(request)

    uri = result.Uri

    # اضافه کردن username/password
    authenticated_uri = (
        f"rtsp://{USERNAME}:"
        f"Myd%405113115@"
        + uri.replace("rtsp://", "")
    )

    print("URI:")
    print(authenticated_uri)

    print("\nTesting stream for 5 seconds...\n")

    command = [
        "ffmpeg",
        "-hide_banner",
        "-rtsp_transport",
        "tcp",
        "-i",
        authenticated_uri,
        "-t",
        "5",
        "-an",
        "-f",
        "null",
        "-"
    ]

    process = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    output = process.stderr

    print(output)

    if process.returncode == 0:
        print(f"\n✅ PROFILE {index} WORKS")
    else:
        print(f"\n❌ PROFILE {index} FAILED")


print("\n" + "=" * 70)
print("ALL TESTS FINISHED")
print("=" * 70)