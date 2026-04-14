import requests

# Deployment URL and API key
url = "https://predict-69de562c4aed50a5bfca-dproatj77a-ue.a.run.app/predict"
api_key = "ul_6511bc5f0958c9abdeab8b133ed6827792decbc8"

# Optional inference parameters (conf, iou, imgsz)
args = {"conf": 0.25, "iou": 0.7, "imgsz": 640}

with open("image.jpg", "rb") as f:
    response = requests.post(
        url,
        headers={"Authorization": f"Bearer {api_key}"},
        data=args,
        files={"file": f},
    )

print(response.json())
