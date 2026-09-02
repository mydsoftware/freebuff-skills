from pathlib import Path
import binascii

HEX_DATA = """
080001411d88e8260000008e9c2118151a0e9787909dcf979c95903a1e1d0fe8b2e6b5202245d15ba59ca820134bad0c209c928abeb0abc42843101714169ea525185474cd91c12d578b95337ba4acd599110f252c9b8fa63d1112dcabccb1fc120eab878ddb2a1dd096272029b31d22a04ebc381820c85d1aa78c9e9c8d916c15c332b2bb230f0c0e925aa19eaa41ab301e343ebe4034a88d6319ac95151f36f64b4e749a2c0e36a7bab5b6968b35063a914922bf34279595c32bbb383899a6cc150e3b1b1ab34dd51eb8a696b13d1ea1951c1da25bda2c231e30b2af949f1ccc11918bbfd28f9ce134141a3fb7ae2f181e274bc1938ccf1c31522bb934080cc09d4e24be5da09749b048c01298a6cd9e8f9c4e252895321aa8a3e91a1e1d2fa7c1998f367f090b8d878ea622322e9d1e0a0f9554121be89e948f8eaea6a12bcb2a91120a0f31b4995b1b970000014c
"""

data = bytes.fromhex(HEX_DATA)

print("SIZE:", len(data))
print()

print("FIRST 64 BYTES:")
print(data[:64].hex(" "))

print()
print("LAST 64 BYTES:")
print(data[-64:].hex(" "))

print()
print("ASCII:")
print(
    "".join(
        chr(x) if 32 <= x <= 126 else "."
        for x in data
    )
)

print()
print("COMMON SIGNATURES:")

signatures = {
    b"FLV": "FLV",
    b"\x00\x00\x00\x01\x67": "H264 Annex-B SPS",
    b"\x00\x00\x01\x67": "H264 Annex-B SPS",
    b"\x00\x00\x00\x01\x65": "H264 IDR",
    b"\x00\x00\x01\x65": "H264 IDR",
    b"\x00\x00\x00\x01\x68": "H264 PPS",
    b"\x00\x00\x01\x68": "H264 PPS",
    b"\x1f\x8b": "GZIP",
    b"\x78\x9c": "ZLIB",
    b"ftyp": "MP4/fMP4",
    b"\x1a\x45\xdf\xa3": "WEBM/EBML",
}

for sig, name in signatures.items():

    pos = data.find(sig)

    if pos >= 0:
        print(
            f"{name}: FOUND at byte {pos}"
        )
    else:
        print(
            f"{name}: not found"
        )

Path("packet.bin").write_bytes(data)

print()
print("Saved: packet.bin")