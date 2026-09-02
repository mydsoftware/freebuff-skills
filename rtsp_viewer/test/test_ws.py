import websocket
import hashlib
import json
import re
import time


HOST = "37.202.152.217"
PORT = 8001

USERNAME = "admin"
PASSWORD = "Myd@5113115"

PATH = "/media/flv/video2"

WS_URL = f"ws://{HOST}:{PORT}{PATH}"
ORIGIN = f"http://{HOST}:{PORT}"


def md5(value):
    return hashlib.md5(
        value.encode("utf-8")
    ).hexdigest()


def parse_challenge(message):

    m = re.search(
        r'realm=([^,\s]+).*?'
        r'nonce=([^,\s]+).*?'
        r'qop=([^,\s]+)',
        message
    )

    if not m:
        raise RuntimeError(
            "Digest challenge پیدا نشد"
        )

    return (
        m.group(1),
        m.group(2),
        m.group(3)
    )


def make_authorization(
    realm,
    nonce,
    nc,
    cnonce
):

    # دقیقاً همان URI که Chrome فرستاده
    uri = WS_URL

    # HA1
    ha1 = md5(
        f"{USERNAME}:{realm}:{PASSWORD}"
    )

    # HA2
    ha2 = md5(
        f"GET:{uri}"
    )

    # RFC 2617 qop=auth
    response = md5(
        f"{ha1}:{nonce}:{nc}:{cnonce}:auth:{ha2}"
    )

    return (
        "Digest "
        f'username="{USERNAME}", '
        f'realm="{realm}", '
        f'nonce="{nonce}", '
        f'algorithm="MD5", '
        f'uri="{uri}", '
        f'response="{response}", '
        f'qop="auth", '
        f'nc="{nc}", '
        f'cnonce="{cnonce}"'
    )


def main():

    print("=" * 70)
    print("UNIVIEW WEBSOCKET DIGEST TEST")
    print("=" * 70)

    # ----------------------------------------------------
    # STEP 1
    # ----------------------------------------------------

    print("\n[1] Connecting...")

    ws = websocket.create_connection(
        WS_URL,
        origin=ORIGIN,
        timeout=10
    )

    print("[+] Connected")

    challenge = ws.recv()

    print("\nSERVER:")
    print(challenge)

    if isinstance(challenge, bytes):

        print(
            "\n!!! Server sent binary data immediately"
        )

        return

    data = json.loads(challenge)

    if data.get("errorCode") != 401:

        print(
            "\nUnexpected server response:"
        )

        print(data)

        ws.close()

        return

    realm, nonce, qop = parse_challenge(
        data["detail"]
    )

    print("\nDigest:")
    print("REALM :", realm)
    print("NONCE :", nonce)
    print("QOP   :", qop)

    ws.close()

    # ----------------------------------------------------
    # STEP 2
    # ----------------------------------------------------
    #
    # Chrome request نمونه‌ای که شما فرستادی:
    #
    # nc     = 00000031
    # cnonce = d41d8cd98f00b204e9800998ecf8427e
    #
    # فعلاً دقیقاً همین ساختار را تست می‌کنیم.
    # ----------------------------------------------------

    nc = "00000031"

    cnonce = (
        "d41d8cd98f00b204e9800998ecf8427e"
    )

    authorization = make_authorization(
        realm,
        nonce,
        nc,
        cnonce
    )

    print("\nAUTHORIZATION:")
    print(authorization)

    # ----------------------------------------------------
    # STEP 3
    # ----------------------------------------------------

    print("\n[2] Authenticated connection...")

    ws = websocket.create_connection(
        WS_URL,
        origin=ORIGIN,
        timeout=10,
        header=[
            "Pragma: no-cache",
            "Cache-Control: no-cache",
            "User-Agent: Mozilla/5.0",
            f"Authorization: {authorization}"
        ]
    )

    print("[+] WebSocket handshake OK")

    # ----------------------------------------------------
    # STEP 4
    # ----------------------------------------------------

    print("\n[3] Waiting for stream...\n")

    total = 0

    try:

        while True:

            packet = ws.recv()

            if packet is None:

                print("Connection closed")

                break

            if isinstance(packet, str):

                print("TEXT:")
                print(packet)

                # اگر دوباره 401 بود
                if '"errorCode":401' in packet:

                    print(
                        "\n!!! DIGEST AUTH FAILED"
                    )

                    break

                continue

            size = len(packet)

            total += size

            print(
                f"BINARY: "
                f"{size:,} bytes | "
                f"TOTAL: {total:,} bytes"
            )

            # بررسی FLV header
            if total == size:

                print(
                    "HEADER:",
                    packet[:16].hex(" ")
                )

                if packet[:3] == b"FLV":

                    print(
                        "\n*** FLV STREAM DETECTED ***"
                    )

            if total >= 1024 * 1024:

                print(
                    "\n*** MORE THAN 1 MB RECEIVED ***"
                )

                break

    except Exception as e:

        print("\nERROR:")
        print(e)

    finally:

        ws.close()


if __name__ == "__main__":
    main()