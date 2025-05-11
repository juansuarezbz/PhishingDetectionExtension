# **Phishing Detector** - Anti-Phishing Chrome Extension 

A simple browser extension designed to detect phishing websites. Initially intended to leverage a **TensorFlow machine learning model**, the project evolved to use **rule-based URL analysis** for real-time detection when model integration proved challenging.  

![image](https://github.com/user-attachments/assets/63052d46-b19b-4297-ab6e-db1703f503d6)
![image](https://github.com/user-attachments/assets/b915f334-8cc3-4a69-85bb-ef6f614ef198)


---

## **🔍 Features & Detection Logic**  
### **1. URL Analysis**  
The extension checks for the following **suspicious traits**:  
✅ **HTTPS Usage** – Ensures the connection is encrypted.  
✅ **Domain Legitimacy** – Flags typosquatting (e.g., `go0gle.com`).  
✅ **Subdomain Count** – Excessive subdomains may indicate phishing.  
✅ **Special Characters** – Detects `@`, `-`, or unusual symbols.  
✅ **TLD Trustworthiness** – Validates if the domain extension is trusted.  
✅ **URL Shorteners** – Unmasks shortened links (e.g., Bit.ly).    

### **2. Example Detection Output**  
#### **🔒 Safe URL Example**  

URL: https://www.csudh.edu/  
✅ HTTPS Enabled  
✅ Proper Domain Name  
✅ Reasonable Subdomains  
✅ No Suspicious Characters  
✅ Trusted TLD (.edu)  
✅ Not a Shortened URL  
📊 **Summary:** 0/9 suspicious features detected.

**Citation of open source code used**

Chioma Okoronkwo. (October 2023). Phishing Prediction using TensorFlow and RF, Version 2. https://www.kaggle.com/code/chiomaokoronkwo/phishing-prediction-using-tensorflow-and-rf/notebook 

