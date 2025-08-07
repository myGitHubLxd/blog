# 元音字母消除算法 (Swift实现)

## 题目描述
英语字母表的元音字母包括 `(a, e, i, o, u, A, E, I, O, U)`。编写一个算法来消除给定字符串中的所有元音字母。

## 算法实现

本项目提供了三种不同的Swift实现方法：

### 方法一：字符集合过滤（推荐）
- **优点**：代码简洁，性能优秀，易于理解
- **原理**：使用Set数据结构存储元音字母，利用Swift的`filter`方法过滤字符串
- **时间复杂度**：O(n)，其中n为字符串长度
- **空间复杂度**：O(1)

### 方法二：正则表达式替换
- **优点**：功能强大，适合复杂模式匹配
- **原理**：使用NSRegularExpression匹配所有元音字母并替换为空字符串
- **时间复杂度**：O(n)
- **空间复杂度**：O(1)

### 方法三：循环遍历（传统方法）
- **优点**：逻辑清晰，适合初学者理解
- **原理**：遍历字符串每个字符，检查是否为元音字母
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 运行方式

### 前提条件
需要安装Swift编程语言环境。

#### 在macOS上安装Swift：
```bash
# 通过Xcode安装（推荐）
# 或者通过Swift官网下载：https://swift.org/download/
```

#### 在Linux上安装Swift：
```bash
# Ubuntu/Debian
wget https://download.swift.org/swift-5.9.1-release/ubuntu2204/swift-5.9.1-RELEASE-ubuntu22.04.tar.gz
tar xzf swift-5.9.1-RELEASE-ubuntu22.04.tar.gz
sudo mv swift-5.9.1-RELEASE-ubuntu22.04 /opt/swift
echo 'export PATH="/opt/swift/usr/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 运行代码
```bash
# 直接运行Swift脚本
swift VowelEliminator.swift

# 或者编译后运行
swiftc VowelEliminator.swift -o vowel_eliminator
./vowel_eliminator
```

## 测试用例

程序包含以下测试用例：
1. `"Hello World"` → `"Hll Wrld"`
2. `"Programming"` → `"Prgrmmng"`
3. `"Swift Language"` → `"Swft Lngg"`
4. `"aEiOu"` → `""`
5. `"BCDFG"` → `"BCDFG"`
6. `"The quick brown fox jumps over the lazy dog"` → `"Th qck brwn fx jmps vr th lzy dg"`
7. `"123456"` → `"123456"`
8. `"Hello, 你好！"` → `"Hll, 你好！"`

## 性能测试

程序还包含性能测试功能，可以比较三种方法的执行效率。测试结果显示：
- **字符集合过滤方法**：性能最佳
- **正则表达式方法**：性能中等
- **循环遍历方法**：性能相对较低

## 代码特点

- ✅ 完整的中文注释
- ✅ 三种不同实现方法
- ✅ 详细的测试用例
- ✅ 性能对比测试
- ✅ 错误处理机制
- ✅ 工具方法（元音检测、计数）

## 算法核心逻辑

```swift
// 核心算法（方法一）
static func eliminateVowelsUsingSet(_ input: String) -> String {
    let vowels: Set<Character> = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"]
    return String(input.filter { !vowels.contains($0) })
}
```

这个实现简洁高效，充分利用了Swift语言的函数式编程特性。
