import settings
from github import Github
import base64
# それぞれの環境変数が呼び出されているか確認
# print(settings.client_id, settings.PersonalToken, settings.repo, settings.client_secret)

# g = Github(settings.PersonalToken)
g = Github("asann3", settings.password)

print("xxx")
# 具体的なパスはget_dir_contentsで指定する ここではしない
# fullrepo = settings.repo + "/tree/master/static/img"

# print(settings.repo)
# print(fullrepo)

# print(type(fullrepo), type(settings.repo))
sha = []

# class github.Repository.Repository
repo = g.get_repo(settings.repo) # == (class) github.Repository.Repository  https://pygithub.readthedocs.io/en/latest/github.html#github.MainClass.Github.get_repo

# branches = repo.get_branches()
branches = list(repo.get_branches())
print(branches)
print(branches[0].name)
kireinabranches = []
for i in range(len(branches)):
    kireinabranches.append(branches[i].name)
    print(kireinabranches[i])
print(kireinabranches)
# print(branchclass.name)

# print("branchを選択してください")
# while (str(input()) not in ) # 正しいbranchが選択されるまで入力させる(本番はボタン選択だから関係ない)


# get_dir_contentsの第2引数はref=になっていてbranchを指定できる
dir_contents = repo.get_dir_contents("/metadatas", "ともないさん")
# print(dir_contents)

# blob = []
filenames = []

# print("拡張子を入力してください(.png や .csvの形式で)")
# file_extension = str(input())


# ファイル取得
for i in range(len(dir_contents)):
    print(dir_contents[i].name[:-4])
    # if dir_contents[i].name == "unassorted.csv":
    if "unassorted" in dir_contents[i].name:
    # if dir_contents[i].name[-4:] == ".png":
    # if dir_contents[i].name[-4:] == file_extension:
        sha.append(dir_contents[i].sha)
        # filenames.append(dir_contents[i].name[:-4]) # 拡張子を除いたファイル名
        filenames.append(dir_contents[i].name) # ファイル名
# print(sha)

# contents = []
# print("xxxxxx")
# blob = repo.get_git_blob(sha[0])

objects = []
def dictionary():
    di = {}

# # blob append
# for i in range(len(sha)):
#     blob.append(repo.get_git_blob(sha[i]))
#     contents = base64.b64decode(blob[i].content)

#     # with open("copy" + filenames[i], mode="wb") as f:
#     with open(filenames[i], mode="wb") as f:
#         f.write(contents)



# print("hoge")
# print(contents)

# # downloadurl
# for i in range(len(dir_contents)):
#     print(dir_contents[i].download_url)

# x = "hoge.csv"
# print(x[-4:])

# print(blob[0])



# # branch取得
# branches = list(g.get_repo(settings.repo).get_branches())
# # numberofbranch = len(branches)
# print(branches)
# for branchname in branches:
#     print(branchname)
#     # print(branches[branchname].get_branch)
# # print(g.get_repo(settings.repo).get_branches())




# 必要な情報

# csvと画像urlとbranch

# csvをdownload
# srcを見に行ってscanned/xxx.jpg 以降のjpgを
# csvファイルの1行毎に対してrow.github.comのアドレスを持たせる


# branchを決める
# /scannedの.pngの画像url
# /metadatasのcsv


# https://api.github.com/repos/[ユーザ名]/[repo名]/git/refs/[headsまたはヘッド名?]/[branch名]
# heads/masterとは指定できない


# 固定するもの
# リポジトリ
# ファイルパス

# 動的なもの
# ブランチ

# flow
# branch一覧を取得
# ページがロードされる度フロントに流す

# ユーザがbranchを選択する
# フロントはサーバにそのbranchの情報を揺する
# サーバは身代金を用意する "unassorted" in ファイル名 and ブランチ名 in ファイル名?
# (csvファイルそのもの, csv1行ずつとそれに対応する画像url)(指定されたbranchの/metadatasのunassroted_日付_謎文字列_branch名.csvを見にいき
# 1行ずつ配列に代入して scanned/ファイル名.jpg部分に対応する画像をscanned/で見てdownloadurlを配列に入れていく)
# ファイル名が対応した配列の要素同士をオブジェクトに詰め込んでいく
# 金品とともにオブジェクト(csvとpngのdownloadurl)をフロントへ渡す


# コーナーケース todo
# csvファイル等がない時(branch切って空のbranch pushだけしてほったらかしとか)
