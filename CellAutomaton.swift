import Foundation

/**
 * 细胞自动机算法实现
 * 问题描述：由8个房屋组成的群体，排成一行，每天进行状态更新
 * 规则：如果两个相邻单元格状态相同（都是1或都是0），则该单元格第二天变为0（不活跃）
 *      否则该单元格第二天变为1（活跃）
 */
class CellAutomaton {
    
    /**
     * 计算细胞自动机在指定天数后的状态
     * @param states: 初始状态数组，包含8个元素，每个元素为0或1
     * @param days: 需要模拟的天数
     * @return: 经过指定天数后的细胞状态数组
     */
    func cellCompete(_ states: [Int], _ days: Int) -> [Int] {
        // 如果天数为0，直接返回原状态
        if days == 0 {
            return states
        }
        
        // 创建当前状态的副本，避免修改原数组
        var currentStates = states
        
        // 循环模拟每一天的状态变化
        for day in 1...days {
            // 创建新的状态数组来存储下一天的状态
            var nextStates = Array(repeating: 0, count: currentStates.count)
            
            // 遍历每个细胞位置
            for i in 0..<currentStates.count {
                // 获取左邻居的状态（边界处理：最左边的细胞左邻居视为0）
                let leftNeighbor = (i == 0) ? 0 : currentStates[i - 1]
                
                // 获取右邻居的状态（边界处理：最右边的细胞右邻居视为0）
                let rightNeighbor = (i == currentStates.count - 1) ? 0 : currentStates[i + 1]
                
                // 应用规则：如果左右邻居状态相同，该细胞变为不活跃(0)
                // 如果左右邻居状态不同，该细胞变为活跃(1)
                if leftNeighbor == rightNeighbor {
                    nextStates[i] = 0  // 邻居状态相同，变为不活跃
                } else {
                    nextStates[i] = 1  // 邻居状态不同，变为活跃
                }
            }
            
            // 更新当前状态为下一天的状态
            currentStates = nextStates
            
            // 打印每天的状态变化（用于调试）
            print("第\(day)天: \(formatStates(currentStates))")
        }
        
        return currentStates
    }
    
    /**
     * 格式化状态数组为字符串，方便显示
     * @param states: 状态数组
     * @return: 格式化后的字符串
     */
    private func formatStates(_ states: [Int]) -> String {
        return states.map { $0 == 1 ? "●" : "○" }.joined(separator: " ")
    }
    
    /**
     * 运行示例和测试
     */
    func runExample() {
        print("=== 细胞自动机算法演示 ===")
        print("规则说明：")
        print("- 如果相邻两个细胞状态相同（都是0或都是1），该细胞下一天变为0（不活跃）")
        print("- 如果相邻两个细胞状态不同，该细胞下一天变为1（活跃）")
        print("- 边界细胞的外侧邻居视为0")
        print()
        
        // 示例1：基本测试
        let initialStates1 = [1, 0, 0, 0, 0, 1, 0, 0]
        let days1 = 1
        
        print("示例1:")
        print("初始状态: \(formatStates(initialStates1))")
        print("天数: \(days1)")
        
        let result1 = cellCompete(initialStates1, days1)
        print("最终结果: \(formatStates(result1))")
        print("数组形式: \(result1)")
        print()
        
        // 示例2：多天演化
        let initialStates2 = [1, 1, 1, 0, 1, 1, 1, 1]
        let days2 = 2
        
        print("示例2:")
        print("初始状态: \(formatStates(initialStates2))")
        print("天数: \(days2)")
        
        let result2 = cellCompete(initialStates2, days2)
        print("最终结果: \(formatStates(result2))")
        print("数组形式: \(result2)")
        print()
    }
}

// 创建实例并运行示例
let automaton = CellAutomaton()
automaton.runExample()