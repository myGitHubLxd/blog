import Foundation

// 读取输入数据
let p = Int(readLine()!)!  // 读取消息P的值
let q = Int(readLine()!)!  // 读取消息Q的值

// 计算最少需要翻转的位数
func minimumBitFlips(_ p: Int, _ q: Int) -> Int {
    // 使用异或运算找出不同的位
    // XOR操作：相同位为0，不同位为1
    let xorResult = p ^ q
    
    // 使用Swift内置函数计算XOR结果中1的个数
    // 每个1代表一个需要翻转的位
    return xorResult.nonzeroBitCount
}

// 输出结果
print(minimumBitFlips(p, q))