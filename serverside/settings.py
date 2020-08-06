import os
from os.path import join, dirname
from dotenv import load_dotenv

load_dotenv(verbose=True)

dotenv_path = join(dirname(__file__), 'env')
load_dotenv(dotenv_path)

PersonalToken = os.environ.get("GITGATEWAY_GITHUB_ACCESS_TOKEN")
repo = os.environ.get("GITHUB_REPO")
client_id = os.environ.get("CLIENT_ID")
client_secret = os.environ.get("CLIENT_SECRET")
