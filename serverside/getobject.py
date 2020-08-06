import settings
from github import Github
import base64
from getpass import getpass
# それぞれの環境変数が呼び出されているか確認
# print(settings.client_id, settings.PersonalToken, settings.repo, settings.client_secret)

g = Github(settings.PersonalToken)
# 具体的なパスはget_dir_contentsで指定する ここではしない

# class github.Repository.Repository
repo = g.get_repo(settings.repo) # == (class) github.Repository.Repository  https://pygithub.readthedocs.io/en/latest/github.html#github.MainClass.Github.get_repo

branches = list(repo.get_branches()) # (Branch=''の形)

choosebranch = str(input())
dir_contents = repo.get_dir_contents("/metadatas", choosebranch)

sha = []
blob = []
filenames = []

# def SaveCSVfile():
# 引数 csvfileは'unassorted'か'assorted'と指定
# ファイルname, ハッシュ取得
for i in range(len(dir_contents)):
    # # print(dir_contents[i].name[:-4])
    # # if dir_contents[i].name == "unassorted.csv":
    # if csvfile == 'assorted':
    #     if 'unassorted' not in dir_contents[i].name:
    #         sha.append(dir_contents[i].sha)
    #         filenames.append(dir_contents[i].name) # ファイル名
    # elif csvfile in dir_contents[i].name:
    # # if dir_contents[i].name[-4:] == ".png":
    # # if dir_contents[i].name[-4:] == file_extension:
        sha.append(dir_contents[i].sha)
        # filenames.append(dir_contents[i].name[:-4]) # 拡張子を除いたファイル名
        filenames.append(dir_contents[i].name) # ファイル名

print(len(sha))
# ファイル保存
for i in range(len(sha)):
    print(i)
    blob.append(repo.get_git_blob(sha[i]))
    contents = base64.b64decode(blob[i].content)

    # with open("copy" + filenames[i], mode="wb") as f:
    with open(filenames[i], mode="wb") as f:
        f.write(contents)

# SaveCSVfile('assorted')
# SaveCSVfile()

# branch取得
allbranches = []
def ReturnAllBranches():
    for i in range(len(branches)):
        allbranches.append(branches[i].name)
    return allbranches

# print(ReturnAllBranches())
# print(allbranches)

# downloadurl
def GetPictureInfo ():
    png_dir_contents = repo.get_dir_contents("/scanned", choosebranch)
    gazoukakutyoushi = ['.jpg', '.jpeg', '.png']
    PicturepathAndRawURL = {}
    for i in range(len(png_dir_contents)):
        if png_dir_contents[i].name[-4:] in gazoukakutyoushi:
            path = png_dir_contents[i].path
            download_url = png_dir_contents[i].download_url
            PicturepathAndRawURL.setdefault(path, download_url)
    return PicturepathAndRawURL

# print(GetPictureInfo())
# print(ReturnAllBranches()[0])
# 必要な情報
# csvfileとcsvheader:対応する各行の値とdownload:画像urlとbranch一覧
# csvをdownload
# srcを見に行ってscanned/xxx.jpg 以降のjpgを
# csvファイルの1行毎に対してraw.github.comのアドレスを持たせる

# https://api.github.com/repos/[ユーザ名]/[repo名]/git/refs/[headsまたはヘッド名?]/[branch名]
# heads/masterとは指定できない


# 固定するもの
# リポジトリ
# ファイルパス

# 動的なもの
# ブランチ一覧
# /scannedの.pngの画像url
# /metadatasのcsv

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


# todo
# unassorted.csvの処理をどうするか unassorted_ が含まれた場合だけでいいのか ブランチを選んでもらった後ファイルも選んでもらうのか
# 関数名 getかreturnかfetchか 主語をどこに置くか(ユーザ側かサーバ側か) サーバ側だからreturn〇〇等でいい?
# githubactionでコミットを検知したらpythonの何らかの関数の引数に最新のコミット情報(branch ファイル変更)を渡して実行(csvファイルの差分をダウンロードしてサーバ側のファイルを更新する関数)する

# コーナーケース todo
# csvファイル等がない時(branch切って空のbranch pushだけしてほったらかしとか)
# なんらかの動作でファイルパスが同一になってしまった場合