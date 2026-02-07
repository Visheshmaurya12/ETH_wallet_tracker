from flask import Flask, render_template, request
import os
import requests

app = Flask(__name__)

API_KEY = os.environ.get("ETHERSCAN_API_KEY") 

def get_balance(address):
   url =  f"https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address={address}&apikey={API_KEY}"
   data = requests.get(url).json()
   return int(data["result"]) / 10**18



def get_transactions(address):
   url = f"https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address={address}&sort=desc&apikey={API_KEY}"
   data = requests.get(url).json()
   return data["result"][:5]


@app.route("/", methods=["GET", "POST"])
def index():
   balance = None
   transactions = []
   error = None

   if request.method =="POST":
      wallet = request.form["wallet"]


      try:
         balance = get_balance(wallet)
         transactions = get_transactions(wallet)

         for tx in transactions:
             tx["eth_value"] = int(tx["value"]) / 10**18


      except Exception as e:
         print("ERROR:", e)
         error = "Invalid wallet or API error"

   return render_template(
      "index.html",
      balance=balance,
      transactions=transactions,
      error=error

   )


if __name__ == "__main__":
   app.run()
    









