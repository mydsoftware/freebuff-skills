import requests


BASE_URL = "https://khodnevis.mrud.ir/auth/amlak/gnaf/get_property_info"


postal_code = input("کد پستی را وارد کنید: ").strip()

url = f"{BASE_URL}/{postal_code}/"

print("\nدر حال ارسال درخواست...")
print(f"URL: {url}\n")

try:
    response = requests.get(url, timeout=30)

    print(f"Status Code: {response.status_code}")
    print("-" * 60)

    # بررسی موفق بودن درخواست HTTP
    if response.status_code == 200:

        # تبدیل پاسخ JSON به دیکشنری Python
        data = response.json()

        # بررسی نتیجه استعلام
        if data.get("ErrorCode") == 0:

            print("نتیجه استعلام")
            print("=" * 60)

            print(f"کد پستی       : {data.get('PostCode', '')}")
            print(f"استان          : {data.get('Province', '')}")
            print(f"شهرستان        : {data.get('TownShip', '')}")
            print(f"بخش            : {data.get('Zone', '')}")
            print(f"نوع محل        : {data.get('LocalityType', '')}")
            print(f"نام محل        : {data.get('LocalityName', '')}")
            print(f"کد محل         : {data.get('LocalityCode', '')}")
            print(f"محله           : {data.get('SubLocality', '')}")
            print(f"خیابان         : {data.get('Street', '')}")
            print(f"خیابان دوم      : {data.get('Street2', '')}")
            print(f"شماره ساختمان  : {data.get('HouseNumber', '')}")
            print(f"طبقه            : {data.get('Floor', '')}")
            print(f"طبقه جانبی      : {data.get('SideFloor', '')}")
            print(f"نام ساختمان     : {data.get('BuildingName', '')}")
            print(f"توضیحات         : {data.get('Description', '')}")

            print("=" * 60)

        else:
            print("استعلام ناموفق بود.")
            print(f"ErrorCode: {data.get('ErrorCode')}")
            print(f"TraceID: {data.get('TraceID')}")

    else:
        print("خطا در پاسخ API")
        print(response.text)

except requests.exceptions.RequestException as error:
    print("خطا در ارتباط با API:")
    print(error)

except ValueError:
    print("پاسخ API فرمت JSON معتبر ندارد.")
    print(response.text)