import pandas as pd

# 创建测试数据
data = {
    "PNs": ["A123", "B456", "C789"],
    "Qty": [100, 200, 300],  # 应该映射到 Quantity
    "Supp": ["Supplier A", "Supplier B", "Supplier C"], # 应该映射到 Supplier
    "Annual Spend": [1000, 2000, 3000], # 应该映射到 APV
    "Unknown": ["X", "Y", "Z"] # 不应映射
}

df = pd.DataFrame(data)
df.to_excel("tests/mock_data.xlsx", index=False)
print("Mock Excel created.")
