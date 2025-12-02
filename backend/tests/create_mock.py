import pandas as pd

# 创建表头行（包含年份信息）
header_row = pd.DataFrame([["2023年采购数据", "", "", "", ""]], 
                          columns=["PNs", "Qty", "Supp", "Annual Spend", "Unknown"])

# 创建数据行
data = {
    "PNs": ["A123", "B456", "C789", "D101", "E202"],
    "Qty": [100, 200, 300, 400, 500],
    "Supp": ["Supplier A", "Supplier B", "Supplier C", "Supplier D", "Supplier E"],
    "Annual Spend": [1000, 2000, 3000, 4000, 5000],
    "Unknown": ["X", "Y", "Z", "M", "N"]
}

df_data = pd.DataFrame(data)
# 合并表头和数据（但不使用header_row，因为 Pandas 会把它当成数据）
# 直接在数据行上方插入标题信息
with pd.ExcelWriter("tests/mock_data.xlsx", engine='openpyxl') as writer:
    # 先写入标题行
    pd.DataFrame([["2023年采购数据", "", "", "", ""]]).to_excel(
        writer, sheet_name='Sheet1', index=False, header=False, startrow=0
    )
    # 再写入数据（从第2行开始）
    df_data.to_excel(writer, sheet_name='Sheet1', index=False, startrow=1)
print("Mock Excel created.")
