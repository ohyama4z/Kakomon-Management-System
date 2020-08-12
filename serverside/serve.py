from flask import Flask
from flask_cors import CORS
import json
app = Flask(__name__)

CORS(app)

@app.route('/csv', methods=['GET'])
# @content_type('application/json')
def hello():
    # name = "Hello World"
    # return name
    
    return json.dumps({"languages": "python"})

@app.route('/metadata', methods=['GET'])
def getbranch():
    branches = ['hoge', 'fuga']
    return json.dumps({
        "branches": branches
    })

if __name__ == "__main__":
    app.run()
    # app.run(host='http:')