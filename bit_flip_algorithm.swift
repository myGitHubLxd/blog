import Foundation

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

// Main function to read input and solve
func solve() {
    print("Enter message P:")
    guard let input1 = readLine(), let p = Int(input1) else {
        print("Invalid input for P")
        return
    }
    
    print("Enter message Q:")
    guard let input2 = readLine(), let q = Int(input2) else {
        print("Invalid input for Q")
        return
    }
    
    let result = minimumBitFlips(p, q)
    print(result)
}

// Test function with sample cases
func testSolution() {
    print("Testing the solution:")
    
    // Test case 1: P = 10, Q = 20
    // Binary: 10 = 1010, 20 = 10100
    // XOR: 1010 ^ 10100 = 11110 (4 bits different)
    let test1 = minimumBitFlips(10, 20)
    print("Test 1 - P=10, Q=20: \(test1) bits to flip")
    
    // Test case 2: P = 7, Q = 10
    // Binary: 7 = 111, 10 = 1010
    // XOR: 0111 ^ 1010 = 1101 (3 bits different)
    let test2 = minimumBitFlips(7, 10)
    print("Test 2 - P=7, Q=10: \(test2) bits to flip")
    
    // Test case 3: P = 0, Q = 15
    // Binary: 0 = 0000, 15 = 1111
    // XOR: 0000 ^ 1111 = 1111 (4 bits different)
    let test3 = minimumBitFlips(0, 15)
    print("Test 3 - P=0, Q=15: \(test3) bits to flip")
    
    // Test case 4: P = 5, Q = 5 (same numbers)
    let test4 = minimumBitFlips(5, 5)
    print("Test 4 - P=5, Q=5: \(test4) bits to flip")
}

// Run the program
print("=== Minimum Bit Flips Algorithm ===")
print("This program finds the minimum number of bits to flip to convert P to Q")
print()

testSolution()
print()
solve()