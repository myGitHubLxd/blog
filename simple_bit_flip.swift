// Swift实现的最少位翻转算法
// 问题：找到将P转换为Q所需翻转的最少位数

func minimumBitFlips(_ p: Int, _ q: Int) -> Int {
    // 异或运算得到P和Q之间不同的位
    // XOR操作：相同位返回0，不同位返回1
    let xorResult = p ^ q
    
    // 计算XOR结果中1的个数（即不同位的个数）
    return countSetBits(xorResult)
}

func countSetBits(_ n: Int) -> Int {
    var count = 0      // 计数器，记录1的个数
    var num = n        // 工作变量，避免修改原始值
    
    // 使用位操作计算设置位的个数
    while num != 0 {
        count += num & 1    // 检查最低位是否为1
        num >>= 1           // 右移一位，检查下一位
    }
    
    return count
}

// 使用Swift内置函数的替代实现
func minimumBitFlipsBuiltIn(_ p: Int, _ q: Int) -> Int {
    let xorResult = p ^ q                    // 异或运算
    return xorResult.nonzeroBitCount        // 使用内置函数计算非零位数
}

// 测试用例
print("=== 最少位翻转算法 ===")
print("算法原理：对两个数进行异或运算，然后计算结果中1的个数")
print()

// 示例测试用例
let testCases = [
    (10, 20),         // 预期结果：4位
    (7, 10),          // 预期结果：3位  
    (0, 15),          // 预期结果：4位
    (5, 5),           // 预期结果：0位
    (1, 1000000000)   // 大数测试
]

for (p, q) in testCases {
    let result = minimumBitFlips(p, q)
    print("P=\(p), Q=\(q) -> 需要翻转 \(result) 位")
    
    // 对较小的数字显示二进制表示
    if p < 100 && q < 100 {
        print("  二进制: \(String(p, radix: 2)) -> \(String(q, radix: 2))")
        print("  异或值: \(String(p ^ q, radix: 2))")
    }
    print()
}