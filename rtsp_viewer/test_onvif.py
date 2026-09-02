from onvif import ONVIFCamera


# ============================================================
# CAMERA
# ============================================================

CAMERA_IP = "37.202.152.217"
ONVIF_PORT = 8001

USERNAME = "admin"
PASSWORD = "Myd@5113115"


print("=" * 60)
print("ONVIF CAMERA TEST")
print("=" * 60)


try:

    # ========================================================
    # CONNECT
    # ========================================================

    print("\n[1] Connecting to camera...")

    camera = ONVIFCamera(
        CAMERA_IP,
        ONVIF_PORT,
        USERNAME,
        PASSWORD
    )

    print("[OK] ONVIF connection established")


    # ========================================================
    # DEVICE MANAGEMENT
    # ========================================================

    print("\n[2] Creating Device Management service...")

    device = camera.create_devicemgmt_service()

    print("[OK] Device Management service created")


    # ========================================================
    # DEVICE INFORMATION
    # ========================================================

    print("\n[3] Getting device information...")

    info = device.GetDeviceInformation()

    print("\n--- Device Information ---")

    print(
        "Manufacturer:",
        info.Manufacturer
    )

    print(
        "Model:",
        info.Model
    )

    print(
        "Firmware:",
        info.FirmwareVersion
    )

    print(
        "Serial:",
        info.SerialNumber
    )


    # ========================================================
    # CAPABILITIES
    # ========================================================

    print("\n[4] Getting capabilities...")

    capabilities = device.GetCapabilities()

    print("[OK] Capabilities received")

    print("\n--- Capabilities ---")

    if capabilities is not None:

        print(
            capabilities
        )


    # ========================================================
    # MEDIA SERVICE
    # ========================================================

    print("\n[5] Creating Media service...")

    media = camera.create_media_service()

    print("[OK] Media service created")


    # ========================================================
    # PROFILES
    # ========================================================

    print("\n[6] Getting Media Profiles...")

    profiles = media.GetProfiles()

    print(
        f"\nFound {len(profiles)} media profile(s)"
    )


    # ========================================================
    # PROFILE INFORMATION
    # ========================================================

    for index, profile in enumerate(
        profiles,
        start=1
    ):

        print("\n")
        print("-" * 60)

        print(
            f"PROFILE {index}"
        )

        print(
            "Name:",
            getattr(
                profile,
                "Name",
                None
            )
        )

        print(
            "Token:",
            getattr(
                profile,
                "token",
                None
            )
        )


        # ----------------------------------------------------
        # VIDEO SOURCE
        # ----------------------------------------------------

        if profile.VideoSourceConfiguration:

            video_source = (
                profile.VideoSourceConfiguration
            )

            print(
                "Video Source Token:",
                getattr(
                    video_source,
                    "SourceToken",
                    None
                )
            )


        # ----------------------------------------------------
        # VIDEO ENCODER
        # ----------------------------------------------------

        if profile.VideoEncoderConfiguration:

            encoder = (
                profile.VideoEncoderConfiguration
            )

            print(
                "Encoding:",
                getattr(
                    encoder,
                    "Encoding",
                    None
                )
            )


            if encoder.Resolution:

                print(
                    "Resolution:",
                    encoder.Resolution.Width,
                    "x",
                    encoder.Resolution.Height
                )


            if encoder.RateControl:

                print(
                    "FPS:",
                    getattr(
                        encoder.RateControl,
                        "FrameRateLimit",
                        None
                    )
                )


            print(
                "Bitrate:",
                getattr(
                    encoder.RateControl,
                    "BitrateLimit",
                    None
                )
            )


    # ========================================================
    # SUCCESS
    # ========================================================

    print("\n")
    print("=" * 60)
    print("ONVIF TEST SUCCESSFUL")
    print("=" * 60)


except Exception as e:

    print("\n")
    print("=" * 60)
    print("ONVIF ERROR")
    print("=" * 60)

    print(
        "Error type:",
        type(e).__name__
    )

    print(
        "Error:",
        e
    )