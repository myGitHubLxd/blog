# Minimum Bit Flips Algorithm

## Problem Statement
Find the minimum number of bits that must be flipped to convert message P to message Q.

## Algorithm Approach

### Key Insight
To convert number P to number Q, we need to flip exactly those bits where P and Q differ. This is equivalent to finding the Hamming distance between P and Q.

### Steps:
1. **XOR Operation**: Compute `P ^ Q` (XOR of P and Q)
   - XOR gives us 1 where bits differ, 0 where they are the same
   
2. **Count Set Bits**: Count the number of 1-bits in the XOR result
   - Each 1-bit represents a position where we need to flip a bit

### Example:
```
P = 10 (binary: 1010)
Q = 20 (binary: 10100)

XOR = 1010 ^ 10100 = 11110
Count of 1s in 11110 = 4

Therefore, minimum flips needed = 4
```

## Swift Implementation

### Method 1: Manual Bit Counting
```swift
func minimumBitFlips(_ p: Int, _ q: Int) -> Int {
    let xorResult = p ^ q
    var count = 0
    var num = xorResult
    
    while num != 0 {
        count += num & 1
        num >>= 1
    }
    
    return count
}
```

### Method 2: Built-in Function
```swift
func minimumBitFlips(_ p: Int, _ q: Int) -> Int {
    let xorResult = p ^ q
    return xorResult.nonzeroBitCount
}
```

## Complexity Analysis
- **Time Complexity**: O(log(max(P, Q))) - proportional to number of bits
- **Space Complexity**: O(1) - constant extra space

## Edge Cases
- P = Q: Returns 0 (no flips needed)
- P = 0 or Q = 0: Returns count of set bits in the non-zero number
- Negative numbers: Works correctly due to two's complement representation

## Constraints Handling
The algorithm efficiently handles the given constraints:
- -10^4 ≤ num1, num2 ≤ 10^9
- Works for both positive and negative integers