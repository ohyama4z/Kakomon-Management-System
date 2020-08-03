# ローカルでのホストの手順
## 1. GitHubでの設定
### personal access tokenの作成
GitHub > Settings > Developer Settings > Personal access tokens > Generate new token\

※personal access tokenは再度同一のtokenを取得することができないので,
regeneareteしてenvファイルに書き直す作業が億劫であればパスマネなどに保存しておくと良い
### client_id, client_secretの作成
GitHub > Settings > Developer Settings > OAuth Apps > New Oauth App\
hostしたいrepoのサーバーのアドレスを`HomePageURL`, `Authorization callback URL`に記入
## 2. .envファイルの編集
~~~
GITGATEWAY_GITHUB_ACCESS_TOKEN=[personalaccesstoken]
GITGATEWAY_GITHUB_REPO=[githubのユーザ名/hostしたいrepo名]
CLIENT_ID=[clientid]
CLIENT_SECRET=[clientsecret]
~~~
※""や[]は付けずに記述

# let's hosting
1. 予め各自のCMS環境を手元にcloneしておき, npmなどでサーバーを建てる
2. `$ docker-compose up`
3. (初回だけ)別にシェルを開き\
`$ docker-compose exec gotrue sh`\
`# gotrue migrate`\
gotrueコンテナを抜けて\
`$ docker-compose exec db bash`\
`# mysql -u gotrue -p`\
`Enter password: `
passwordと入力\
`mysql> USE gotrue;`
4. 上で起動させたCMS環境の"サーバーのアドレス/admin"にwebでアクセス
5. cmsのログイン画面が出てくるので(数秒待機して)Login with Netlify Identityを選択
6. `URL of your Netlify Site`の欄にhttp://localhost:8085をsetする