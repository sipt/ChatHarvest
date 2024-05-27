from fontTools import subset
from fontTools.ttLib import TTFont

# 指定要提取的字符集
characters_to_keep = '􀅼􀅽􀅎􀆏􀣋􀪬􀂓􀄨􀅴􀋹􀉁􀡙􀆈􀆅􀎦􀎧􀈔􀁡􀆄􀈒􁃏􀈑􀂒􀋲􀱢􀰛􀈂'

# 加载原始字体
font = TTFont('scripts/SF-Pro.ttf')

# 创建一个包含特定字符集的字体子集
options = subset.Options()
options.text = characters_to_keep

# 创建一个新的字体子集
subfont = subset.Subsetter(options=options)
subfont.populate(text=characters_to_keep)
subfont.subset(font)

# 保存新的字体文件
font.save('src/renderer/assets/SF-Pro-subset.ttf')

# 释放字体对象
font.close()
