import csv
# f = open('unassorted.csv', 'rb')
# dataReader = csv.reader(f)

# print(dataReader)
# for row in dataReader:
    # print(row)

# csvの読み込み
first_line = []
gyou = []
with open('test.csv', encoding='utf-8-sig') as f:
    # next(f) 最初の行を読み飛ばす場合
    strheader = next(f) # これでいいじゃん
    # first_line = f.readline() #これだと分割されていないただの文字列になる splitとかでカンマ区切り後からしてもいいけど賢いやり方ではない気がする
    strheader = strheader.rstrip('\n') # https://qiita.com/ringCurrent/items/aa0044a0cfee91762c80
    header = strheader.split(',')
    # header[-1].replace('\n', '')
    for row in csv.reader(f):
        # print(row)
        # print(row[4])

# 数字にしたい時
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
        # if row == 0:
        #     x[] = row
        # print(f"{row[0][0]}")

print(header)

# first_line = gyou[0]
# del gyou[0]
# print(first_line)
# print(gyou[0])


# 配列に入れていく
# print(type(first_line[0]))

d = {"x" : 3}
z = {"x" : 4}
print(d, z)

keys = header
# val = gyou[0]
val = gyou
d = dict(zip(keys, val))
print(d)

# print(len(gyou))
numberoflines = len(gyou)
numberofcolumns = len(gyou[0])

dictarray = [[]]

# for i in range(5):
for i in range(numberoflines):
    # dictarray.append(dict(zip(keys, val[i][i])))
    # print(val[i][i])
    # print(i)
    for j in range(numberofcolumns):
        print("i", i)
        print(val[i][j])
        print("j" , j)
        print(keys[j])
        # dictarray.append(dict(zip(keys[j], val[i][j])))
        dictarray.append({keys[j] : val[i][j]})
        # vals = val[i][j]
        # print(val[0][0])
    # print("\n")
    # print(dictarray)
# for i in range(numberofcolumns):
#     # dictarray.append(dict(zip(keys, val[i][i])))
#     # print(val[i][i])
#     # print(i)
#     for j in range(numberoflines):
#         # print(val[i][j])
#         # print("j" , j)
#         # print(keys[j])
#         dictarray.append(dict(zip(keys[i], val[i][j])))
#         # print(val[0][0])

print(dictarray)

# print(vals)
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

# listt = []
# listt.append("hoge")
# listt.append("")
# listt.append("fuga")
# print(listt)