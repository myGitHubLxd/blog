import Foundation

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

// 主函数：读取输入并求解
func solve() {
    print("请输入消息P:")
    guard let input1 = readLine(), let p = Int(input1) else {
        print("P的输入无效")
        return
    }
    
    print("请输入消息Q:")
    guard let input2 = readLine(), let q = Int(input2) else {
        print("Q的输入无效")
        return
    }
    
    let result = minimumBitFlips(p, q)
    print(result)
}

// 测试函数，包含示例用例
func testSolution() {
    print("测试解决方案:")
    
    // 测试用例1: P = 10, Q = 20
    // 二进制: 10 = 1010, 20 = 10100
    // 异或: 1010 ^ 10100 = 11110 (4位不同)
    let test1 = minimumBitFlips(10, 20)
    print("测试1 - P=10, Q=20: 需要翻转 \(test1) 位")
    
    // 测试用例2: P = 7, Q = 10
    // 二进制: 7 = 111, 10 = 1010
    // 异或: 0111 ^ 1010 = 1101 (3位不同)
    let test2 = minimumBitFlips(7, 10)
    print("测试2 - P=7, Q=10: 需要翻转 \(test2) 位")
    
    // 测试用例3: P = 0, Q = 15
    // 二进制: 0 = 0000, 15 = 1111
    // 异或: 0000 ^ 1111 = 1111 (4位不同)
    let test3 = minimumBitFlips(0, 15)
    print("测试3 - P=0, Q=15: 需要翻转 \(test3) 位")
    
    // 测试用例4: P = 5, Q = 5 (相同数字)
    let test4 = minimumBitFlips(5, 5)
    print("测试4 - P=5, Q=5: 需要翻转 \(test4) 位")
}

// 运行程序
print("=== 最少位翻转算法 ===")
print("本程序用于找到将P转换为Q所需翻转的最少位数")
print()

testSolution()
print()
solve()