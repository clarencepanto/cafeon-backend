import mysql.connector
import json
# to work with dates like "7 days ago"
from datetime import datetime, timedelta

# Connect to MySQL
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="rootroot123",
    database="cafeon"
)
cursor = db.cursor()


# Get the date 7 days ago in this format: '2025-06-08'
# Calculate 7 days ago from today
seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')

# Get daily revenue from the past 7 days
query = f"""
SELECT DATE(created_at) as date, SUM(total) as daily_total
FROM sales
WHERE created_at >= '{seven_days_ago}'
GROUP BY DATE(created_at)
ORDER BY DATE(created_at);
"""

cursor.execute(query)
results = cursor.fetchall()


# Format the result
daily_sales = []
week_total = 0

for row in results:
    # convert each row to a dictionary
    # tracks total revenue for the week
    date, total = row
    week_total += float(total)
    daily_sales.append({
        "date": str(date),
        "total": float(total)
    })

# Final result
revenue_summary = {
    "week_total": round(week_total, 2),
    "daily_sales": daily_sales
}

# Save to JSON
with open("ai-engine/weekly_revenue.json", "w") as file:
    json.dump(revenue_summary, file, indent=2)

print("✅ Weekly revenue analysis complete!")




