# GCP Inventory Compliance Checker

This project processes raw GCP inventory data, transforms it into a proper JSON format, converts it to a compliance schema, and displays it via a Streamlit web application.

## Setup Instructions

1. **Create and activate a virtual environment**

   ```bash
   python3 -m venv venv
   source ./venv/bin/activate
Install required dependencies

bash
Copy code
pip install -r requirements.txt
Data Preparation
Fix invalid JSON format

The raw inventory file (gcp_resources_debug.json) is not in proper JSON format. Use the following script to convert it:

bash
Copy code
python fix_inventory_json.py gcp_resources_debug.json gcp_inventory.json
Convert to compliance schema format

The compliance checker requires a specific schema. Convert the cleaned JSON into the required format:

bash
Copy code
python fix_to_compliance_json.py gcp_inventory.json inventory.json
Running the Application
Launch the Streamlit app using:

bash
Copy code
streamlit run app.py
Notes
Two sample compliance rules are currently implemented. These are working examples.

Additional rules need to be written to extend the compliance logic.
