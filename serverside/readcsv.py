import csv
# csvの読み込み
gyou = []
def fillindict(filename):
    with open(filename, encoding='utf-8-sig') as f:
        # strheader = next(f) # これでいいじゃん
        # strheader = strheader.rstrip('\n') # https://qiita.com/ringCurrent/items/aa0044a0cfee91762c80
        # header = strheader.split(',')
        header = next(f).rstrip('\n').split(',')
        for row in csv.reader(f):
    # 数値をint型にしたい場合
            # if row[4] != '':
            #     if row[4] == '不明':
            #         row[4] = -1
            #     else:
            #         row[4] = int(row[4])
            # if row[7] != '':
            #     row[7] = int(row[7])
            # if row[8] != '':
            #     row[8] = int(row[8])
            gyou.append(row)
    keys = header
    val = gyou
    numberoflines = len(gyou)
    numberofcolumns = len(gyou[0])
    dictarray = {}
    dictarrays = {}
    for i in range(numberoflines):
        # dictarray.append(dict(zip(keys, val[i][i])))
        for j in range(numberofcolumns):
            # print("i", i)
            # print(val[i][j])
            # print("j" , j)
            # print(keys[j])
            # dictarray.append(dict(zip(keys[j], val[i][j])))
            # dictarray.append({keys[j] : val[i][j]})
            dictarray.setdefault(keys[j], val[i][j])
            # vals = val[i][j]
            # print(val[0][0])
        dictarrays.setdefault(val[i][0], dictarray)

# def (self, src, subj, tool_type, period, year, content_type, author, image_index, included_pages_num, fix_text):
#     src = ''
#     subj = ''
#     tool_type = ''
#     period = ''
#     year = 0
#     content_type = ''
#     author = ''
#     image_index = 0
#     included_pages_num = 0
#     fix_text = ''
