import Foundation

/**
 * 消除元音字母算法
 * 题目：英语字母表的元音字母包括 (a, e, i, o, u, A, E, I, O, U)
 * 编写一个算法来消除给定字符串中的所有元音字母
 */

class VowelEliminator {
    
    // MARK: - 方法一：使用字符集合过滤（推荐）
    
    /**
     * 使用字符集合过滤方式消除元音字母
     * - Parameter input: 输入的原始字符串
     * - Returns: 消除元音字母后的字符串
     */
    static func eliminateVowelsUsingSet(_ input: String) -> String {
        // 定义包含所有元音字母的字符集合（包括大小写）
        let vowels: Set<Character> = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"]
        
        // 使用filter方法过滤掉元音字母
        // 只保留不在元音集合中的字符
        let result = String(input.filter { !vowels.contains($0) })
        
        return result
    }
    
    // MARK: - 方法二：使用正则表达式替换
    
    /**
     * 使用正则表达式替换方式消除元音字母
     * - Parameter input: 输入的原始字符串
     * - Returns: 消除元音字母后的字符串
     */
    static func eliminateVowelsUsingRegex(_ input: String) -> String {
        do {
            // 创建正则表达式模式，匹配所有元音字母（大小写不敏感）
            let regex = try NSRegularExpression(pattern: "[aeiouAEIOU]", options: [])
            
            // 使用空字符串替换所有匹配的元音字母
            let range = NSRange(location: 0, length: input.utf16.count)
            let result = regex.stringByReplacingMatches(in: input, options: [], range: range, withTemplate: "")
            
            return result
        } catch {
            // 如果正则表达式创建失败，打印错误并返回原字符串
            print("正则表达式创建失败: \(error)")
            return input
        }
    }
    
    // MARK: - 方法三：使用循环遍历（传统方法）
    
    /**
     * 使用循环遍历方式消除元音字母
     * - Parameter input: 输入的原始字符串
     * - Returns: 消除元音字母后的字符串
     */
    static func eliminateVowelsUsingLoop(_ input: String) -> String {
        // 定义元音字母数组
        let vowels = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"]
        
        // 创建可变字符串用于存储结果
        var result = ""
        
        // 遍历输入字符串的每个字符
        for char in input {
            let charString = String(char)
            
            // 检查当前字符是否为元音字母
            if !vowels.contains(charString) {
                // 如果不是元音字母，则添加到结果中
                result += charString
            }
        }
        
        return result
    }
    
    // MARK: - 工具方法
    
    /**
     * 检查字符是否为元音字母
     * - Parameter char: 要检查的字符
     * - Returns: 如果是元音字母返回true，否则返回false
     */
    static func isVowel(_ char: Character) -> Bool {
        let vowels: Set<Character> = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"]
        return vowels.contains(char)
    }
    
    /**
     * 统计字符串中元音字母的数量
     * - Parameter input: 输入字符串
     * - Returns: 元音字母的数量
     */
    static func countVowels(_ input: String) -> Int {
        return input.filter { isVowel($0) }.count
    }
}

// MARK: - 测试示例

/**
 * 测试函数，演示各种算法的使用
 */
func runTests() {
    print("=== 元音字母消除算法测试 ===\n")
    
    // 测试用例数组
    let testCases = [
        "Hello World",
        "Programming",
        "Swift Language",
        "aEiOu",
        "BCDFG",
        "The quick brown fox jumps over the lazy dog",
        "123456",
        "Hello, 你好！"
    ]
    
    // 对每个测试用例运行所有三种方法
    for (index, testCase) in testCases.enumerated() {
        print("测试用例 \(index + 1): \"\(testCase)\"")
        print("原始元音字母数量: \(VowelEliminator.countVowels(testCase))")
        
        // 方法一：字符集合过滤
        let result1 = VowelEliminator.eliminateVowelsUsingSet(testCase)
        print("方法一结果: \"\(result1)\"")
        
        // 方法二：正则表达式
        let result2 = VowelEliminator.eliminateVowelsUsingRegex(testCase)
        print("方法二结果: \"\(result2)\"")
        
        // 方法三：循环遍历
        let result3 = VowelEliminator.eliminateVowelsUsingLoop(testCase)
        print("方法三结果: \"\(result3)\"")
        
        // 验证三种方法结果是否一致
        let allSame = (result1 == result2) && (result2 == result3)
        print("三种方法结果一致: \(allSame ? "✅" : "❌")")
        print("剩余元音字母数量: \(VowelEliminator.countVowels(result1))")
        
        print("" + String(repeating: "-", count: 50))
    }
}

// MARK: - 性能测试

/**
 * 性能测试函数，比较不同方法的执行时间
 */
func performanceTest() {
    print("\n=== 性能测试 ===")
    
    // 生成大量测试数据
    let largeString = String(repeating: "Hello World Programming Swift Language ", count: 10000)
    let iterations = 100
    
    // 测试方法一
    let start1 = Date()
    for _ in 0..<iterations {
        _ = VowelEliminator.eliminateVowelsUsingSet(largeString)
    }
    let time1 = Date().timeIntervalSince(start1)
    
    // 测试方法二
    let start2 = Date()
    for _ in 0..<iterations {
        _ = VowelEliminator.eliminateVowelsUsingRegex(largeString)
    }
    let time2 = Date().timeIntervalSince(start2)
    
    // 测试方法三
    let start3 = Date()
    for _ in 0..<iterations {
        _ = VowelEliminator.eliminateVowelsUsingLoop(largeString)
    }
    let time3 = Date().timeIntervalSince(start3)
    
    print("字符集合过滤方法: \(String(format: "%.4f", time1))秒")
    print("正则表达式方法: \(String(format: "%.4f", time2))秒")
    print("循环遍历方法: \(String(format: "%.4f", time3))秒")
}

// MARK: - 主程序入口

// 运行测试
runTests()

// 运行性能测试
performanceTest()

print("\n程序执行完成！")