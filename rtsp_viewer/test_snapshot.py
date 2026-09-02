from onvif import ONVIFCamera


CAMERA_IP = "37.202.152.217"
ONVIF_PORT = 8001

USERNAME = "admin"
PASSWORD = "Myd@5113115"


print("=" * 60)
print("ONVIF STREAM URI TEST")
print("=" * 60)


try:

    print("\n[1] Connecting...")

    camera = ONVIFCamera(
        CAMERA_IP,
        ONVIF_PORT,
        USERNAME,
        PASSWORD
    )

    print("[OK] Connected")


    print("\n[2] Creating Media service...")

    media = camera.create_media_service()

    print("[OK] Media service created")


    print("\n[3] Getting profiles...")

    profiles = media.GetProfiles()

    print(
        f"[OK] Found {len(profiles)} profiles"
    )


    for index, profile in enumerate(
        profiles,
        start=1
    ):

        print("\n" + "=" * 60)

        print(
            f"PROFILE {index}"
        )

        print(
            "Name:",
            profile.Name
        )

        print(
            "Token:",
            profile.token
        )

        try:

            request = {
                "StreamSetup": {
                    "Stream": "RTP-Unicast",
                    "Transport": {
                        "Protocol": "RTSP"
                    }
                },
                "ProfileToken": profile.token
            }

            print("\nRequesting Stream URI...")

            result = media.GetStreamUri(
                request
            )

            print("\n[OK] Stream URI received")

            print(
                "URI:",
                result.Uri
            )

            print(
                "InvalidAfterConnect:",
                result.InvalidAfterConnect
            )

            print(
                "InvalidAfterReboot:",
                result.InvalidAfterReboot
            )

            print(
                "Timeout:",
                result.Timeout
            )

        except Exception as e:

            print(
                "\n[ERROR] GetStreamUri failed"
            )

            print(
                "Type:",
                type(e).__name__
            )

            print(
                "Error:",
                e
            )


    print("\n" + "=" * 60)
    print("TEST FINISHED")
    print("=" * 60)


except Exception as e:

    print("\n" + "=" * 60)
    print("ONVIF ERROR")
    print("=" * 60)

    print(
        "Type:",
        type(e).__name__
    )

    print(
        "Error:",
        e
    )