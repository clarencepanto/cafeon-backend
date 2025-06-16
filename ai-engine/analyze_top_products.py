# Import libraries

# let python talk to mysql db
import mysql.connector

# lets user save stuff in json format
import json


# Connect to the MySQL database
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="rootroot123",
    database="cafeon"
)


# Create a cursor so we can run SQL queries
# a tool to write and send sql commands from python
cursor = db.cursor()


# 3. Run query to find top-selling products

# “Find the 5 most sold products.
# Add up how many times each one was sold.
# Show me their names and total sold.”


query = """
SELECT p.name, SUM(si.quantity) as total_sold
FROM sale_items si
JOIN products p ON si.product_id = p.id
GROUP BY si.product_id
ORDER BY total_sold DESC
LIMIT 5;
"""

# runs sql command
cursor.execute(query)

# grabs all the result into python
results = cursor.fetchall()

# 4. Convert to list of dictionaries
top_products = []
# loops each row
for row in results:
    # split each row into name, total_sold
    name, total_sold = row
    # adds list as a dictionary 
    top_products.append({
        "name": name,
        "total_sold": int(total_sold)
    })


# 5. Save as JSON
# open file called top_products.json in write mode
#json.dump() writes our list of dictioinaries into the file
# indent=2 makes it pretty and readable
with open("ai-engine/top_products.json", "w") as file:
    json.dump(top_products, file, indent=2)

print("✅ Top-selling products analysis complete!")
