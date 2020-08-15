from flask import Flask
import json
app = Flask(__name__)

@app.route('/csv')
def hello():
    # name = "Hello World"
    # return name
    return json.dumps({"languages": "python"})

@app.route('/csv')
if __name__ == "__main__":
    app.run()
