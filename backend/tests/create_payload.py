import base64
import hashlib

# 读取测试文件
with open("tests/mock_data.xlsx", "rb") as f:
    content = f.read()
    file_hash = hashlib.sha256(content).hexdigest()
    content_b64 = base64.b64encode(content).decode()

# 模拟映射关系
mapping = [
    {"original_header": "PNs", "mapped_field": "PNs", "is_mapped": True},
    {"original_header": "Qty", "mapped_field": "Quantity", "is_mapped": True},
    {"original_header": "Supp", "mapped_field": "Supplier", "is_mapped": True},
    {"original_header": "Annual Spend", "mapped_field": "APV", "is_mapped": True},
    {"original_header": "Unknown", "mapped_field": None, "is_mapped": False}
]

# 构建请求 JSON
import json
payload = {
    "file_hash": file_hash,
    "file_name": "mock_data_2023.xlsx",
    "mapping": mapping,
    "file_content_base64": content_b64
}

with open("tests/test_confirm_payload.json", "w") as f:
    json.dump(payload, f, indent=2)

print("Test payload created.")
