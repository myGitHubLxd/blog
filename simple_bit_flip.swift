// Minimum Bit Flips Algorithm in Swift
// Problem: Find minimum number of bits to flip to convert P to Q

func minimumBitFlips(_ p: Int, _ q: Int) -> Int {
    // XOR gives us the bits that are different between p and q
    let xorResult = p ^ q
    
    // Count the number of 1-bits in the XOR result
    return countSetBits(xorResult)
}

func countSetBits(_ n: Int) -> Int {
    var count = 0
    var num = n
    
    // Count set bits using bit manipulation
    while num != 0 {
        count += num & 1
        num >>= 1
    }
    
    return count
}

// Alternative implementation using built-in function
func minimumBitFlipsBuiltIn(_ p: Int, _ q: Int) -> Int {
    let xorResult = p ^ q
    return xorResult.nonzeroBitCount
}

// Test cases
print("=== Minimum Bit Flips Algorithm ===")
print("Algorithm: XOR the two numbers, then count set bits in result")
print()

// Example test cases
let testCases = [
    (10, 20),   // Expected: 4 bits
    (7, 10),    // Expected: 3 bits  
    (0, 15),    // Expected: 4 bits
    (5, 5),     // Expected: 0 bits
    (1, 1000000000) // Large number test
]

for (p, q) in testCases {
    let result = minimumBitFlips(p, q)
    print("P=\(p), Q=\(q) -> \(result) bits to flip")
    
    // Show binary representation for smaller numbers
    if p < 100 && q < 100 {
        print("  Binary: \(String(p, radix: 2)) -> \(String(q, radix: 2))")
        print("  XOR:    \(String(p ^ q, radix: 2))")
    }
    print()
}